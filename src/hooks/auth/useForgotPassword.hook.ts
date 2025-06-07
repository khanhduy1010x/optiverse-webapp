import { useState } from 'react';

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

    try {
      const res = await fetch(
        'http://localhost:81/core/auth/send-otp-reset-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, isVerify: false }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đã xảy ra lỗi.');

      setMessage('OTP đã được gửi tới email của bạn.');
      onSuccess(email);
    } catch (err: any) {
      setMessage(err.message || 'Không thể gửi OTP.');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    message,
    loading,
    handleSubmit,
  };
}
