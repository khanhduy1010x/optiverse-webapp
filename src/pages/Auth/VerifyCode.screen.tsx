import React, { useState, useRef, Dispatch, SetStateAction } from 'react';
import { VerifyCodeFormProps } from '../../types/auth/props/component.props';


const VerifyCodeForm: React.FC<VerifyCodeFormProps> = ({
  data,
  onSwitch,
  setToken,
}) => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = code.join('');
    if (otp.length !== 6) {
      setMessage('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:81/core/auth/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data, otp, isVerify: false }),
      });

      const result = await res.json();
      const token = result.data.reset_token;

      if (!res.ok) throw new Error(result.message || 'Verification failed');
      if (setToken) setToken(token);
      setMessage('OTP verified. Redirecting...');
      onSwitch('reset');
    } catch (err) {
      const error = err as Error;
      setMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await fetch('http://localhost:81/core/auth/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Resend failed');
      alert('Code has been resent to your email.');
    } catch (err) {
      const error = err as Error;
      setMessage(error.message || 'An error occurred');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Verification Code</h2>
      <p className="text-gray-600">
        We sent a 6-digit code to <strong>{data}</strong>. Please enter it
        below:
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 justify-center">
          {code.map((digit, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              ref={el => { inputRefs.current[i] = el }}
              className="w-10 h-10 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        {message && (
          <p className="text-center text-sm text-gray-700">{message}</p>
        )}
      </form>
      <p className="text-center">
        Did not receive the code?{' '}
        <span
          onClick={handleResend}
          className="text-blue-500 hover:underline cursor-pointer"
        >
          Resend
        </span>
      </p>
    </div>
  );
};

export default VerifyCodeForm;
