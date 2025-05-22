import React, { useState, useRef } from 'react';
import { AuthView } from '../../types/global.types';

interface VerifyCodeFormProps {
  onSwitch: (view: AuthView) => void;
}

const VerifyCodeForm: React.FC<VerifyCodeFormProps> = ({ onSwitch }) => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // Chỉ cho phép số

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Tự động focus ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Xử lý phím Backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      alert('Please enter a 6-digit code');
      return;
    }
    // Giả lập xác nhận mã, trong thực tế bạn sẽ gọi API
    console.log('Verifying code:', fullCode);
    onSwitch('login');
  };

  const handleResend = () => {
    // Giả lập gửi lại mã, trong thực tế bạn sẽ gọi API
    console.log('Resending code...');
    alert('Code has been resent');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Verification Code</h2>
      <p className="text-gray-600">We sent a 6-digit code to your email. Please enter it below:</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 justify-center">
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={code[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              ref={(el) => {
                inputRefs.current[i] = el; 
              }}
              className="w-10 h-10 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          ))}
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Verify
        </button>
      </form>
      <p className="text-center">
        Didn’t receive the code?{' '}
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