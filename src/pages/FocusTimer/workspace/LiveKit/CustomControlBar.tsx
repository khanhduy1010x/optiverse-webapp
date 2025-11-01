import { Track } from 'livekit-client';
import * as React from 'react';
import {
    TrackToggle,
    DisconnectButton,
    MediaDeviceMenu,
    StartMediaButton,
    useLocalParticipantPermissions,
    usePersistentUserChoices,
    useMaybeLayoutContext
} from '@livekit/components-react';
import { supportsScreenSharing } from '@livekit/components-core';

// Custom components
import RecordingPanel from '../RecordingPanel.component';
import Icon from '../../../../components/common/Icon/Icon.component';

/** @public */
export type CustomControlBarControls = {
    microphone?: boolean;
    camera?: boolean;
    chat?: boolean;
    screenShare?: boolean;
    leave?: boolean;
    settings?: boolean;
    // Custom controls
    notes?: boolean;
    recording?: boolean;
    requests?: boolean;
};

const trackSourceToProtocol = (source: Track.Source) => {
    switch (source) {
        case Track.Source.Camera:
            return 1;
        case Track.Source.Microphone:
            return 2;
        case Track.Source.ScreenShare:
            return 3;
        default:
            return 0;
    }
};

/** @public */
export interface CustomControlBarProps extends React.HTMLAttributes<HTMLDivElement> {
    onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
    variation?: 'minimal' | 'verbose' | 'textOnly';
    controls?: CustomControlBarControls;
    saveUserChoices?: boolean;

    // Custom props
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
    setNotesOpen?: (open: boolean) => void,
    setSpeechOpen?: (open: boolean) => void,
    setPendingOpen?: (open: boolean) => void,
    pendingOpen?: boolean;
    setRecordingOpen?: (open: boolean) => void,
    recordingOpen?: boolean;
}

/**
 * Custom ControlBar with additional workspace controls
 */
