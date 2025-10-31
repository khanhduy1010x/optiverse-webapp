import * as React from 'react';
import { ParticipantEvent, RoomEvent, Track } from 'livekit-client';
import type {
    MessageDecoder,
    MessageEncoder,
    TrackReferenceOrPlaceholder,
    WidgetState,
} from '@livekit/components-core';
import {
    isEqualTrackRef,
    isLocal,
    isTrackReference,
    isWeb,
    log,
} from '@livekit/components-core';
import type { MessageFormatter } from '@livekit/components-react';


import {
    CarouselLayout,
    ConnectionStateToast,
    FocusLayoutContainer,
    GridLayout,
    LayoutContextProvider,
    RoomAudioRenderer,
    useLocalParticipant,
    useParticipants,
    useRoomContext,
} from '@livekit/components-react';
import FocusLayout from './FocusLayout';

import { useCreateLayoutContext } from '@livekit/components-react';
import { usePinnedTracks, useTracks } from '@livekit/components-react';
import { Chat } from '@livekit/components-react';
import { CustomControlBar } from './CustomControlBar';
import Icon from '../../../../components/common/Icon/Icon.component';

import { ParticipantTile } from './ParticipantTile';
import { useEffect } from 'react';
/**
 * @public
 */
export interface VideoConferenceProps
    extends React.HTMLAttributes<HTMLDivElement> {
    chatMessageFormatter?: MessageFormatter;
    chatMessageEncoder?: MessageEncoder;
    chatMessageDecoder?: MessageDecoder;
    /** @alpha */
    SettingsComponent?: React.ComponentType;
    // Microphone state callback
    onMicrophoneStateChange?: (isMicrophoneEnabled: boolean) => void;
    // Custom control bar props
    roomId?: string;
    roomName?: string;
    workspaceId?: string;
    isAdmin?: boolean;
    isManager?: boolean;
    onNotesToggle?: () => void;
    notesOpen?: boolean;
    onSpeechToggle?: () => void;
    speechOpen?: boolean;
    onChatOpen?: () => void;
    setChatOpen?: (open: boolean) => void;
    chatOpen?: boolean;
    setPendingOpen?: (open: boolean) => void;
    pendingOpen?: boolean;
    setNotesOpen?: (open: boolean) => void;
    setSpeechOpen?: (open: boolean) => void;
    setRecordingOpen?: (open: boolean) => void;
    recordingOpen?: boolean;
    // speech recording state from parent (VideoRoom)
    isRecording?: boolean;
    recordingReady?: boolean;
    // 👥 Members list and setter
    members?: any[];
    setMembers?: (members: any[]) => void;
    onMicTrackChange?: (track: MediaStreamTrack | null) => void;
}
export function useMicTrack() {
    const { localParticipant } = useLocalParticipant();
    const track = localParticipant
        ?.getTrackPublication(Track.Source.Microphone)
        ?.track
        ?.mediaStreamTrack;
    return track ?? null;
}
/**
 * The `VideoConference` ready-made component is your drop-in solution for a classic video conferencing application.
 * It provides functionality such as focusing on one participant, grid view with pagination to handle large numbers
 * of participants, basic non-persistent chat, screen sharing, and more.
 *
 * @remarks
 * The component is implemented with other LiveKit components like `FocusContextProvider`,
 * `GridLayout`, `ControlBar`, `FocusLayoutContainer` and `FocusLayout`.
 * You can use these components as a starting point for your own custom video conferencing application.
 */
