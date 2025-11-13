import React, { useEffect } from 'react';
import { LiveKitRoom, useLocalParticipant, VideoConference, RoomContext } from '@livekit/components-react';
import '@livekit/components-styles';
import NotesPanel from './NotesPanel.component';
import VideoRoomPendingRequests from './VideoRoomPendingRequests.component';
import RecordingPanel from './RecordingPanel.component';
import { CustomVideoConference } from './LiveKit/CustomVideoConference';
import SocketSpeechToNotes from './SocketSpeechToNotes.component';
import SpeechPanel from './SpeechPanel';
import PendingRequestsPanel from './PendingRequestsPanel.component';
import Icon from '../../../components/common/Icon/Icon.component';
import ChatPanel from './ChatPanel.component';
import { usePrompt, useBeforeUnload } from '../../../hooks/usePrompt.hook';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal.component';
import { useAppTranslate } from '../../../hooks/useAppTranslate';

interface VideoRoomProps {
    token: string;
    roomName: string;
    roomId: string;
    isAdmin?: boolean;
    isManager?: boolean;
    workspaceId?: string;
    serverUrl?: string;
    leaveRoom?: () => void;
    isPublic?: boolean;
}

const VideoRoom: React.FC<VideoRoomProps> = ({
    token,
    roomName,
    roomId,
    isAdmin = false,
    isManager = false,
    workspaceId,
    isPublic = false,
    serverUrl = 'wss://optiverse-oci4s4dr.livekit.cloud',
    leaveRoom,
}) => {
    const [notesOpen, setNotesOpen] = React.useState(false);
    const [speechOpen, setSpeechOpen] = React.useState(false);
    const [pendingOpen, setPendingOpen] = React.useState(false);
    const [recordingOpen, setRecordingOpen] = React.useState(false);
    const [chatOpen, setChatOpen] = React.useState(false);
    const [isRecording, setIsRecording] = React.useState(false);
    const [recordingReady, setRecordingReady] = React.useState(false);
    const [isMicrophoneEnabled, setIsMicrophoneEnabled] = React.useState(false);
    const [panelWidth, setPanelWidth] = React.useState(30); // percentage - max 30%
    const [members, setMembers] = React.useState<any[]>([]); // 👥 Store room members
    const containerRef = React.useRef<HTMLDivElement>(null);
    const isResizingRef = React.useRef(false);
    const pendingWidthRef = React.useRef(30);
    const rafRef = React.useRef<number | null>(null);
    const [livekitRoom, setLivekitRoom] = React.useState(null);
    const [micTrack, setMicTrack] = React.useState<MediaStreamTrack | null>(null);
    const [isInVideoCall, setIsInVideoCall] = React.useState(true); // Track if user is in video call
    const { t } = useAppTranslate();
    
    // Block navigation when in video call
    const promptModalState = usePrompt(isInVideoCall, t('leave_video_call_message'));
    useBeforeUnload(isInVideoCall, t('leave_video_call_message'));

    useEffect(() => {
        document.title = roomName ? `${roomName} | OptiVerse` : 'OptiVerse';
    }, [])
    // Handle mouse down on divider
    const handleMouseDown = React.useCallback(() => {
        isResizingRef.current = true;
    }, []);

    // Handle mouse move for resizing with requestAnimationFrame
    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizingRef.current || !containerRef.current) return;

            const container = containerRef.current;
            const containerRect = container.getBoundingClientRect();

            // Calculate panel width from right edge to current mouse position
            const panelPixelWidth = containerRect.right - e.clientX;
            let newPanelWidth = (panelPixelWidth / containerRect.width) * 100;

            // Constraints: min 20%, max 30%
            newPanelWidth = Math.max(20, Math.min(30, newPanelWidth));

            // Store in ref
            pendingWidthRef.current = newPanelWidth;

            // Cancel previous RAF if exists
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }

            // Schedule update with RAF for smooth animation
            rafRef.current = requestAnimationFrame(() => {
                setPanelWidth(pendingWidthRef.current);
                rafRef.current = null;
            });
        };

        const handleMouseUp = () => {
            isResizingRef.current = false;
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };

        document.addEventListener('mousemove', handleMouseMove, { capture: true, passive: true });
        document.addEventListener('mouseup', handleMouseUp, { capture: true, passive: true });

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="flex w-full bg-[#111111] overflow-y-hidden relative"
            style={{ height: 'calc(100vh - 57px)' }}
        >
            {roomId && (
                <SocketSpeechToNotes
                    enabled={true}
                    roomId={roomId}
                    isRecording={isRecording && isMicrophoneEnabled}
                    onRecordingReady={setRecordingReady}
                    micTrack={micTrack}
                />
            )}

            <div className={`overflow-hidden relative ${(notesOpen || speechOpen || pendingOpen || recordingOpen) ? '' : 'w-full'} h-full`}
                style={{
                    paddingRight:
                        (notesOpen || speechOpen || pendingOpen || recordingOpen || chatOpen)
                            ? 0
                            : '8px',
                    width: (notesOpen || speechOpen || pendingOpen || recordingOpen) ? `${100 - panelWidth}%` : '100%',
                    transition: isResizingRef.current ? 'none' : 'width 0.3s ease-out'
                }}>
                <div className="h-full w-full">
                    <LiveKitRoom
                        token={token}
                        serverUrl={serverUrl}
                        connect
                        data-lk-theme="default"
                        style={{
                            height: '100%',
                            width: '100%',
                            margin: 0,
                            padding: 0,
                            overflow: 'hidden',

                        }}
                        onDisconnected={() => {
                            setIsInVideoCall(false); // Disable prompt when call ends
                            leaveRoom?.();
                        }}
                    >
                        <CustomVideoConference
                            onMicrophoneStateChange={setIsMicrophoneEnabled}
                            onRoomReady={setLivekitRoom}
                            isRecording={isRecording}
                            recordingReady={recordingReady}
                            roomId={roomId}
                            roomName={roomName}
                            workspaceId={workspaceId}
                            isAdmin={isAdmin}
                            isManager={isManager}
                            setNotesOpen={setNotesOpen}
                            setSpeechOpen={setSpeechOpen}
                            setPendingOpen={setPendingOpen}
                            setRecordingOpen={setRecordingOpen}
                            setChatOpen={setChatOpen}
                            notesOpen={notesOpen}
                            speechOpen={speechOpen}
                            pendingOpen={pendingOpen}
                            recordingOpen={recordingOpen}
                            chatOpen={chatOpen}
                            members={members}
                            setMembers={setMembers}
                            onMicTrackChange={setMicTrack}
                        />
                    </LiveKitRoom>
                </div>
            </div>

            {/* Divider for resizing */}
            {(notesOpen || speechOpen || pendingOpen || recordingOpen || (livekitRoom && chatOpen)) && (
                <div
                    onMouseDown={handleMouseDown}
                    style={{ userSelect: 'none', cursor: 'col-resize' }}
                    className='flex items-center justify-center px-1'
                >
                    <Icon name='drag' />
                </div  >
            )}

            {notesOpen && <NotesPanel
                isOpen={notesOpen}
                onOpenChange={setNotesOpen}
                roomId={roomId}
                width={panelWidth}
                isResizing={isResizingRef.current}
            />}
            <SpeechPanel
                isOpen={speechOpen}
                onOpenChange={setSpeechOpen}
                roomId={roomId}
                recordingReady={recordingReady}
                isMicrophoneEnabled={isMicrophoneEnabled}
                onRecordingChange={setIsRecording}
                width={panelWidth}
                isResizing={isResizingRef.current}
            />
            {isManager && <PendingRequestsPanel
                isOpen={pendingOpen}
                onOpenChange={setPendingOpen}
                roomId={roomId}
                isManager={isManager}
                workspaceId={workspaceId}
                width={panelWidth}
                isResizing={isResizingRef.current}
                members={members}
                isPublic={isPublic}
            />}
            <RecordingPanel
                isOpen={recordingOpen}
                onOpenChange={setRecordingOpen}
                roomName={roomName}
                roomId={roomId}
                isAdmin={isAdmin}
                isManager={isManager}
                width={panelWidth}
                isResizing={isResizingRef.current}

            />
            {/* ChatPanel is outside LiveKitRoom but wrapped with RoomContext so useChat() works */}
            {livekitRoom && (
                <RoomContext.Provider value={livekitRoom}>
                    <ChatPanel
                        isOpen={chatOpen}
                        onOpenChange={setChatOpen}
                        width={panelWidth}
                        isResizing={isResizingRef.current}
                    />
                </RoomContext.Provider>
            )}

            {/* Custom Confirmation Modal */}
            <ConfirmationModal
                isOpen={promptModalState.isOpen}
                title={t('leave_video_call')}
                message={promptModalState.message}
                confirmText={t('leave_call')}
                cancelText={t('stay')}
                onConfirm={promptModalState.onConfirm}
                onCancel={promptModalState.onCancel}
            />
        </div>
    );
};

export default VideoRoom;
