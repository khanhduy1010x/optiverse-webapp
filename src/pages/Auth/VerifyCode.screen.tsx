import React, { useState, useRef } from 'react';
import { VerifyCodeFormProps } from '../../types/auth/props/component.props';
import {
  handleChangeOTP,
  handleKeyDownOTP,
} from '../../utils/keyboard/keyboard-handler.util';
import authService from '../../services/auth.service';
import { VerifyCodeResponse } from '../../types/auth/response/auth.reponse';
import { Button } from '../../components/common/Button.component';

const VerifyCodeForm: React.FC<VerifyCodeFormProps> = ({
  data,
  onSwitch,
  setToken,
}) => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = code.join('');
    if (otp.length !== 6) {
      setMessage('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setMessage('');

    const result = await authService.verifyCode({
      email: data,
      otp: otp,
      type: 'forgot',
    });

    const token = result.data.reset_token;

    if (setToken) setToken(token);
    setMessage('OTP verified. Redirecting...');
    onSwitch('reset');
    setLoading(false);
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
    <div className="space-y-6 w-full">
      <h2 className="text-2xl font-bold text-white text-center tracking-widest mb-6">Verification Code</h2>
      <p className="text-white text-center mb-4">
        We sent a 6-digit code to <strong className="text-[#00eaff]">{data}</strong>. Please enter it
        below:
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3 justify-center mb-6">
          {code.map((digit, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={digit}
              onChange={e =>
                handleChangeOTP(
                  i,
                  e.target.value,
                  code,
                  setCode,
                  inputRefs.current
                )
              }
              onKeyDown={e => handleKeyDownOTP(i, e, code, inputRefs.current)}
              ref={el => {
                inputRefs.current[i] = el;
              }}
              className="w-12 h-12 text-center text-white bg-[#18223a] border border-[#00eaff40] focus:border-[#00eaff] rounded-md outline-none transition-all text-lg font-bold"
              required
            />
          ))}
        </div>
        <Button
          type="submit"
          disabled={loading}
          title={loading ? 'Verifying...' : 'Verify'}
          className="w-full"
          inverted
        />
        {message && (
          <p className="text-center text-sm text-white">{message}</p>
        )}
      </form>
      <p className="text-center text-white">
        Did not receive the code?{' '}
        <span
          onClick={handleResend}
          className="text-[#a6baff] hover:underline cursor-pointer transition-all"
        >
          Resend
        </span>
      </p>
    </div>
  );
};

export default VerifyCodeForm;
