import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspaceChat } from '../../hooks/chat/useWorkspaceChat';
import { useGroupChatPage } from '../../hooks/chat/useGroupChatPage';
import { useGroupConversationTheme } from '../../hooks/chat/useGroupConversationTheme';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { useWorkspaceWebSocket } from '../../hooks/websocket/useWorkspaceWebSocket';
import workspaceService from '../../services/workspace.service';

// Reuse 100% group chat components
import GroupChatHeader from '../../components/chat/GroupChatHeader';
import MessageSearchForm from '../../components/chat/MessageSearchForm';
import MessageInput from '../../components/chat/MessageInput';
import GroupThemeSelector from '../../components/chat/GroupThemeSelector';
import MessageItem from '../chat/MessageItem.screen';
import DrawingBoard from '../../components/chat/DrawingBoard';

/**
 * Workspace Chat Page
 * Reuse 100% group chat UI và logic từ ChatPage
 * Chỉ khác: filter theo workspaceId và auto-create/sync
 */
const WorkspaceChatPage: React.FC = () => {
  const { t } = useAppTranslate('chat');
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState<any>(null);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showDrawingBoard, setShowDrawingBoard] = useState(false);

  // ✅ FIX: useRef để track đã tạo chat chưa (tránh loop)
  const chatCreatedRef = useRef(false);
  const workspaceLoadedRef = useRef(false);

  // 🔍 DEBUG: Log component lifecycle
  useEffect(() => {
    console.log('🎬 WorkspaceChatPage MOUNTED');
    return () => {
      console.log('💀 WorkspaceChatPage UNMOUNTED');
    };
  }, []);

  // Drawing board handlers - Reuse từ ChatPage
  const handleOpenDrawingBoard = () => {
    setShowDrawingBoard(true);
  };

  const handleCloseDrawingBoard = () => {
    setShowDrawingBoard(false);
  };

  const handleSendDrawing = async (imageBlob: Blob) => {
    if (workspaceChat?.id) {
      const file = new File([imageBlob], 'drawing.png', { type: 'image/png' });
      
      const fakeEvent = {
        target: {
          files: [file]
        }
      } as any;
      
      await groupChatData?.handleFileChange?.(fakeEvent);
      await groupChatData?.handleSendGroupMessage?.();
      
      setShowDrawingBoard(false);
    }
  };

  // Hook để lấy workspace chat (filter theo workspaceId)
  const {
    workspaceChat,
    users: workspaceChatUsers,
    loading: chatLoading,
    error: chatError,
    createWorkspaceChatIfNotExists,
    syncMembers,
    fetchUsersForMembers, // ✅ NEW: Method để fetch users cho danh sách memberIds
  } = useWorkspaceChat(workspaceId || null);

  // Reuse 100% group chat hook
  const groupChatData = useGroupChatPage(workspaceChat?.id || null);

  // Reuse group theme hook
  const groupTheme = useGroupConversationTheme(workspaceChat?.id || '');

  // ✅ STEP 1: Load workspace info CHỈ 1 LẦN khi mount
  useEffect(() => {
    const loadWorkspace = async () => {
      if (!workspaceId || workspaceLoadedRef.current) return;

      try {
        console.log('📂 Loading workspace info...');
        const workspaceDetail = await workspaceService.getWorkspaceById(workspaceId);
        setWorkspace(workspaceDetail);
        workspaceLoadedRef.current = true;
        console.log('✅ Workspace loaded:', workspaceDetail.name);
        
        // ✅ Fetch users info từ workspace members (không đợi Firebase)
        const activeMemberIds = workspaceDetail.members?.active?.map((m: any) => m.user_id) || [];
        console.log('👥 Workspace active members:', activeMemberIds);
        await fetchUsersForMembers(activeMemberIds);
      } catch (error) {
        console.error('❌ Failed to load workspace:', error);
      }
    };

    loadWorkspace();
  }, [workspaceId]); // ✅ CHỈ phụ thuộc workspaceId

  // ✅ WebSocket: Listen for workspace changes (members added/removed)
  const { socket } = useWorkspaceWebSocket({
    workspaceId: workspaceId || null,
    isDashboard: false, // Chat page, not dashboard
  });

  // ✅ Listen for workspace update events
  useEffect(() => {
    if (!socket || !workspaceId) return;

    const handleWorkspaceUpdate = async (data: any) => {
      console.log('🔔 Workspace updated event:', data);
      
      // Re-fetch workspace data
      try {
        const workspaceDetail = await workspaceService.getWorkspaceById(workspaceId);
        setWorkspace(workspaceDetail);
        
        // Re-fetch users
        const activeMemberIds = workspaceDetail.members?.active?.map((m: any) => m.user_id) || [];
        console.log('👥 Re-fetching users after workspace update:', activeMemberIds);
        await fetchUsersForMembers(activeMemberIds);
      } catch (error) {
        console.error('❌ Failed to reload workspace:', error);
      }
    };

    // Listen to multiple events that might change members
    socket.on('workspace:member-added', handleWorkspaceUpdate);
    socket.on('workspace:member-removed', handleWorkspaceUpdate);
    socket.on('workspace:member-role-changed', handleWorkspaceUpdate);
    socket.on('workspace:updated', handleWorkspaceUpdate);

    return () => {
      socket.off('workspace:member-added', handleWorkspaceUpdate);
      socket.off('workspace:member-removed', handleWorkspaceUpdate);
      socket.off('workspace:member-role-changed', handleWorkspaceUpdate);
      socket.off('workspace:updated', handleWorkspaceUpdate);
    };
  }, [socket, workspaceId]);

  // ✅ STEP 2: Auto-create chat CHỈ 1 LẦN khi workspace loaded và chat chưa tồn tại
  useEffect(() => {
    const createChatOnce = async () => {
      if (!workspace || chatCreatedRef.current || chatLoading) return;

      // Nếu chat đã tồn tại, không cần tạo
      if (workspaceChat) {
        console.log('✅ Workspace chat already exists');
        chatCreatedRef.current = true;
        return;
      }

      try {
        console.log('🔨 Creating workspace chat...');
        const memberIds = workspace.members?.active?.map((m: any) => m.user_id) || [];
        
        await createWorkspaceChatIfNotExists(
          workspace.name,
          memberIds
        );
        
        chatCreatedRef.current = true;
        console.log('✅ Workspace chat created');
      } catch (error) {
        console.error('❌ Failed to create workspace chat:', error);
      }
    };

    createChatOnce();
  }, [workspace, workspaceChat, chatLoading]); // ✅ Dependencies rõ ràng

  // ✅ STEP 3: Sync members CHỈ KHI có thay đổi thực sự (debounced)
  // 🔧 FIX: useMemo để tránh re-trigger do object reference thay đổi
  const memberIdsString = useMemo(() => {
    const memberIds = workspace?.members?.active?.map((m: any) => m.user_id).sort() || [];
    console.log('🔄 Workspace active members:', memberIds);
    return JSON.stringify(memberIds);
  }, [workspace?.members?.active]);

  const chatMemberIdsString = useMemo(() => {
    const activeMembers = Object.entries(workspaceChat?.groupMembers || {})
      .filter(([_, member]: [string, any]) => member.status === 'active')
      .map(([userId]) => userId)
      .sort();
    console.log('💬 Chat active members:', activeMembers);
    return JSON.stringify(activeMembers);
  }, [workspaceChat?.groupMembers]);

  useEffect(() => {
    console.log('🔄 STEP 3 useEffect triggered:', { 
      hasWorkspace: !!workspace, 
      hasChat: !!workspaceChat,
      chatCreated: chatCreatedRef.current,
      memberIdsString,
      chatMemberIdsString
    });

    // Chỉ sync khi đã có workspace và chat
    if (!workspace || !workspaceChat || !chatCreatedRef.current) return;

    const handleMembersSync = async () => {
      const memberIds = workspace.members?.active?.map((m: any) => m.user_id) || [];
      const currentChatMembers = Object.entries(workspaceChat.groupMembers || {})
        .filter(([_, member]: [string, any]) => member.status === 'active')
        .map(([userId]) => userId);
      
      // Chỉ sync nếu có thay đổi thực sự
      const hasChanges = memberIds.length !== currentChatMembers.length || 
        memberIds.some((id: string) => !currentChatMembers.includes(id)) ||
        currentChatMembers.some((id: string) => !memberIds.includes(id));
      
      if (hasChanges) {
        console.log('🔄 Syncing workspace members (changes detected)');
        console.log('  Expected members:', memberIds);
        console.log('  Current chat members:', currentChatMembers);
        await syncMembers(memberIds);
        
        // ✅ Re-fetch users info sau khi sync
        console.log('👥 Re-fetching users after sync...');
        await fetchUsersForMembers(memberIds);
      } else {
        console.log('⏭️ No changes detected, skip syncing');
      }
    };

    // Debounce 1 giây để tránh sync liên tục
    const timeoutId = setTimeout(handleMembersSync, 1000);
    return () => clearTimeout(timeoutId);
  }, [memberIdsString, chatMemberIdsString]); // ✅ Use string comparison instead of object reference

  // ✅ Get workspace members with user info - MUST BE BEFORE EARLY RETURNS
  const workspaceMembersWithInfo = useMemo(() => {
    if (!workspace?.members?.active) return [];
    
    return workspace.members.active.map((member: any) => {
      const userInfo = workspaceChatUsers[member.user_id];
      return {
        ...member,
        userInfo,
      };
    });
  }, [workspace?.members?.active, workspaceChatUsers]);

  // Get active members count - ✅ LẤY TỪ WORKSPACE, không phải từ workspaceChat
  const activeMembersCount = workspace?.members?.active?.length || 0;

  const textColor = groupTheme.theme?.textColor || '#000';
  const backgroundColor = groupTheme.theme?.backgroundColor || '#fff';

  // Helper function để get initials
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // ✅ ALL HOOKS ABOVE, CONDITIONAL RETURNS BELOW
  // Bỏ loading screen để tránh flicker mỗi lần gửi tin
  // Chỉ show error hoặc null state

  if (chatError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <p>Không thể tải chat: {chatError}</p>
          <button
            onClick={() => navigate(`/workspace/${workspaceId}/dashboard`)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Quay lại Workspace
          </button>
        </div>
      </div>
    );
  }

  if (!workspaceChat) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Creating workspace chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full max-h-full overflow-hidden" style={{ backgroundColor }}>
      <style>
        {`
          .scroll-to-bottom-btn {
            position: absolute;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background-color: #21b4ca;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.18);
            transition: all 0.2s cubic-bezier(.4,0,.2,1);
            z-index: 30;
            opacity: 0;
            border: 2px solid white;
          }
          
          .scroll-to-bottom-btn.visible {
            opacity: 1;
          }
          
          .scroll-to-bottom-btn:hover {
            background-color: #1a9db0;
            box-shadow: 0 3px 12px rgba(0,0,0,0.22);
            transform: translateX(-50%) scale(1.05);
          }
        `}
      </style>

      {/* Left Sidebar - Members List - Fixed height */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{workspace?.name || 'Workspace'}</h2>
          <p className="text-sm text-gray-500">{activeMembersCount} members</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Members
          </h3>
          {/* ✅ LẤY MEMBERS TỪ WORKSPACE, không phải từ Firebase chat */}
          {workspaceMembersWithInfo.map((member: any) => {
              const userInfo = member.userInfo;
              return (
                <div
                  key={member.user_id}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
                >
                  {userInfo?.avatar_url ? (
                    <img
                      src={userInfo.avatar_url}
                      alt={userInfo.full_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                      {userInfo?.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {userInfo?.full_name || 'Loading...'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {member.role === 'admin' || member.role === 'owner' ? 'Admin' : 'Member'}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Main Chat Area - Reuse 100% Group Chat Components - Fixed height */}
      <div className="flex-1 flex flex-col h-full max-h-full overflow-hidden" style={{ color: textColor }}>
        {/* Group Chat Header - Reuse */}
        <GroupChatHeader
          textColor={textColor}
          groupName={workspaceChat.name}
          memberCount={activeMembersCount}
          groupAvatar={workspaceChat.avatar}
          getInitials={getInitials}
          activeConversationId={workspaceChat.id}
          handleTogglePinConversation={() => groupChatData?.handleTogglePinConversation(workspaceChat.id)}
          isConversationPinned={groupChatData?.isGroupConversationPinned || (() => false)}
          showMessageSearch={groupChatData?.showMessageSearch || false}
          setShowMessageSearch={groupChatData?.setShowMessageSearch || (() => {})}
          showPinnedMessages={showPinnedMessages}
          setShowPinnedMessages={setShowPinnedMessages}
          showThemeSelector={showThemeSelector}
          setShowThemeSelector={setShowThemeSelector}
          t={t}
        />

        {/* Message Search Form - Reuse */}
        <MessageSearchForm
          showMessageSearch={groupChatData?.showMessageSearch || false}
          messageSearchQuery={groupChatData?.messageSearchQuery || ''}
          setMessageSearchQuery={groupChatData?.setMessageSearchQuery || (() => {})}
          handleMessageSearchSubmit={groupChatData?.handleMessageSearchSubmit || (() => {})}
          clearSearch={groupChatData?.clearSearch || (() => {})}
          searchLoading={groupChatData?.searchLoading || false}
          searchError={groupChatData?.searchError || null}
          searchResults={groupChatData?.searchResults || []}
          messageRefs={groupChatData?.messageRefs || { current: {} }}
          setHighlightedMessageId={groupChatData?.setHighlightedMessageId || (() => {})}
        />

        {/* Chat Content Container - Fixed để tránh scroll dài */}
        <div className="flex-1 flex min-h-0 max-h-full overflow-hidden relative">
          {/* Chat Messages - Fixed height container */}
          <div className="flex-1 flex flex-col overflow-hidden max-h-full">
            {/* Pinned Messages Section - Reuse từ ChatPage */}
            {groupChatData?.pinnedMessages && groupChatData.pinnedMessages.length > 0 && (
              <div
                className={`border-b border-gray-200 bg-[#e6f7f9] transition-all duration-300 ${
                  showPinnedMessages ? 'max-h-60 overflow-y-auto' : 'max-h-12 overflow-hidden'
                }`}
              >
                <div
                  className="p-2 flex items-center justify-between cursor-pointer"
                  onClick={() => setShowPinnedMessages(!showPinnedMessages)}
                >
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1h-2zm-5 8.274l-.818 2.552c-.25.78.128 1.623.899 1.923 1.612.631 3.42.631 5.032 0 .77-.3 1.148-1.143.899-1.923L11.193 10.3 10.5 10l-.689.3z" />
                    </svg>
                    <span>{groupChatData.pinnedMessages.length} pinned message(s)</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${showPinnedMessages ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {showPinnedMessages && (
                  <div className="space-y-1 p-2">
                    {groupChatData.pinnedMessages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className="p-2 bg-white rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          const messageRef = groupChatData?.messageRefs?.current[msg.id];
                          if (messageRef) {
                            messageRef.scrollIntoView({
                              behavior: 'smooth',
                              block: 'center',
                            });
                            groupChatData.setHighlightedMessageId?.(msg.id);
                          }
                        }}
                      >
                        <div className="text-xs text-gray-600 font-medium">
                          {groupChatData.groupUsers?.[msg.senderId]?.full_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-800 truncate">{msg.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages Container - Reuse từ ChatPage - Fixed height để tránh scroll dài */}
            <div
              ref={groupChatData?.messageContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 messages-container"
              onScroll={groupChatData?.handleScroll}
              style={{ 
                backgroundColor,
                flex: '1 1 auto',
                minHeight: 0
              }}
            >
              {groupChatData?.groupMessages && groupChatData.groupMessages.length > 0 ? (
                groupChatData.groupMessages.map((message: any) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    conversationId={workspaceChat.id}
                    isCurrentUser={message.senderId === groupChatData.currentUserId}
                    users={groupChatData.groupUsers || {}}
                    onReply={groupChatData.handleReplyToMessage}
                    onPin={groupChatData.handleTogglePinMessage}
                    messageRef={(el: HTMLDivElement | null) => {
                      if (el && groupChatData.messageRefs) {
                        groupChatData.messageRefs.current[message.id] = el;
                      }
                    }}
                    highlight={groupChatData.highlightedMessageId === message.id}
                    textColor={textColor}
                    isGroupChat={true}
                    showSenderName={true}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm mt-1">Start the conversation!</p>
                  </div>
                </div>
              )}

              {/* Scroll to bottom button */}
              {groupChatData?.isScrolledUp && (
                <button
                  onClick={groupChatData.scrollToBottom}
                  className={`scroll-to-bottom-btn ${groupChatData.isScrolledUp ? 'visible' : ''}`}
                  title="Scroll to bottom"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              )}
            </div>

            {/* Message Input - Reuse từ ChatPage 100% - Fixed at bottom */}
            <div className="border-t border-gray-200 flex-shrink-0">
              <MessageInput
                messageText={groupChatData?.messageText || ''}
                setMessageText={groupChatData?.setMessageText}
                handleMessageChange={groupChatData?.handleMessageChange}
                handleSendMessage={groupChatData?.handleSendGroupMessage}
                handleFileChange={groupChatData?.handleFileChange}
                handleRemoveImage={groupChatData?.handleRemoveImage}
                handleOpenFileDialog={groupChatData?.handleOpenFileDialog}
                handleEmojiClick={groupChatData?.handleEmojiClick}
                selectedImages={groupChatData?.selectedImages || []}
                showEmojiPicker={groupChatData?.showEmojiPicker}
                setShowEmojiPicker={groupChatData?.setShowEmojiPicker}
                replyToMessage={groupChatData?.replyToMessage}
                handleCancelReply={groupChatData?.handleCancelReply}
                renderReplyPreview={groupChatData?.renderReplyPreview}
                registerInputRef={groupChatData?.registerInputRef}
                fileInputRef={groupChatData?.fileInputRef}
                messageInputRef={groupChatData?.messageInputRef}
                emojiPickerRef={groupChatData?.emojiPickerRef}
                handleInputFocusEvent={groupChatData?.handleInputFocusEvent}
                handleInputBlurEvent={groupChatData?.handleInputBlurEvent}
                handlePasteImage={groupChatData?.handlePasteImage}
                isGroupChat={true}
                groupName={workspaceChat.name}
                memberCount={Object.keys(workspaceChat.members || {}).length}
                onOpenDrawingBoard={handleOpenDrawingBoard}
              />
            </div>
          </div>

          {/* Theme Selector Sidebar - Reuse */}
          <GroupThemeSelector
            conversationId={workspaceChat.id}
            onClose={() => setShowThemeSelector(false)}
            isOpen={showThemeSelector}
          />
        </div>
      </div>

      {/* Drawing Board - Reuse từ ChatPage */}
      {showDrawingBoard && (
        <DrawingBoard
          isOpen={showDrawingBoard}
          onClose={handleCloseDrawingBoard}
          onSendDrawing={handleSendDrawing}
        />
      )}
    </div>
  );
};

export default WorkspaceChatPage;
