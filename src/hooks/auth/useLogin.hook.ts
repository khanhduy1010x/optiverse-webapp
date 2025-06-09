import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GOOGLE_AUTH_CONFIG } from '../../config/google-auth.config';
import authService from '../../services/auth.service';
import { useAuth } from '../../contexts/auth.context';

export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailLoginLoading, setIsEmailLoginLoading] = useState(false);
  const [isGoogleLoginLoading, setIsGoogleLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { refreshTokens } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmailLoginLoading) return;

    setError(null);
    setIsEmailLoginLoading(true);

    try {
      const response = await axios.post('http://localhost:81/core/auth/login', {
        email,
        password,
      });

      const { access_token, refresh_token } = response.data.data;

      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);

      await refreshTokens();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message || 'Login failed. Please try again later.');
      }
    } finally {
      setIsEmailLoginLoading(false);
    }
  };

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (error) setError(null);
      setter(e.target.value);
    };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoginLoading(true);

    try {
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_AUTH_CONFIG.CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_AUTH_CONFIG.REDIRECT_URI)}&response_type=code&scope=email profile`;

      const popup = window.open(
        googleAuthUrl,
        'Google Login',
        'width=500,height=600,menubar=no,toolbar=no,location=no'
      );

      if (!popup)
        throw new Error('Popup blocked. Please allow popups for this site.');

      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'googleCallback' && event.data.code) {
          try {
            await authService.loginWithGoogle(event.data.code);
            await refreshTokens();
            navigate('/dashboard', { replace: true });
            popup.close();
          } catch (err) {
            setError('Google login failed. Please try again.');
            console.error('Google login error:', err);
          } finally {
            setIsGoogleLoginLoading(false);
            window.removeEventListener('message', messageHandler);
          }
        }
      };

      window.addEventListener('message', messageHandler);

      setTimeout(() => {
        if (isGoogleLoginLoading) {
          setError('Google login timed out. Please try again.');
          setIsGoogleLoginLoading(false);
          window.removeEventListener('message', messageHandler);
        }
      }, 60000);
    } catch (err) {
      setError('Failed to open Google login. Please try again.');
      setIsGoogleLoginLoading(false);
      console.error('Google login error:', err);
    }
  };

  const disabled = isEmailLoginLoading || isGoogleLoginLoading;

  return {
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
  };
}
