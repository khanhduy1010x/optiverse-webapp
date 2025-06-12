import authService from '../../services/auth.service';
import { RegisterForm } from '../../types/auth/auth.types';
import { useForm } from 'react-hook-form';
import { ErrorCode } from '../../types/error-code.enum';

interface UseVerifyFormProps {
  email: string;
  initMessage: {
    type: 'info' | 'error';
    message: string;
  };
  setMessage: React.Dispatch<
    React.SetStateAction<{
      type: 'info' | 'error';
      message: string;
    }>
  >;
  onRedirect: () => void;
}

export function useVerifyForm({
  email,
  initMessage,
  setMessage,
  onRedirect,
}: UseVerifyFormProps) {
  const { handleSubmit, control, watch, setError } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    console.log('Verify code with:', { data });

    try {
      setMessage({
        type: 'info',
        message: 'We sent a 6-digit code to your email. Please enter it below:',
      });
      
      await authService.verifyCode({
        email: email,
        otp: watch('code'),
        type: 'register',
      });

      onRedirect();
    } catch (error: any) {
      setError('code', {
        message: error.message,
      });
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendCode({
        email: email,
        type: 'register',
      });
      setMessage({
        type: 'info',
        message: 'We sent a 6-digit code to your email. Please enter it below:',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        message: error.message,
      });
    }
  };

  return {
    onSubmit,
    control,
    handleSubmit,
    watch,
    handleResend,
  };
}
