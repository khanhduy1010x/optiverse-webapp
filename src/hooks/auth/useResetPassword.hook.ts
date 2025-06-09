import { useState } from 'react';
import authService from '../../services/auth.service';

interface UseResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
}

export function useResetPasswordForm({
  token,
  onSuccess,
}: UseResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    await authService.resetPassword({
      newPassword,
      token,
    });
    setMessage('Password reset successfully!');
    setTimeout(onSuccess, 1500);
    setLoading(false);
  };

  return {
    newPassword,
    confirmPassword,
    setNewPassword,
    setConfirmPassword,
    handleSubmit,
    message,
    loading,
  };
}