export function CustomVideoConference({
    onMicTrackChange,
    chatMessageFormatter,
    chatMessageDecoder,
    chatMessageEncoder,
    SettingsComponent,
    onMicrophoneStateChange,
    roomId,
    roomName,
    workspaceId,
    isAdmin,
    isManager,
    onNotesToggle,
    notesOpen,
    onSpeechToggle,
    speechOpen,
    onChatOpen,
    setChatOpen,
    chatOpen,
    setNotesOpen,
    setSpeechOpen,
    setPendingOpen,
    pendingOpen,
    setRecordingOpen,
    recordingOpen,
    onRoomReady,
    isRecording,
    recordingReady,
    members,
    setMembers,
    ...props
}: VideoConferenceProps & { onRoomReady?: (room: any) => void }) {
    const room = useRoomContext();
    const participants = useParticipants();
    const { localParticipant } = useLocalParticipant();


    React.useEffect(() => {

        if (!room) {
            console.log('⛔ No room yet');
            return;
        }
        const lp = room.localParticipant;
        if (!lp) {
            console.log('⛔ No localParticipant yet');
            return;
        }

        const updateMicTrack = () => {
            const track =
                lp.getTrackPublication(Track.Source.Microphone)?.track?.mediaStreamTrack ??
                null;



            onMicTrackChange?.(track);
        };

        // run once on mount / when room changes
        console.log('✅ MicTrack effect mounted for', lp.identity);
        updateMicTrack();

        // react to publish/unpublish of mic
        const onPub = (pub: any) => {
            if (pub.source === Track.Source.Microphone) {
                console.log('📢 ParticipantEvent.TrackPublished (mic)');
                updateMicTrack();
            }
        };
        const onUnpub = (pub: any) => {
            if (pub.source === Track.Source.Microphone) {
                console.log('📢 ParticipantEvent.TrackUnpublished (mic)');
                updateMicTrack();
            }
        };

        // also handle device changes that republish local tracks
        const onLocalPub = (pub: any) => {
            if (pub.source === Track.Source.Microphone) {
                console.log('📢 RoomEvent.LocalTrackPublished (mic)');
                updateMicTrack();
            }
        };
        const onLocalUnpub = (pub: any) => {
            if (pub.source === Track.Source.Microphone) {
                console.log('📢 RoomEvent.LocalTrackUnpublished (mic)');
                updateMicTrack();
            }
        };

        lp.on(ParticipantEvent.TrackPublished, onPub);
        lp.on(ParticipantEvent.TrackUnpublished, onUnpub);
        room.on(RoomEvent.LocalTrackPublished, onLocalPub);
        room.on(RoomEvent.LocalTrackUnpublished, onLocalUnpub);

        return () => {
            console.log('🧹 MicTrack effect cleanup for', lp.identity);
            lp.off(ParticipantEvent.TrackPublished, onPub);
            lp.off(ParticipantEvent.TrackUnpublished, onUnpub);
            room.off(RoomEvent.LocalTrackPublished, onLocalPub);
            room.off(RoomEvent.LocalTrackUnpublished, onLocalUnpub);
        };
    }, [room, onMicTrackChange]);

    React.useEffect(() => {
        if (room) onRoomReady?.(room);
    }, [room, onRoomReady]);

    // 👥 Update members list when participants change
    const previousCountRef = React.useRef<number>(0);
    // 👥 Update members list + mic/cam states when participants change
    React.useEffect(() => {
        if (!participants) return;

        const enrichedMembers = participants.map((p) => {
            const micPub = p.getTrackPublication(Track.Source.Microphone);
            const camPub = p.getTrackPublication(Track.Source.Camera);

            let avatarUrl: string | null = null;
            let host = false;
            let admin = false;
            try {
                const meta = p.metadata ? JSON.parse(p.metadata) : {};
                avatarUrl = meta.avatarUrl || null;
                host = meta.isOwner || false;
                admin = meta.isAdmin || false;
            } catch {
                avatarUrl = null;
            }

            return {
                sid: p.sid,
                name: p.name || p.identity,
                identity: p.identity,
                isSpeaking: p.isSpeaking,
                micEnabled: micPub ? !micPub.isMuted : false,
                camEnabled: camPub ? !camPub.isMuted : false,
                joinedAt: (p as any).joinedAt ?? undefined,
                kind: p.kind,
                avatarUrl,
                host,
                admin,
                isCurrent: isLocal(p),
            };
        });

        console.table(enrichedMembers);

        setMembers?.(enrichedMembers);

        const currentCount = participants.length;
        const previousCount = previousCountRef.current;

        if (previousCount > 0) {
            if (currentCount > previousCount) {
                console.log(`🔔 Member joined! (${previousCount} → ${currentCount})`);
                playTingSound();
            } else if (currentCount < previousCount) {
                console.log(`🚪 Member left! (${previousCount} → ${currentCount})`);
                playTeoSound();
            }
        }

        previousCountRef.current = currentCount;
    }, [participants, setMembers]);




    const [widgetState, setWidgetState] = React.useState<WidgetState>({
        showChat: false,
        unreadMessages: 0,
        showSettings: false,
    });


    // Get LiveKit microphone state
    const { isMicrophoneEnabled, microphoneTrack } = useLocalParticipant();

    // Notify parent when microphone state changes
    React.useEffect(() => {
        onMicrophoneStateChange?.(isMicrophoneEnabled);
    }, [isMicrophoneEnabled, onMicrophoneStateChange]);

    const lastAutoFocusedScreenShareTrack =
        React.useRef<TrackReferenceOrPlaceholder | null>(null);

    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        {
            updateOnlyOn: [RoomEvent.ActiveSpeakersChanged],
            onlySubscribed: false,
        },
    );

    const widgetUpdate = (state: WidgetState) => {
        log.debug('updating widget state', state);
        setWidgetState(state);
    };

    const layoutContext = useCreateLayoutContext();

    // Remote recording state from socket events
    const [remoteRecording, setRemoteRecording] = React.useState(false);
    const [remoteRecordingStart, setRemoteRecordingStart] = React.useState<Date | null>(null);
    const [remoteElapsedSec, setRemoteElapsedSec] = React.useState<number>(0);

    // Listen for speech recording start/stop events dispatched by useSpeechStream
    React.useEffect(() => {
        const onRecordingStart = (ev: any) => {
            const detail = ev?.detail || {};
            const startedAt = detail.startedAt ? new Date(detail.startedAt) : new Date();
            setRemoteRecordingStart(startedAt);
            setRemoteRecording(true);
        };
        const onRecordingStop = () => {
            setRemoteRecording(false);
            setRemoteRecordingStart(null);
            setRemoteElapsedSec(0);
        };

        window.addEventListener('speech:recording-start', onRecordingStart as EventListener);
        window.addEventListener('speech:recording-stop', onRecordingStop as EventListener);
        return () => {
            window.removeEventListener('speech:recording-start', onRecordingStart as EventListener);
            window.removeEventListener('speech:recording-stop', onRecordingStop as EventListener);
        };
    }, []);

    // Timer for remote recording
    React.useEffect(() => {
        if (!remoteRecording || !remoteRecordingStart) return;
        const id = setInterval(() => {
            setRemoteElapsedSec(Math.floor((Date.now() - remoteRecordingStart.getTime()) / 1000));
        }, 1000);
        // update immediately
        setRemoteElapsedSec(Math.floor((Date.now() - remoteRecordingStart.getTime()) / 1000));
        return () => clearInterval(id);
    }, [remoteRecording, remoteRecordingStart]);

    // 🔊 Sound effect functions
    const playTingSound = () => {
        // Create a simple "ting" sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Ting sound: high pitch, short duration
        oscillator.frequency.value = 800; // Hz
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    };

    const playTeoSound = () => {
        // Create a simple "tèo" sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Tèo sound: low pitch, medium duration, descending
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.2);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    };

    const screenShareTracks = tracks
        .filter(isTrackReference)
        .filter(
            (track) => track.publication.source === Track.Source.ScreenShare,
        );

    const focusTrack = usePinnedTracks(layoutContext)?.[0];
    const carouselTracks = tracks.filter(
        (track) => !isEqualTrackRef(track, focusTrack),
    );

    React.useEffect(() => {
        // Auto pin screen share if available
        if (
            screenShareTracks.some((t) => t.publication.isSubscribed) &&
            lastAutoFocusedScreenShareTrack.current === null
        ) {
            log.debug('Auto set screen share focus:', {
                newScreenShareTrack: screenShareTracks[0],
            });
            layoutContext.pin.dispatch?.({
                msg: 'set_pin',
                trackReference: screenShareTracks[0],
            });
            lastAutoFocusedScreenShareTrack.current = screenShareTracks[0];
        } else if (
            lastAutoFocusedScreenShareTrack.current &&
            !screenShareTracks.some(
                (t) =>
                    t.publication.trackSid ===
                    lastAutoFocusedScreenShareTrack.current?.publication?.trackSid,
            )
        ) {
            log.debug('Auto clearing screen share focus.');
            layoutContext.pin.dispatch?.({ msg: 'clear_pin' });
            lastAutoFocusedScreenShareTrack.current = null;
        }

        if (focusTrack && !isTrackReference(focusTrack)) {
            const updatedFocusTrack = tracks.find(
                (tr) =>
                    tr.participant.identity === focusTrack.participant.identity &&
                    tr.source === focusTrack.source,
            );
            if (
                updatedFocusTrack !== focusTrack &&
                isTrackReference(updatedFocusTrack)
            ) {
                layoutContext.pin.dispatch?.({
                    msg: 'set_pin',
                    trackReference: updatedFocusTrack,
                });
            }
        }
    }, [
        screenShareTracks
            .map(
                (ref) =>
                    `${ref.publication.trackSid}_${ref.publication.isSubscribed}`,
            )
            .join(),
        focusTrack?.publication?.trackSid,
        tracks,
    ]);



    return (
        <div className="lk-video-conference transition-all duration-500" {...props} style={{ position: 'relative', width: '100%', height: '100%' }}>
            {isWeb() && (
                <LayoutContextProvider
                    value={layoutContext}
                    onWidgetChange={widgetUpdate}
                >
                    <div className="lk-video-conference-inner transition-all duration-500 pb-20" style={{ width: '100%', height: '100%' }}>
                        {!focusTrack ? (
                            <div className="lk-grid-layout-wrapper" style={{ width: '100%', height: '100%' }}>
                                <GridLayout tracks={tracks}>
                                    <ParticipantTile />
                                </GridLayout>
                            </div>
                        ) : (
                            <div className="lk-focus-layout-wrapper" style={{ width: '100%', height: '100%' }}>
                                <FocusLayoutContainer>
                                    <CarouselLayout tracks={carouselTracks}>
                                        <ParticipantTile />
                                    </CarouselLayout>
                                    {focusTrack && <FocusLayout trackRef={focusTrack} />}
                                </FocusLayoutContainer>
                            </div>
                        )}
                        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
                            <CustomControlBar
                                controls={{ chat: true, settings: !!SettingsComponent }}
                                roomId={roomId}
                                roomName={roomName}
                                workspaceId={workspaceId}
                                isAdmin={isAdmin}
                                isManager={isManager}
                                onNotesToggle={onNotesToggle}
                                notesOpen={notesOpen}
                                onSpeechToggle={onSpeechToggle}
                                speechOpen={speechOpen}
                                onChatOpen={() => setChatOpen?.(!chatOpen)}
                                setChatOpen={setChatOpen}
                                chatOpen={chatOpen}
                                setNotesOpen={setNotesOpen}
                                setSpeechOpen={setSpeechOpen}
                                setPendingOpen={setPendingOpen}
                                pendingOpen={pendingOpen}
                                setRecordingOpen={setRecordingOpen}
                                recordingOpen={recordingOpen}
                            />
                        </div>
                    </div>

                    <Chat
                        style={{

                            display: widgetState.showChat ? 'grid ' : 'none',

                        }}
                        messageFormatter={chatMessageFormatter}
                        messageEncoder={chatMessageEncoder}
                        messageDecoder={chatMessageDecoder}
                    />

                    {SettingsComponent && (
                        <div
                            className="lk-settings-menu-modal"
                            style={{
                                display: widgetState.showSettings ? 'block' : 'none',
                            }}
                        >
                            <SettingsComponent />
                        </div>
                    )}
                </LayoutContextProvider>
            )}

            {/* Chat panel is handled at VideoRoom level via RoomContext bridge */}

            {/* Speech-to-text indicator (bottom-left) — show only when SpeechPanel reports "Chờ mic..." state */}
            {(recordingReady && isRecording) || remoteRecording ? (
                <div
                    style={{
                        position: 'absolute',
                        left: '16px',
                        bottom: '16px',
                        zIndex: 60,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        pointerEvents: 'none',
                    }}
                >
                    {/* --- Local recording indicator --- */}
                    {recordingReady && isRecording && (
                        <div className="relative flex items-center justify-center h-8 w-8">
                            {/* Vòng xoay */}
                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-red-500 animate-spin"></div>

                            {/* Nền tối + icon */}
                            <div className="flex items-center justify-center h-full w-full bg-[rgba(39,39,39,0.95)] rounded-full shadow-md">
                                <Icon name="stt2" size={22} className="text-red-400 ml-2.5" />
                            </div>
                        </div>
                    )}

                    {/* --- Remote recording indicator --- */}
                    {remoteRecording && (
                        <div
                            title="Remote recording in progress"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                height: 32

                            }}
                        >

                            <button
                                type="button"
                                aria-label="Recording in progress"
                                style={{
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 10px',
                                    borderRadius: 6,
                                    fontSize: 12,
                                    cursor: 'default',
                                }}
                            >
                                ●                                 {new Date(remoteElapsedSec * 1000).toISOString().substr(11, 8)}

                            </button>

                            <div
                                style={{
                                    fontVariantNumeric: 'tabular-nums',
                                    fontSize: 12,
                                    color: '#f3f4f6',
                                }}
                            >
                            </div>
                        </div>
                    )}
                </div>
            ) : null}

            {/* Room Name - shown at top-left when no panels are open */}
            {roomName && !(recordingOpen || speechOpen || notesOpen || pendingOpen || chatOpen) && (
                <div
                    style={{
                        position: 'absolute',
                        right: '16px',
                        bottom: '16px',
                        zIndex: 60,
                        backgroundColor: 'rgba(39,39,39,0.95)',
                        color: '#e5e5e5',
                        padding: '6px 10px',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        fontSize: 12,
                        fontWeight: 500,
                        maxWidth: '200px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                    title={roomName}
                >
                    {roomName}
                </div>
            )}


            <RoomAudioRenderer />
            <ConnectionStateToast />
        </div>
    );
}
