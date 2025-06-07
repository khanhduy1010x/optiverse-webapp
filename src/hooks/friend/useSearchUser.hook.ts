import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchUsersProps } from '../../types/friend/props/component.props';

export const EMAIL_DOMAINS = [
  { value: '@gmail.com', label: '@gmail.com' },
  { value: '@fpt.edu.vn', label: '@fpt.edu.vn' },
  { value: 'custom', label: 'Other' },
];

export const useSearchUser = (props: SearchUsersProps) => {
  const {
    searchEmail,
    onSearchEmailChange,
    onSearch,
    searchedUsers,
    friends,
    sentRequests,
    pendingRequests,
  } = props;
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(EMAIL_DOMAINS[0].value);
  const [customDomain, setCustomDomain] = useState('@');
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const customDomainInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchEmail) setHasSearched(false);
  }, [searchEmail]);

  useEffect(() => {
    const email = showCustomDomain
      ? username + customDomain
      : username + selectedDomain;
    onSearchEmailChange(email);
  }, [
    username,
    selectedDomain,
    customDomain,
    showCustomDomain,
    onSearchEmailChange,
  ]);

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedDomain(value);
    setShowCustomDomain(value === 'custom');
    if (value === 'custom') {
      setTimeout(() => customDomainInputRef.current?.focus(), 0);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes('@')) {
      const parts = value.split('@');
      setUsername(parts[0]);
      setSelectedDomain('custom');
      setCustomDomain(parts[1] ? '@' + parts[1] : '@');
      setShowCustomDomain(true);
      setTimeout(() => customDomainInputRef.current?.focus(), 0);
    } else {
      setUsername(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSearch = () => {
    setHasSearched(true);
    onSearch();
  };

  const handleClearSearch = () => {
    setUsername('');
    setSelectedDomain(EMAIL_DOMAINS[0].value);
    setCustomDomain('@');
    setShowCustomDomain(false);
    setHasSearched(false);
    onSearchEmailChange('');
  };

  const checkFriendStatus = (userId: string) => {
    const isSelf = searchedUsers.find(
      u => (u.userId || (u as any)._id) === userId && u.is_self
    );
    if (isSelf) return 'self';
    if (friends.some(f => f.friend_id === userId)) return 'friend';
    if (pendingRequests.some(r => r.user_id === userId))
      return 'pending_incoming';
    if (sentRequests.some(r => r.friend_id === userId)) return 'sent';
    return 'none';
  };

  return {
    t,
    username,
    selectedDomain,
    customDomain,
    setCustomDomain,
    showCustomDomain,
    hasSearched,
    customDomainInputRef,
    handleDomainChange,
    handleUsernameChange,
    handleKeyPress,
    handleSearch,
    handleClearSearch,
    checkFriendStatus,
  };
};
