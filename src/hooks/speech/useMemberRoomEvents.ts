import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

type UseMemberRoomEventsOptions = {
  socket: Socket | null;
  roomId: string;
  isOpen: boolean;
  onParticipantJoined?: (data: { user_id: string; room_id: string }) => void;
  onParticipantLeft?: (data: { user_id: string; room_id: string }) => void;
  onError?: (error: { error: string; message?: string }) => void;
};

/**
 * Hook để quản lý WebSocket events cho member presence trong live room
 * - Join vào member-room khi vào room
 * - Listen những events: participant_joined, participant_left
 * - Phát tiếng khi có người join/leave
 */
export function useMemberRoomEvents({
  socket,
  roomId,
  isOpen,
  onParticipantJoined,
  onParticipantLeft,
  onError,
}: UseMemberRoomEventsOptions) {
  const joinedRef = useRef(false);

  // 1️⃣ Join room khi vào, leave khi đóng
  useEffect(() => {
    if (!socket || !roomId || !isOpen) {
      // Leave room khi panel đóng
      if (joinedRef.current && socket && roomId) {
        console.log(`🚪 Leaving member room: member-room-${roomId}`);
        socket.emit('member_room', { live_room_id: roomId });
        joinedRef.current = false;
      }
      return;
    }

    // Join room khi panel mở
    if (!joinedRef.current) {
      console.log(`📌 Joining member room for room ${roomId}`);
      socket.emit('member_room', { live_room_id: roomId });
      joinedRef.current = true;
    }
  }, [socket, roomId, isOpen]);

  // 2️⃣ Listen for participant events
  useEffect(() => {
    if (!socket) return;

    const handleParticipantJoined = (data: {
      user_id: string;
      room_id: string;
    }) => {
      console.log('👤 Participant joined event received:', data);

      // 🔊 Phát tiếng "ting"
      playTingSound();

      // Call callback
      onParticipantJoined?.(data);
    };

    const handleParticipantLeft = (data: {
      user_id: string;
      room_id: string;
    }) => {
      console.log('👋 Participant left event received:', data);

      // 🔊 Phát tiếng "tèo"
      playTeoSound();

      // Call callback
      onParticipantLeft?.(data);
    };

    // Register listeners
    socket.on('participant_joined', handleParticipantJoined);
    socket.on('participant_left', handleParticipantLeft);

    // Cleanup listeners
    return () => {
      socket.off('participant_joined', handleParticipantJoined);
      socket.off('participant_left', handleParticipantLeft);
    };
  }, [socket, onParticipantJoined, onParticipantLeft]);

  // 3️⃣ Leave room on cleanup
  useEffect(() => {
    return () => {
      if (joinedRef.current && socket && roomId) {
        console.log(`🚪 Cleanup: Leaving member room ${roomId}`);
        socket.emit('member_room', { live_room_id: roomId });
        joinedRef.current = false;
      }
    };
  }, [socket, roomId]);
}

/**
 * Phát tiếng "ting" khi có người join
 */
function playTingSound() {
  try {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // 800 Hz
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (err) {
    console.warn('Failed to play ting sound:', err);
  }
}

/**
 * Phát tiếng "tèo" khi có người leave
 */
function playTeoSound() {
  try {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      300,
      audioContext.currentTime + 0.15
    );
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.15
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (err) {
    console.warn('Failed to play teo sound:', err);
  }
}
