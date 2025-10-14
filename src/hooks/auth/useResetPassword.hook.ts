import { useEffect, useMemo, useRef, useState } from 'react';
import authService from '../../services/auth.service';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import {
  ResetMessage,
  UseResetPasswordFormProps,
} from '../../types/auth/props/component.props';

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
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

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
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      countdownRef.current = setInterval(() => {
        resetMessage('success', t('reset_success_redirecting', { seconds }));
        seconds -= 1;

        if (seconds < 0) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
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
  const strength = useMemo(() => {
    const pwd = newPassword;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  }, [newPassword]);

  const strengthLabels = [
    t('register_strength_weak'),
    t('register_strength_fair'),
    t('register_strength_good'),
    t('register_strength_strong'),
  ];
  const strengthLabel = strengthLabels[strength - 1] || '';
  const strengthColor =
    ['#ef4444', '#eab308', '#3b82f6', '#22c55e'][strength - 1] || '#d1d5db';

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
    strength,
    strengthLabels,
    strengthLabel,
    strengthColor,
  };
}
