import React, { useState } from 'react';
import { Button } from '../../components/common/Button.component';
import COLORS from '../../constants/colors.constant';
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
    <div className="w-1/2 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Verification Code</h2>
      <p
        className="text-gray-600"
        style={{
          ...(message.type == 'error' && {
            color: COLORS.red500,
          }),
        }}
      >
        {message.message}
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-2 justify-center">
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
        <Button title="Verify" className="w-full" inverted></Button>
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
