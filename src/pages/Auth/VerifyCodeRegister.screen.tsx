import React, { useState } from 'react';
import { Button } from '../../components/common/Button.component';
import { VerifyCodeFormProps } from '../../types/auth/props/component.props';
import { OTPInputField } from '../../components/common/Input.component';
import { useVerifyForm } from '../../hooks/auth/useVerify.hook';
import { RegisterForm } from '../../types/auth/auth.types';
import { validateOTP } from '../../utils/validate.util';

const VerifyCodeFormRegister: React.FC<VerifyCodeFormProps> = ({
  onSwitch,
  data,
}) => {
  const [message, setMessage] = useState<{
    type: 'info' | 'error';
    message: string;
  }>({
    type: 'info',
    message: 'We sent a 6-digit code to your email. Please enter it below:',
  });
  const { onSubmit, control, handleSubmit, handleResend } = useVerifyForm({
    email: data,
    initMessage: message,
    setMessage: setMessage,
    onRedirect: () => onSwitch('login'),
  });

  return (
    <div className="space-y-6 w-full">
      <h2 className="text-2xl font-bold text-white text-center tracking-widest mb-6">Verification Code</h2>
      <p
        className={`text-center mb-4 ${
          message.type === 'error' ? 'text-red-400' : 'text-white'
        }`}
      >
        {message.message}
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-3 justify-center mb-6">
          <OTPInputField<RegisterForm>
            name="code"
            control={control}
            label="Enter OTP"
            rules={{
              required: 'OTP is required',
              validate: v => validateOTP(v),
            }}
            otpLength={6}
          />
        </div>
        <Button
          title="Verify"
          className="w-full"
          inverted
        />
      </form>
      <p className="text-center text-white">
        Didn't receive the code?{' '}
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

export default VerifyCodeFormRegister;
