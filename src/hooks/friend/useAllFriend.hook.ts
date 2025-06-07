import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { AllFriendsProps } from '../../types/friend/props/component.props';

export const useAllFriend = ({
  friends,
  loading,
}: Pick<AllFriendsProps, 'friends' | 'loading'>) => {
  const { t } = useTranslation();

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
