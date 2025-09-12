import React from 'react';
import { ResetPasswordFormProps } from '../../types/auth/props/component.props';
import { useResetPasswordForm } from '../../hooks/auth/useResetPassword.hook';
import { Button } from '../../components/common/Button.component';

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
    <div className="space-y-6 w-full">
      <h2 className="text-2xl font-bold text-white text-center tracking-widest mb-6">Reset Password</h2>
      <p className="text-white text-center mb-4">Set a new password for your account</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white font-medium mb-1" htmlFor="newPassword">New Password</label>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-[#18223a] border border-[#00eaff40] focus:border-[#00eaff] text-white outline-none transition-all placeholder:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-white font-medium mb-1" htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-[#18223a] border border-[#00eaff40] focus:border-[#00eaff] text-white outline-none transition-all placeholder:text-white"
            required
          />
        </div>
        <Button
          title={loading ? 'Resetting...' : 'Reset Password'}
          className="w-full"
          disabled={loading}
          inverted
        />
        {message && (
          <p className="text-sm text-center text-white">{message}</p>
        )}
      </form>
    </div>
  );
};

export default ResetPasswordForm;
