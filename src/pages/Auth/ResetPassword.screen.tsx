// src/components/auth/ResetPasswordForm.tsx
import React, { useState } from 'react';
import { AuthView } from '../../types/global.types';

interface ResetPasswordFormProps {
  token: string;
  onSwitch: (view: AuthView) => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSwitch,
  token,
}) => {
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
      setTimeout(() => onSwitch('login'), 1500);
    } catch (err) {
      const error = err as Error;
      setMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
      <p className="text-gray-600">Set a new password for your account</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        {message && (
          <p className="text-sm text-center text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
};

export default ResetPasswordForm;
