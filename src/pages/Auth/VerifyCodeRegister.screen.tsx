import React, { useState, useRef } from 'react';
import { Button } from '../../components/common/Button.component';
import COLORS from '../../constants/colors.constant';
import { VerifyCodeFormProps } from '../../types/auth/props/component.props';
import {
  handleChangeOTP,
  handleKeyDownOTP,
} from '../../utils/keyboard/keyboard-handler.util';
import authService from '../../services/auth.service';

const VerifyCodeFormRegister: React.FC<VerifyCodeFormProps> = ({
  onSwitch,
  data,
}) => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      alert('Please enter a 6-digit code');
      return;
    }
    console.log('Verifying code:', fullCode);

    await authService.verifyCode({
      email: data,
      otp: fullCode,
      type: 'register',
    });

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
      <p className="text-gray-600">
        We sent a 6-digit code to your email. Please enter it below:
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 justify-center">
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={code[i]}
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
              className="w-10 h-10 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          ))}
        </div>
        <Button title="Verify" className="w-full"></Button>
      </form>
      <p className="text-center">
        Didn’t receive the code?{' '}
        <span
          onClick={handleResend}
          className="hover:underline cursor-pointer"
          style={{ color: COLORS.yellow700 }}
        >
          Resend
        </span>
      </p>
    </div>
  );
};

export default VerifyCodeFormRegister;
