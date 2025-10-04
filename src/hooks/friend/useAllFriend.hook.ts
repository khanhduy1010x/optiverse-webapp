import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { AllFriendsProps } from '../../types/friend/props/component.props';
import {
  setFriends,
  setSentRequests,
  setPendingRequests,
  setUser,
  setError,
  setLoading,
  setSearchedUsers,
  addFriend,
  acceptFriend,
  cancelFriendRequest,
  removeFriend,
} from '../../store/slices/friend.slice';
import FriendService from '../../services/friend.service';
import { useAppTranslate } from '../useAppTranslate';

export const useAllFriend = ({
  friends,
  loading,
}: Pick<AllFriendsProps, 'friends' | 'loading'>) => {
  const { t } = useAppTranslate('friend');
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const fetchFriends = async () => {
      const friends = await FriendService.viewAllFriends();
      dispatch(setFriends(friends));
    };
    fetchFriends();
  }, []);
  
  const getColorFromString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = hash % 360;
    const hue2 = (hash + 120) % 360;
    return `from-[hsl(${hue1},70%,60%)] to-[hsl(${hue2},70%,45%)]`;
  };

  const totalFriends = useMemo(() => friends.length, [friends]);

  return {
    t,
    getColorFromString,
    totalFriends,
    loading,
    hasNoFriends: totalFriends === 0,
  };
};
