import React from 'react';
import { RootItem } from '../../types/note/note.types';
import friendService from '../../services/friend.service';
import { Friend } from '../../types/friend/response/friend.response';
import { useSendNoteToChat } from '../chat/useSendNoteToChat.hook';
import { toast } from 'react-toastify';
import noteService from '../../services/note.service';

export const useSendNoteToChatModal = (
  isOpen: boolean,
  onClose: () => void,
  selectedItem: RootItem | null
) => {
  const [friends, setFriends] = React.useState<Friend[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredFriends, setFilteredFriends] = React.useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = React.useState<Friend[]>([]);
  const [sending, setSending] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [sendProgress, setSendProgress] = React.useState<{
    current: number;
    total: number;
  }>({ current: 0, total: 0 });

  const { sendNoteToChat } = useSendNoteToChat();

  React.useEffect(() => {
    if (isOpen) {
      fetchFriends();
      setSelectedFriends([]);
      setSendProgress({ current: 0, total: 0 });
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFriends(friends);
    } else {
      const filtered = friends.filter(
        friend =>
          friend.friendInfo?.full_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          friend.friendInfo?.email
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      setFilteredFriends(filtered);
    }
  }, [searchQuery, friends]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const friendsList = await friendService.viewAllFriends();
      setFriends(friendsList);
      setFilteredFriends(friendsList);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Could not load friends list');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNote = async () => {
    if (selectedFriends.length === 0 || !selectedItem) return;
    try {
      setSending(true);
      const note = await noteService.fetchNoteById(selectedItem._id);
      if (!note || !note.content) {
        toast.error('Note has no content');
        setSending(false);
        return;
      }

      setSendProgress({ current: 0, total: selectedFriends.length });

      let successCount = 0;
      for (let i = 0; i < selectedFriends.length; i++) {
        const friend = selectedFriends[i];
        setSendProgress({ current: i + 1, total: selectedFriends.length });

        const success = await sendNoteToChat(
          friend.friend_id,
          note.title || 'Untitled Note',
          note.content,
          false // Không hiển thị thông báo cho mỗi lần gửi
        );

        if (success) {
          successCount++;
        }
      }

      // Chỉ hiển thị thông báo khi đã gửi xong tất cả
      if (successCount === selectedFriends.length) {
        toast.success(`Note sent successfully to ${successCount} recipients!`);
      } else if (successCount > 0) {
        toast.info(
          `Note sent to ${successCount} out of ${selectedFriends.length} recipients`
        );
      } else {
        toast.error('Failed to send note to any recipient');
      }

      onClose();
      setSelectedFriends([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Error sending note:', error);
      toast.error('Failed to send note');
    } finally {
      setSending(false);
      setSendProgress({ current: 0, total: 0 });
    }
  };

  const handleFriendSelect = (friend: Friend) => {
    setSelectedFriends(prev => {
      const isAlreadySelected = prev.some(
        f => f.friend_id === friend.friend_id
      );

      if (isAlreadySelected) {
        return prev.filter(f => f.friend_id !== friend.friend_id);
      } else {
        return [...prev, friend];
      }
    });
  };

  const isFriendSelected = (friendId: string) => {
    return selectedFriends.some(friend => friend.friend_id === friendId);
  };

  const selectAllFriends = () => {
    setSelectedFriends(filteredFriends);
  };

  const deselectAllFriends = () => {
    setSelectedFriends([]);
  };

  return {
    friends,
    loading,
    searchQuery,
    setSearchQuery,
    filteredFriends,
    selectedFriends,
    sending,
    isFocused,
    setIsFocused,
    handleSendNote,
    handleFriendSelect,
    isFriendSelected,
    selectAllFriends,
    deselectAllFriends,
    sendProgress,
  };
};
