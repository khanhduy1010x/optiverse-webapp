import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../../config/env.config';

type UseSpeechStreamOptions = {
  enabled?: boolean;
  namespace?: string;
  sampleRate?: number;
  roomId?: string;
  userId?: string;
  speakerName?: string;
  isRecording?: boolean;
  micDeviceId?: string; // 🎯 chỉ dùng deviceId
};

/** 🔽 Downsample float32 PCM → target sample rate */
function downsampleBuffer(
  buffer: Float32Array,
  inputSampleRate: number,
  outSampleRate: number
) {
  if (outSampleRate === inputSampleRate) return buffer;
  const ratio = inputSampleRate / outSampleRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0,
      count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult++] = accum / count;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

/** 🔽 Convert Float32 PCM → 16-bit PCM (Int16) */
function floatTo16BitPCM(float32: Float32Array) {
  const buffer = new ArrayBuffer(float32.length * 2);
  const view = new DataView(buffer);
  for (let i = 0, offset = 0; i < float32.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Uint8Array(buffer);
}

/** 🎙️ useSpeechStream — gửi dữ liệu mic qua socket để xử lý Speech-to-Text */
export default function useSpeechStream({
  enabled = true,
  namespace = 'speech',
  sampleRate = 16000,
  roomId,
  userId,
  speakerName,
  isRecording = false,
  micDeviceId,
}: UseSpeechStreamOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  /** 🛰️ Setup WebSocket để nhận/gửi dữ liệu transcription */
  useEffect(() => {
    if (!enabled) return;

    const uid = userId || localStorage.getItem('user_id') || undefined;
    const rid = roomId || localStorage.getItem('room_id') || undefined;
    const spk =
      speakerName ||
      (() => {
        try {
          const u = localStorage.getItem('user');
          if (!u) return uid;
          const parsed = JSON.parse(u);
          return parsed?.fullName || parsed?.displayName || parsed?.name || uid;
        } catch {
          return uid;
        }
      })();

    const socketUrl = `${BASE_URL}${namespace}`;
    const socket = io(socketUrl, {
      transports: ['websocket'],
      withCredentials: true,
      path: '/productivity/socket.io',
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Speech socket connected:', socket.id);
      if (rid && uid) {
        socket.emit('joinRoom', {
          room_id: rid,
          user_id: uid,
          speaker_name: spk || uid,
        });
        console.log('📤 joinRoom emitted', { rid, uid });
      }
    });

    socket.on('connect_error', err =>
      console.error('❌ Speech connect error:', err.message)
    );
    socket.on('transcription', data => {
      if (data?.text) {
        window.dispatchEvent(
          new CustomEvent('focusroom:append-note', {
            detail: { text: data.text + (data.isFinal ? '\n' : ' ') },
          })
        );
      }
    });
    socket.on('recordingStarted', p =>
      window.dispatchEvent(
        new CustomEvent('speech:recording-start', { detail: p })
      )
    );
    socket.on('recordingStopped', p =>
      window.dispatchEvent(
        new CustomEvent('speech:recording-stop', { detail: p })
      )
    );
    socket.on('speechMessage', m =>
      window.dispatchEvent(new CustomEvent('speech:new-message', { detail: m }))
    );

    return () => {
      console.log('🧹 Disconnecting speech socket...');
      socket.disconnect();
    };
  }, [enabled, namespace, roomId, userId, speakerName]);

  /** 🎧 Bắt audio từ micDeviceId và gửi chunk lên server */
  useEffect(() => {
    if (!enabled || !isRecording) {
      cleanupAudio();
      return;
    }

    cleanupAudio(); // clear stream cũ mỗi lần mic đổi

    const startAudio = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          audio: {
            deviceId: micDeviceId ? { exact: micDeviceId } : undefined,
          },
          video: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('🎤 Capturing from mic:', micDeviceId || 'default');
        mediaStreamRef.current = stream;

        const audioCtx = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        sourceRef.current = source;

        // Tạo AudioWorklet để xử lý dữ liệu âm thanh
        const workletCode = `
          class AudioProcessor extends AudioWorkletProcessor {
            process(inputs) {
              const input = inputs[0];
              if (input.length > 0) {
                const channelData = input[0];
                this.port.postMessage({ audioData: Array.from(channelData) });
              }
              return true;
            }
          }
          registerProcessor('audio-processor', AudioProcessor);
        `;
        const blob = new Blob([workletCode], {
          type: 'application/javascript',
        });
        const url = URL.createObjectURL(blob);
        await audioCtx.audioWorklet.addModule(url);

        const node = new AudioWorkletNode(audioCtx, 'audio-processor', {
          numberOfInputs: 1,
          numberOfOutputs: 0,
          channelCount: 1,
        });
        workletNodeRef.current = node;

        node.port.onmessage = event => {
          if (!socketRef.current || !isRecording) return;
          const float32 = new Float32Array(event.data.audioData);
          const down = downsampleBuffer(
            float32,
            audioCtx.sampleRate,
            sampleRate
          );
          const pcm16 = floatTo16BitPCM(down);
          const chars = Array.from(pcm16)
            .map(b => String.fromCharCode(b))
            .join('');
          const b64 = btoa(chars);
          socketRef.current.emit('audioChunk', { chunk: b64 });
        };

        source.connect(node);
        node.connect(audioCtx.destination);
        URL.revokeObjectURL(url);
        console.log('🎧 Audio stream active.');
      } catch (err) {
        console.error('❌ Mic capture failed:', err);
      }
    };

    startAudio();

    return cleanupAudio;
  }, [enabled, isRecording, sampleRate, micDeviceId]);

  /** 🧹 Cleanup helper */
  const cleanupAudio = () => {
    try {
      workletNodeRef.current?.disconnect();
      sourceRef.current?.disconnect();
      audioCtxRef.current?.close();
      mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    } catch {}
  };
}
