import { useState } from 'react';

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
    try {
      const res = await fetch('http://localhost:81/core/auth/reset-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || 'Failed to reset password');

      setMessage('Password reset successfully!');
      setTimeout(onSuccess, 1500);
    } catch (err) {
      const error = err as Error;
      setMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
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
