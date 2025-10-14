import { useState } from 'react';
import authService from '../../services/auth.service';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { UseForgotPasswordOptions } from '../../types/auth/props/component.props';

export function useForgotPassword({ onSuccess }: UseForgotPasswordOptions) {
  const { t } = useAppTranslate('auth');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setMessage(t('forgot_success'));
      onSuccess(email);
    } catch (error: any) {
      const errorCode = error?.response?.data?.code;

      if (errorCode === 1007) {
        setError(t('forgot_error_email_not_found'));
        return;
      }

      if (errorCode === 1014) {
        setError(t('forgot_error_rate_limit'));
        return;
      }

      setError(t('forgot_error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    message,
    error,
    loading,
    handleSubmit,
    focused,
    setFocused,
  };
}