export function CustomControlBar({
    variation,
    controls,
    saveUserChoices = true,
    onDeviceError,
    roomId,
    roomName,
    workspaceId,
    isAdmin = false,
    isManager = false,
    onNotesToggle,
    notesOpen = false,
    onSpeechToggle,
    speechOpen = false,
    onChatOpen,
    setChatOpen,
    chatOpen = false,
    setNotesOpen,
    setSpeechOpen,
    setPendingOpen,
    pendingOpen = false,
    setRecordingOpen,
    recordingOpen = false,
    ...props
}: CustomControlBarProps) {
    const [isChatOpen, setIsChatOpen] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const layoutContext = useMaybeLayoutContext();
    const dispatch = layoutContext?.widget?.dispatch;
    const closeChat = () => dispatch?.({ msg: 'hide_chat' });

    React.useEffect(() => {
        if (layoutContext?.widget.state?.showChat !== undefined) {
            setIsChatOpen(layoutContext?.widget.state?.showChat);
        }
    }, [layoutContext?.widget.state?.showChat]);

    // 🔐 Helper function to close all panels
    const closeAllPanels = React.useCallback(() => {
        setNotesOpen?.(false);
        setSpeechOpen?.(false);
        setPendingOpen?.(false);
        setRecordingOpen?.(false);
        setChatOpen?.(false);
        dispatch?.({ msg: 'hide_chat' });
    }, [setNotesOpen, setSpeechOpen, setPendingOpen, setRecordingOpen, setChatOpen, dispatch]);

    // 📝 Handle Notes toggle - close other panels first
    const handleNotesToggle = React.useCallback((newState: boolean) => {
        if (newState) {
            closeAllPanels();
            setNotesOpen?.(true);
        } else {
            setNotesOpen?.(false);
        }
    }, [closeAllPanels, setNotesOpen]);

    // 💬 Handle Chat toggle - close other panels first
    const handleChatToggle = React.useCallback((newState: boolean) => {
        if (newState) {
            closeAllPanels();
            setChatOpen?.(true);
        } else {
            setChatOpen?.(false);
        }
    }, [closeAllPanels, setChatOpen]);

    // 🎤 Handle Speech toggle - close other panels first
    const handleSpeechToggle = React.useCallback((newState: boolean) => {
        if (newState) {
            closeAllPanels();
            setSpeechOpen?.(true);
        } else {
            setSpeechOpen?.(false);
        }
    }, [closeAllPanels, setSpeechOpen]);

    // ⏳ Handle Pending toggle - close other panels first
    const handlePendingToggle = React.useCallback((newState: boolean) => {
        if (newState) {
            closeAllPanels();
            setPendingOpen?.(true);
        } else {
            setPendingOpen?.(false);
        }
    }, [closeAllPanels, setPendingOpen]);

    // 🎙️ Handle Recording toggle - close other panels first
    const handleRecordingToggle = React.useCallback((newState: boolean) => {
        if (newState) {
            closeAllPanels();
            setRecordingOpen?.(true);
        } else {
            setRecordingOpen?.(false);
        }
    }, [closeAllPanels, setRecordingOpen]);

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isTooLittleSpace = window.innerWidth < (isChatOpen ? 1000 : 760);

    const defaultVariation = isTooLittleSpace ? 'minimal' : 'verbose';
    variation ??= defaultVariation;

    const visibleControls = {
        leave: true,
        notes: true,
        recording: isAdmin || isManager,
        requests: isManager,
        ...controls
    };

    const localPermissions = useLocalParticipantPermissions();

    if (!localPermissions) {
        visibleControls.camera = false;
        visibleControls.chat = false;
        visibleControls.microphone = false;
        visibleControls.screenShare = false;
    } else {
        const canPublishSource = (source: Track.Source) => {
            return (
                localPermissions.canPublish &&
                (localPermissions.canPublishSources.length === 0 ||
                    localPermissions.canPublishSources.includes(trackSourceToProtocol(source)))
            );
        };
        visibleControls.camera ??= canPublishSource(Track.Source.Camera);
        visibleControls.microphone ??= canPublishSource(Track.Source.Microphone);
        visibleControls.screenShare ??= canPublishSource(Track.Source.ScreenShare);
        visibleControls.chat ??= localPermissions.canPublishData && controls?.chat;
    }

    const showIcon = true;
    const showText = false;

    const browserSupportsScreenSharing = supportsScreenSharing();
    const [isScreenShareEnabled, setIsScreenShareEnabled] = React.useState(false);

    const onScreenShareChange = React.useCallback(
        (enabled: boolean) => {
            setIsScreenShareEnabled(enabled);
        },
        [setIsScreenShareEnabled],
    );

    const htmlProps = { className: 'lk-control-bar', ...props };

    const {
        saveAudioInputEnabled,
        saveVideoInputEnabled,
        saveAudioInputDeviceId,
        saveVideoInputDeviceId,
    } = usePersistentUserChoices({ preventSave: !saveUserChoices });

    const microphoneOnChange = React.useCallback(
        (enabled: boolean, isUserInitiated: boolean) =>
            isUserInitiated ? saveAudioInputEnabled(enabled) : null,
        [saveAudioInputEnabled],
    );

    const cameraOnChange = React.useCallback(
        (enabled: boolean, isUserInitiated: boolean) =>
            isUserInitiated ? saveVideoInputEnabled(enabled) : null,
        [saveVideoInputEnabled],
    );

    return (
        <div {...htmlProps} className='backdrop-blur-3xl bg-white/10' style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap', padding: '12px 20px', borderRadius: '50px', backdropFilter: 'blur(10px)' }}>
            {/* Microphone */}
            {visibleControls.microphone && (
                <div className="lk-button-group  !hover:bg-gray-500" style={{ borderRadius: '50%' }}>
                    <TrackToggle
                        className='!bg-black !hover:bg-gray-500'
                        source={Track.Source.Microphone}
                        showIcon={showIcon}
                        onChange={microphoneOnChange}
                        onDeviceError={(error) => onDeviceError?.({ source: Track.Source.Microphone, error })}
                    />
                    <div className="lk-button-group-menu">
                        <MediaDeviceMenu
                            kind="audioinput"
                            onActiveDeviceChange={(_kind, deviceId) => {
                                console.log('🎤 MediaDeviceMenu onActiveDeviceChange fired:', {
                                    kind: _kind,
                                    deviceId,
                                    timestamp: new Date().toISOString(),
                                });
                                console.log('📢 Dispatching mic:device-changed event...');
                                window.dispatchEvent(new CustomEvent('mic:device-changed', {
                                    detail: { deviceId },
                                    bubbles: true,
                                    composed: true
                                }));
                                console.log('✅ Event dispatched successfully');
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Camera */}
            {visibleControls.camera && (
                <div className="lk-button-group" style={{ borderRadius: '50%' }}>
                    <TrackToggle
                        className='!bg-black !hover:bg-gray-500'

                        source={Track.Source.Camera}
                        showIcon={showIcon}
                        onChange={cameraOnChange}
                        onDeviceError={(error) => onDeviceError?.({ source: Track.Source.Camera, error })}
                    />
                    <div className="lk-button-group-menu">
                        <MediaDeviceMenu
                            kind="videoinput"
                            onActiveDeviceChange={(_kind, deviceId) =>
                                saveVideoInputDeviceId(deviceId ?? 'default')
                            }
                        />
                    </div>
                </div>
            )}
            {visibleControls.screenShare && browserSupportsScreenSharing && (
                <div className="lk-button-group custom-radius-full bg-black" style={{ borderRadius: '50%' }}>
                    <TrackToggle
                        className='!bg-black'

                        source={Track.Source.ScreenShare}
                        captureOptions={{ audio: true, selfBrowserSurface: 'include' }}
                        showIcon={showIcon}
                        onChange={onScreenShareChange}
                        onDeviceError={(error) => onDeviceError?.({ source: Track.Source.ScreenShare, error })}
                        title={isScreenShareEnabled ? 'Stop screen share' : 'Share screen'}
                    />
                </div>
            )}
            {visibleControls.requests && roomId && (
                <button
                    onClick={() => handlePendingToggle(!pendingOpen)}
                    className={`lk-button !bg-black ${pendingOpen ? 'lk-button-menu-active' : ''}`}
                    style={{ borderRadius: '50%', width: '44px', height: '44px', minWidth: '44px' }}
                    title="Pending Requests"
                >
                    <Icon name="group" size={28} />
                </button>
            )}
            {/* More Options Menu */}
            <div
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className={`lk-button !bg-black ${isMenuOpen ? 'lk-button-menu-active' : ''}`}
                ref={menuRef}
                style={{ position: 'relative', borderRadius: '50%', width: '44px', height: '44px', minWidth: '44px' }}
            >
                <button style={{ borderRadius: '50%' }} title="More options">
                    <Icon name='moreHoriz' size={24} />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginBottom: '8px',
                            backgroundColor: 'var(--lk-bg2)',
                            borderRadius: '8px',
                            padding: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            minWidth: '200px',
                            zIndex: 1000
                        }}
                    >
                        {/* Notes */}
                        {visibleControls.notes && (
                            <button
                                onClick={() => {
                                    handleNotesToggle(!notesOpen);
                                }}
                                className={`lk-button ${notesOpen ? 'lk-button-menu-active' : ''}`}
                                style={{
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    gap: '12px',
                                    padding: '10px 12px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                title={notesOpen ? 'Close Notes' : 'Open Notes'}
                            >
                                <Icon name='note' size={26} className='pl-2' />
                                <span style={{ fontSize: '14px' }}>Notes</span>
                            </button>
                        )}

                        {/* Chat */}
                        {visibleControls.chat && (
                            <button
                                onClick={() => {
                                    handleChatToggle(!chatOpen);
                                }}
                                className={`lk-button ${chatOpen ? 'lk-button-menu-active' : ''}`}
                                style={{
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    gap: '12px',
                                    padding: '10px 12px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                title={chatOpen ? 'Close Chat' : 'Open Chat'}
                            >
                                <Icon name='message' size={24} className='ml-1' />
                                <span style={{ fontSize: '14px' }}>Chat</span>
                            </button>
                        )}

                        {/* Recording Button */}
                        {visibleControls.recording && roomName && roomId && (
                            <button
                                style={{
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    gap: '12px',
                                    padding: '10px 12px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                className="lk-button"
                                onClick={() => handleRecordingToggle(!recordingOpen)}
                                aria-pressed={recordingOpen}
                            >
                                <Icon name="record" size={24} className='pl-2' />
                                <span style={{ fontSize: '14px' }}>Recording</span>
                            </button>
                        )}
                        <button
                            onClick={() => {
                                handleSpeechToggle(!speechOpen);
                            }}
                            className={`lk-button ${speechOpen ? 'lk-button-menu-active' : ''}`}
                            style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                gap: '12px',
                                padding: '10px 12px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            title={speechOpen ? 'Close Speech Panel' : 'Open Speech Panel'}
                        >
                            <Icon name='stt' size={24} className='pl-1' />
                            <span style={{ fontSize: '14px' }}>Speech To Text</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Settings */}
            {visibleControls.settings && (
                <button className="lk-button lk-button-menu" style={{ borderRadius: '50%', width: '44px', height: '44px', minWidth: '44px' }} title="Settings">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            )}

            {/* Leave */}
            {visibleControls.leave && (
                <div className="lk-button-group custom-radius-full-leave " style={{ borderRadius: '50%' }}>
                    <DisconnectButton>
                        <svg
                            className="w-5 h-5"
                            viewBox="0 0 25 25"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M16.5 15V19.5H5.5V5.5H16.5V10M10 12.5H22.5"
                                stroke="currentColor"
                                strokeWidth="1.2"
                            />
                            <path
                                d="M20 10L22.5 12.5L20 15"
                                stroke="currentColor"
                                strokeWidth="1.2"
                            />
                        </svg>
                    </DisconnectButton>
                </div>
            )}

            <StartMediaButton />
        </div>
    );
}