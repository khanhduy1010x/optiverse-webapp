import React from 'react';
import { ResetPasswordFormProps } from '../../types/auth/props/component.props';
import { useResetPasswordForm } from '../../hooks/auth/useResetPassword.hook';

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSwitch,
  token,
}) => {
  const {
    newPassword,
    confirmPassword,
    setNewPassword,
    setConfirmPassword,
    handleSubmit,
    message,
    loading,
  } = useResetPasswordForm({
    token,
    onSuccess: () => onSwitch('login'),
  });

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
