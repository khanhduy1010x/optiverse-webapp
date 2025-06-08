import { useState } from 'react';
import authService from '../../services/auth.service';

export function useForgotPassword({
  onSuccess,
}: {
  onSuccess: (email: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    await authService.forgotPassword(email);

    setMessage('OTP đã được gửi tới email của bạn.');
    onSuccess(email);
    setLoading(false);
  };

  return {
    email,
    setEmail,
    message,
    loading,
    handleSubmit,
  };
}
