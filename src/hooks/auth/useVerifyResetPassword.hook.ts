import authService from '../../services/auth.service';
import { RegisterForm } from '../../types/auth/auth.types';
import { useForm } from 'react-hook-form';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface UseVerifyFormProps {
  email: string;
  setMessage: React.Dispatch<
    React.SetStateAction<{
      type: 'info' | 'error';
      message: string;
    }>
  >;
  onRedirect: () => void;
  setToken?: (token: string) => void;
}

export function useVerifyPassWord({
  email,
  setMessage,
  onRedirect,
  setToken,
}: UseVerifyFormProps) {
  const { t } = useAppTranslate('auth');
  const { handleSubmit, control, watch, setError } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    console.log('Verify code with:', { data });

    try {
      setMessage({
        type: 'info',
        message: t('verify_sent_message_with_email', { email }),
      });

      const resp = await authService.verifyCode({
        email: email,
        otp: watch('code'),
        type: 'forgot',
      });
      const resetToken = resp.data.reset_token || null;
      if (resetToken && setToken) {
        setToken(resetToken);
        onRedirect();
      } else {
        setError('code', {
          message: t('verify_error_invalid'),
        });
      }
    } catch (error: any) {
      setError('code', {
        message: error?.response?.data?.message || t('verify_error_invalid'),
      });
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendCode({
        email: email,
        type: 'forgot',
      });
      setMessage({
        type: 'info',
        message: t('verify_sent_message_with_email', { email }),
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        message: error?.response?.data?.message || t('verify_error_generic'),
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
