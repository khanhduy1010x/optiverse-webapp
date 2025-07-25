import { useState } from 'react';
import profileService from '../../services/profile.service';

export function useChangePassword(onClose: () => void, hasPassword: boolean, refreshData?: () => Promise<void>) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePasswords = () => {
    // If user doesn't have a password set, we don't need to validate the current password
    if (hasPassword) {
      if (!currentPassword) {
        setError('Please enter your current password');
        return false;
      }
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      setError('New password must contain at least one uppercase letter');
      return false;
    }

    // Check for at least one number
    if (!/[0-9]/.test(newPassword)) {
      setError('New password must contain at least one number');
      return false;
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setError('New password must contain at least one special character');
      return false;
    }

    if (hasPassword === true && newPassword === currentPassword) {
      setError('New password must be different from current password');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      setError(null);

      if (!validatePasswords()) {
        return;
      }

      setIsLoading(true);
      await profileService.changePassword({
        currentPassword: hasPassword === true ? currentPassword : '',
        newPassword,
      });
      
      // Refresh profile data if callback is provided
      if (refreshData) {
        await refreshData();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Failed to change password:', error);
      setError(error.message || 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    isLoading,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleSubmit,
    hasPassword,
  };
}
