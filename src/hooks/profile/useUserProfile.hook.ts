import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profile.service';
import streakService from '../../services/streak.service';
import { ProfileData } from '../../types/profile/response/profile.response';
import { StreakResponse } from '../../types/streak/streak.types';

export function useUserProfile() {
  const navigate = useNavigate();

  const [avatar, setAvatar] = useState<string>(
    'https://via.placeholder.com/96'
  );
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('profile');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    _id: '',
    email: '',
    full_name: '',
    has_password: false,
  });
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [streakData, setStreakData] = useState<StreakResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchStreakData();
  }, []);

  useEffect(() => {
    if (profileData.avatar) {
      setAvatar(profileData.avatar);
    }
  }, [profileData.avatar]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await profileService.getProfile();
      setProfileData(data);
      setNewFullName(data.full_name);
      console.log('Profile data:', data.has_password);
      if (data.avatar) {
        setAvatar(data.avatar);
      }
    } catch (error: any) {
      console.error('Failed to fetch profile data:', error);
      setError(
        error.message || 'Failed to load profile data. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStreakData = async () => {
    try {
      const data = await streakService.getUserStreak();
      setStreakData(data);
    } catch (error: any) {
      console.error('Failed to fetch streak data:', error);
    }
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploadingAvatar(true);
        setError(null);

        const result = await profileService.updateAvatar(file);
        setAvatar(result.avatar);
        setProfileData((prev: ProfileData) => ({
          ...prev,
          avatar: result.avatar,
        }));
      } catch (error: any) {
        console.error('Failed to update avatar:', error);
        setError(error.message || 'Failed to update avatar. Please try again.');
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleNavigate = (menuKey: string, path: string) => {
    setSelectedMenu(menuKey);
    navigate(path);
  };

  const startEditingName = () => {
    setNewFullName(profileData.full_name);
    setIsEditingName(true);
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
  };

  const saveFullName = async () => {
    if (newFullName.trim() === '') return;
    try {
      setIsSaving(true);
      setError(null);
      const updated = await profileService.updateProfile({
        full_name: newFullName.trim(),
      });
      setProfileData(updated);
      setIsEditingName(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setError(error.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setError(null);
      await profileService.logout();
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message || 'Failed to logout.');
      setIsLoggingOut(false);
    }
  };

  const handleViewAvatar = () => {
    setShowAvatarModal(true);
    setShowAvatarMenu(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFullName(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveFullName();
    } else if (e.key === 'Escape') {
      cancelEditingName();
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await profileService.deleteAccount();
    } catch (error: any) {
      console.error('Delete account error:', error);
      setError(error.message || 'Failed to delete account.');
      setIsDeleting(false);
      setShowDeleteAccountModal(false);
    }
  };

  const openDeleteAccountModal = () => {
    setShowDeleteAccountModal(true);
  };

  const closeDeleteAccountModal = () => {
    setShowDeleteAccountModal(false);
  };

  return {
    avatar,
    setAvatar,
    showChangePasswordPopup,
    setShowChangePasswordPopup,
    selectedMenu,
    handleNavigate,
    isEditingName,
    startEditingName,
    cancelEditingName,
    newFullName,
    setNewFullName,
    isLoading,
    error,
    setError,
    isSaving,
    saveFullName,
    isLoggingOut,
    handleLogout,
    profileData,
    isUploadingAvatar,
    showAvatarMenu,
    setShowAvatarMenu,
    handleAvatarChange,
    showAvatarModal,
    setShowAvatarModal,
    handleViewAvatar,
    handleNameChange,
    handleKeyPress,
    streakData,
    fetchProfile,
    isDeleting,
    handleDeleteAccount,
    showDeleteAccountModal,
    setShowDeleteAccountModal,
    openDeleteAccountModal,
    closeDeleteAccountModal,
  };
}
