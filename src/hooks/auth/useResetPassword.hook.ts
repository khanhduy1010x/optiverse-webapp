import { useState } from 'react';
import authService from '../../services/auth.service';
import { useAppTranslate } from '../../hooks/useAppTranslate';

type ResetMessage = {
  type: 'success' | 'error';
  text: string;
} | null;

interface UseResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
}

export function useResetPasswordForm({
  token,
  onSuccess,
}: UseResetPasswordFormProps) {
  const { t } = useAppTranslate('auth');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<ResetMessage>(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!newPassword || !confirmPassword) {
      resetMessage('error', t('reset_error_required'));
      return;
    }

    if (newPassword.length < 6) {
      resetMessage('error', t('reset_error_min_length'));
      return;
    }

    if (newPassword !== confirmPassword) {
      resetMessage('error', t('reset_error_mismatch'));
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({
        newPassword,
        token,
      });

      setNewPassword('');
      setConfirmPassword('');
      resetMessage('success', t('reset_success'));

      let seconds = 3;
      const countdownInterval = setInterval(() => {
        resetMessage(
          'success',
          t('reset_success_redirecting', { seconds })
        );
        seconds -= 1;

        if (seconds < 0) {
          clearInterval(countdownInterval);
          onSuccess();
        }
      }, 1000);
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.message ??
        (typeof error?.message === 'string' ? error.message : null);
      resetMessage('error', apiMessage || t('reset_error_generic'));
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
    focusedField,
    setFocusedField,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    loading,
  };
}
