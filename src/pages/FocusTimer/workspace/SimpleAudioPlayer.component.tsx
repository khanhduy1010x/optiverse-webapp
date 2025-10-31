import React, { useEffect, useRef, useState } from 'react';
import { useAppTranslate } from '../../../hooks/useAppTranslate';

interface SimpleAudioPlayerProps {
    audioUrl: string;
    isPlaying: boolean;
    onPlayStateChange?: (isPlaying: boolean) => void;
    containerHeight?: string;
}

const SimpleAudioPlayer: React.FC<SimpleAudioPlayerProps> = ({
    audioUrl,
    isPlaying,
    onPlayStateChange,
    containerHeight = '60px',
}) => {
    const { t } = useAppTranslate('focus-room');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);
    const isDraggingRef = useRef(false);
    const wasPlayingRef = useRef(false);

    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // ✅ Init audio only once or when audioUrl changes
    useEffect(() => {
        const audio = new Audio(audioUrl);
        audio.crossOrigin = 'anonymous';
        audioRef.current = audio;

        const handleLoadedMetadata = () => setDuration(audio.duration || 0);
        const handleTimeUpdate = () => {
            if (!isDraggingRef.current) setCurrentTime(audio.currentTime);
        };
        const handleEnded = () => {
            onPlayStateChange?.(false);
            setCurrentTime(0);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.pause();
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioUrl]);

    // ✅ Play / Pause controller
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.play().catch((err) => {
                console.error('Error playing audio:', err);
                onPlayStateChange?.(false);
            });
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    // Format time mm:ss
    const formatTime = (seconds: number) => {
        if (!seconds || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Drag logic
    const handleProgressMouseDown = (e: React.MouseEvent) => {
        if (!audioRef.current) return;
        isDraggingRef.current = true;
        wasPlayingRef.current = !audioRef.current.paused;

        // Pause temporarily, don't update parent
        audioRef.current.pause();

        updateProgress(e);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDraggingRef.current) updateProgress(e as any);
    };

    const handleMouseUp = () => {
        if (!audioRef.current || !isDraggingRef.current) return;
        isDraggingRef.current = false;

        if (wasPlayingRef.current) {
            audioRef.current.play().catch((err) => console.error(err));
            onPlayStateChange?.(true);
        }

        setCurrentTime(audioRef.current.currentTime);

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const updateProgress = (e: React.MouseEvent | MouseEvent) => {
        if (!progressRef.current || !audioRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const newTime = percent * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div
            className="w-full flex flex-col gap-3 p-3 rounded-2xl"
            style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
        >
            {/* Top Section: Play Button + Time */}
            <div className="flex items-center gap-3">
                {/* Play / Pause Button */}
                <button
                    onClick={() => onPlayStateChange?.(!isPlaying)}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300"
                    style={{
                        background: isPlaying
                            ? 'linear-gradient(135deg, #ef5350 0%, #e53935 100%)'
                            : 'linear-gradient(135deg, #666 0%, #555 100%)',
                        boxShadow: isPlaying
                            ? '0 4px 12px rgba(239, 83, 80, 0.4)'
                            : '0 2px 8px rgba(0, 0, 0, 0.3)',
                    }}
                    title={isPlaying ? t('recording.pause') : t('recording.play')}
                >
                    {isPlaying ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="5" width="3" height="14" />
                            <rect x="15" y="5" width="3" height="14" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                {/* Time Display */}
                <div className="flex-1 flex items-center justify-between px-2">
                    <span className="text-xs font-medium text-gray-300">{formatTime(currentTime)}</span>
                    <span className="text-xs font-medium text-gray-500">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Progress Bar with Enhanced Styling */}
            <div className="flex items-center gap-3 px-1">
                <div
                    ref={progressRef}
                    className="flex-1 h-1 bg-gray-700 rounded-full cursor-pointer group relative "
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
                    }}
                    onMouseDown={handleProgressMouseDown}
                >
                    {/* Filled portion */}
                    <div
                        className="h-full rounded-full transition-all duration-75"
                        style={{
                            width: `${progressPercent}%`,
                            background: 'linear-gradient(90deg, #ef5350 0%, #e53935 100%)',
                            boxShadow: '0 0 12px rgba(239, 83, 80, 0.6)',
                        }}
                    />

                    {/* Draggable dot - Always visible */}
                    <div
                        className="absolute top-2 -translate-y-1/2 rounded-full transition-all duration-100 z-30"
                        style={{
                            left: `${progressPercent}%`,
                            transform: 'translate(-50%, -50%)',
                            width: isPlaying ? '14px' : '12px',
                            height: isPlaying ? '14px' : '12px',
                            background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
                            boxShadow: isPlaying
                                ? '0 4px 16px rgba(239, 83, 80, 0.5), 0 0 8px rgba(255, 255, 255, 0.8)'
                                : '0 2px 8px rgba(0, 0, 0, 0.4)',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default SimpleAudioPlayer;
