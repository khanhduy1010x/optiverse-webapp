import React, { useState } from 'react';
import { ForgotPasswordFormProps } from '../../types/auth/props/component.props';

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitch = () => { }, setData = () => { } }) => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:81/core/auth/send-otp-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, isVerify: false }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đã xảy ra lỗi.');

      setMessage('OTP đã được gửi tới email của bạn.');

      setData(email);
      onSwitch('verify');
    } catch (err: any) {
      setMessage(err.message || 'Không thể gửi OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
      <p className="text-gray-600">Please enter your email to receive a code</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
        {message && (
          <p className="text-sm text-center text-gray-700">{message}</p>
        )}
      </form>
      <p
        onClick={() => onSwitch('login')}
        className="text-blue-500 hover:underline cursor-pointer text-center"
      >
        Back to login
      </p>
    </div>
  );
};

export default ForgotPasswordForm;