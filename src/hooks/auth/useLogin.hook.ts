import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authService from '../../services/auth.service';
import { setUser, login } from '../../store/slices/auth.slice';
import { AppDispatch } from '../../store';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from '../../config/env.config';
import { useAppDispatch } from '../../store/hooks';

/**
 * Thu thập thông tin về trình duyệt và hệ điều hành dưới dạng chuỗi đơn giản
 * Ví dụ: "Chrome 96/MacOS" hoặc "Firefox 95/Windows 10"
 */
const getDeviceInfo = (): string => {
  const { userAgent } = navigator;

  // Xác định trình duyệt và phiên bản
  let browser = 'Unknown';
  let version = '';

  // Chrome
  if (userAgent.indexOf('Chrome') > -1) {
    browser = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+(\.\d+)?)/);
    if (match) version = match[1];
  }
  // Safari
  else if (userAgent.indexOf('Safari') > -1) {
    browser = 'Safari';
    const match = userAgent.match(/Version\/(\d+(\.\d+)?)/);
    if (match) version = match[1];
  }
  // Firefox
  else if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+(\.\d+)?)/);
    if (match) version = match[1];
  }
  // Internet Explorer
  else if (
    userAgent.indexOf('MSIE') > -1 ||
    userAgent.indexOf('Trident') > -1
  ) {
    browser = 'Internet Explorer';
    const match = userAgent.match(/MSIE (\d+(\.\d+)?)/);
    if (match) version = match[1];
    else {
      const tridentMatch = userAgent.match(/Trident\/(\d+(\.\d+)?)/);
      if (tridentMatch) {
        // Trident 7.0 = IE 11
        const tridentVersion = parseFloat(tridentMatch[1]);
        version = (tridentVersion + 4).toString();
      }
    }
  }
  // Edge
  else if (userAgent.indexOf('Edg') > -1) {
    browser = 'Edge';
    const match = userAgent.match(/Edg\/(\d+(\.\d+)?)/);
    if (match) version = match[1];
  }

  // Chỉ lấy phiên bản chính (major version)
  if (version && version.indexOf('.') > -1) {
    version = version.split('.')[0];
  }

  // Xác định hệ điều hành
  let os = 'Unknown';
  if (userAgent.indexOf('Win') > -1) {
    os = 'Windows';
    if (userAgent.indexOf('Windows NT 10.0') > -1) os = 'Windows 10';
    else if (userAgent.indexOf('Windows NT 6.3') > -1) os = 'Windows 8.1';
    else if (userAgent.indexOf('Windows NT 6.2') > -1) os = 'Windows 8';
    else if (userAgent.indexOf('Windows NT 6.1') > -1) os = 'Windows 7';
  } else if (userAgent.indexOf('Mac') > -1) {
    os = 'MacOS';
  } else if (userAgent.indexOf('Android') > -1) {
    os = 'Android';
  } else if (userAgent.indexOf('Linux') > -1) {
    os = 'Linux';
  } else if (
    userAgent.indexOf('iPhone') > -1 ||
    userAgent.indexOf('iPad') > -1
  ) {
    os = 'iOS';
  }

  return version ? `${browser} ${version}/${os}` : `${browser}/${os}`;
};

export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailLoginLoading, setIsEmailLoginLoading] = useState(false);
  const [isGoogleLoginLoading, setIsGoogleLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(
    null
  );

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useAppTranslate('auth');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmailLoginLoading) return;
    setError(null);
    setIsEmailLoginLoading(true);
    dispatch(login());
    try {
      const device_info = getDeviceInfo();
      await authService.loginWithEmail(email, password, device_info);
      const userInfo = await authService.getUserInfo();
      const isSuspended = (userInfo as any)?.status === 'suspended';
      const isBanned = (userInfo as any)?.code === 'USER_IS_BANNED';
      if (isSuspended || isBanned) {
        if (window.showUserBannedModal) window.showUserBannedModal();
        setIsEmailLoginLoading(false);
        return;
      }
      dispatch(setUser(userInfo));
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      if (err?.response?.data?.code === 'USER_IS_BANNED') {
        if (window.showUserBannedModal) window.showUserBannedModal();
        setIsEmailLoginLoading(false);
        return;
      }
      if (err?.response?.data?.code === 1015) {
        await authService.resendCode({
          email,
          type: 'register',
        });
        navigate('/register', { state: { emailVerify: email } });
        return;
      }
      console.error('Login error:', err);
      setError(err.message || t('login_failed'));
    } finally {
      setIsEmailLoginLoading(false);
    }
  };

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (error) setError(null);
      setter(e.target.value.trim());
    };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoginLoading(true);

    try {
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        GOOGLE_REDIRECT_URI
      )}&response_type=code&scope=email profile`;

      const popup = window.open(
        googleAuthUrl,
        'Google Login',
        'width=500,height=600,menubar=no,toolbar=no,location=no'
      );

      if (!popup) throw new Error(t('popup_blocked'));

      let popupClosedManually = false;

      let stillLoading = true;

      const cleanup = () => {
        stillLoading = false;
        setIsGoogleLoginLoading(false);
        window.removeEventListener('message', messageHandler);
        clearInterval(popupChecker);
      };

      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'googleCallback' && event.data.code) {
          try {
            const device_info = getDeviceInfo();
            await authService.loginWithGoogle(event.data.code, device_info);
            const userInfo = await authService.getUserInfo();
            dispatch(setUser(userInfo));
            navigate('/dashboard', { replace: true });
          } catch (err) {
            setError(t('google_login_failed'));
            console.error('Google login error:', err);
          } finally {
            cleanup();
            popup.close();
          }
        }
      };

      window.addEventListener('message', messageHandler);

      const popupChecker = setInterval(() => {
        if (popup.closed && stillLoading) {
          popupClosedManually = true;
          cleanup();
          setError(t('google_login_cancelled') || 'Google login cancelled');
        }
      }, 500);

      setTimeout(() => {
        if (stillLoading) {
          cleanup();
          setError(t('google_login_timeout') || 'Google login timed out.');
          if (!popup.closed) popup.close();
        }
      }, 60000);
    } catch (err) {
      console.error('Google login error:', err);
      setError(t('google_login_open_failed'));
      setIsGoogleLoginLoading(false);
    }
  };

  const disabled = isEmailLoginLoading || isGoogleLoginLoading;

  return {
    setFocusedField,
    focusedField,
    email,
    password,
    setEmail,
    setPassword,
    isEmailLoginLoading,
    isGoogleLoginLoading,
    error,
    handleSubmit,
    handleInputChange,
    handleGoogleLogin,
    disabled,
    showPassword,
    setShowPassword,
  };
}
