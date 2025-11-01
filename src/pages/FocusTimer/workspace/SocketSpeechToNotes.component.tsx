import React, { useEffect, useState } from 'react';
import useSpeechStream from '../../../hooks/speech/useSpeechStream';

type Props = {
    enabled?: boolean;
    roomId?: string;
    speakerName?: string;
    isRecording?: boolean;
    onRecordingReady?: (isReady: boolean) => void;
    micTrack?: MediaStreamTrack | null;
};

const SocketSpeechToNotes: React.FC<Props> = ({
    enabled = true,
    roomId,
    speakerName,
    isRecording = false,
    onRecordingReady,
    micTrack
}) => {
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [micDeviceId, setMicDeviceId] = useState<string>();

    useEffect(() => {
        const handler = (e: any) => {
            console.log('🎧 mic:device-changed event received:', {
                deviceId: e.detail?.deviceId,
                timestamp: new Date().toISOString(),
            });
            setMicDeviceId(e.detail?.deviceId);
        };
        console.log('🎧 Listening for mic device changes...');
        window.addEventListener('mic:device-changed', handler);
        return () => {
            console.log('🧹 Removing mic device change listener');
            window.removeEventListener('mic:device-changed', handler);
        };
    }, []);

    useEffect(() => {
        // Lấy userId sau khi DOM sẵn sàng
        try {
            const id = localStorage.getItem('user_id');
            if (id) setUserId(id);
        } catch (e) {
            console.warn('⚠️ Cannot access localStorage yet:', e);
        }
    }, []);

    // Debug: Log when micDeviceId changes
    useEffect(() => {
        if (micDeviceId) {
            console.log('📱 micDeviceId state updated:', {
                micDeviceId,
                timestamp: new Date().toISOString(),
            });
        }
    }, [micDeviceId]);

    // Chỉ chạy hook khi có userId & roomId
    const ready = enabled && !!roomId && !!userId;

    // Notify parent when recording readiness changes
    useEffect(() => {
        onRecordingReady?.(ready);
    }, [ready, onRecordingReady]);

    useSpeechStream({
        enabled: ready,
        roomId,
        userId,
        speakerName,
        isRecording: ready && isRecording,
        micDeviceId // Only record when ready AND recording is enabled
    });

    return null;
};

export default SocketSpeechToNotes;
