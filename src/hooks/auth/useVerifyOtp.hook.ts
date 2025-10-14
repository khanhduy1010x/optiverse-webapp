import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import authService from '../../services/auth.service';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import {
  VerifyMessage,
  VerifyOtpFormValues,
  VerifyOtpOptions,
} from '../../types/auth/props/component.props';

export const useVerifyOtp = ({
  email,
  type,
  onSuccess,
  onToken,
}: VerifyOtpOptions) => {
  const { t } = useAppTranslate('auth');
  const [message, setMessage] = useState<VerifyMessage>({
    type: 'info',
    text: t('verify_sent_message_with_email', { email }),
  });
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, setError, reset, setValue } =
    useForm<VerifyOtpFormValues>({
      defaultValues: { code: '' },
    });

  useEffect(() => {
    const checkClipboard = async () => {
      try {
        if (!navigator.clipboard || !navigator.clipboard.readText) {
          return;
        }

        const clipboardText = await navigator.clipboard.readText();

        const otpRegex = /^\d{6}$/;
        if (otpRegex.test(clipboardText.trim())) {
          setValue('code', clipboardText.trim());
        }
      } catch (error) {
        console.log('Clipboard access denied or not supported');
      }
    };

    checkClipboard();

    const handleFocus = () => {
      checkClipboard();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [setValue]);

  const handlePaste = async (e: ClipboardEvent) => {
    try {
      const pastedText = e.clipboardData?.getData('text') || '';
      const otpRegex = /^\d{6}$/;

      if (otpRegex.test(pastedText.trim())) {
        e.preventDefault();
        setValue('code', pastedText.trim());
      }
    } catch (error) {
      console.log('Paste handling error:', error);
    }
  };

  useEffect(() => {
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [setValue]);

  useEffect(() => {
    setMessage({
      type: 'info',
      text: t('verify_sent_message_with_email', { email }),
    });
    reset({ code: '' });
  }, [email]);

  const onSubmit = handleSubmit(async ({ code }) => {
    console.log('Submitting OTP code:', code);
    try {
      setLoading(true);
      const response = await authService.verifyCode({
        email,
        otp: code,
        type,
      });

      if (type === 'forgot') {
        const resetToken =
          response?.data?.reset_token ?? response?.data?.data?.reset_token;
        if (!resetToken) {
          const fallback = t('verify_error_invalid');
          setError('code', { message: fallback });
          setMessage({ type: 'error', text: fallback });
          setLoading(false);
          return;
        }
        onToken?.(resetToken);
      }

      setMessage({ type: 'success', text: t('verify_success') });
      onSuccess?.();
    } catch (error: any) {
      let errorMessage = t('verify_error_invalid');

      const errorCode = error?.response?.data?.code;
      console.log(errorCode);
      if (errorCode === 1013) {
        errorMessage = t('error_code_1013');
        console.log('Invalid or expired OTP code error code 1013 encountered');
      } else if (errorCode === 1014) {
        errorMessage = t('error_code_1014');
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error?.message === 'string') {
        errorMessage = error.message;
      }

      setError('code', { message: errorMessage });
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  });

  const handleResend = async () => {
    try {
      setLoading(true);
      await authService.resendCode({
        email,
        type,
      });
      setMessage({
        type: 'info',
        text: t('verify_sent_message_with_email', { email }),
      });
    } catch (error: any) {
      let errorMessage = t('verify_error_generic');

      const errorCode = error?.response?.data?.code;
      if (errorCode === 1014) {
        errorMessage = t('error_code_1014');
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error?.message === 'string') {
        errorMessage = error.message;
      }

      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return {
    control,
    onSubmit,
    handleResend,
    message,
    loading,
    setValue,
  };
};
