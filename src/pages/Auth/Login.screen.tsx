import React, { useState } from 'react';
import { AuthView } from '../../types/global.types';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';
import { GOOGLE_AUTH_CONFIG } from '../../config/google-auth';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSwitch: (view: AuthView) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitch }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isEmailLoginLoading, setIsEmailLoginLoading] = useState<boolean>(false);
  const [isGoogleLoginLoading, setIsGoogleLoginLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refreshTokens } = useAuth(); // Get auth context methods

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEmailLoginLoading) return; // Prevent multiple submissions
    
    setError(null);
    setIsEmailLoginLoading(true);
    
    try {
      // Direct implementation to ensure we can catch and handle the error properly
      const response = await axios.post('http://localhost:81/core/auth/login', { 
        email, 
        password 
      });
      
      // Process successful login
      const { access_token, refresh_token } = response.data.data;
      
      // Save tokens to localStorage
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      
      // Update authentication state
      await refreshTokens(); // This will update isAuthenticated in AuthContext
      
      // Navigate to dashboard page
      navigate('/dashboard', { replace: true });
      
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle 401 Unauthorized explicitly
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message || 'Login failed. Please try again later.');
      }
    } finally {
      setIsEmailLoginLoading(false); // Always reset loading state
    }
  };

  // Reset error when user starts typing again
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setter(e.target.value);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoginLoading(true);
    
    try {
      // Open Google OAuth page in a popup
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_AUTH_CONFIG.CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_AUTH_CONFIG.REDIRECT_URI)}&response_type=code&scope=email profile`;
      
      const popup = window.open(
        googleAuthUrl,
        'Google Login',
        'width=500,height=600,menubar=no,toolbar=no,location=no'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for the callback from the popup
      const messageHandler = async (event: MessageEvent) => {
        // Make sure the message is from our popup
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'googleCallback' && event.data.code) {
          try {
            // Call the API with the received code
            await AuthService.loginWithGoogle(event.data.code);
            // Update authentication state
            await refreshTokens(); 
            // Navigate to dashboard page after successful login
            navigate('/dashboard', { replace: true });
            
            // Close the popup after successful login
            if (popup) popup.close();
          } catch (err) {
            setError('Google login failed. Please try again.');
            console.error('Google login error:', err);
          } finally {
            setIsGoogleLoginLoading(false);
            // Remove the event listener
            window.removeEventListener('message', messageHandler);
          }
        }
      };

      window.addEventListener('message', messageHandler);
      
      // Set a timeout to clear the loading state if no response is received
      setTimeout(() => {
        if (isGoogleLoginLoading) {
          setError('Google login timed out. Please try again.');
          setIsGoogleLoginLoading(false);
          window.removeEventListener('message', messageHandler);
        }
      }, 60000); // 1 minute timeout
      
    } catch (err) {
      setError('Failed to open Google login. Please try again.');
      setIsGoogleLoginLoading(false);
      console.error('Google login error:', err);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Login</h2>
      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleInputChange(setEmail)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isEmailLoginLoading || isGoogleLoginLoading}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handleInputChange(setPassword)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isEmailLoginLoading || isGoogleLoginLoading}
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          disabled={isEmailLoginLoading || isGoogleLoginLoading}
        >
          {isEmailLoginLoading ? 'Logging in...' : 'Login'}
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex justify-center items-center gap-2"
          disabled={isEmailLoginLoading || isGoogleLoginLoading}
        >
          {isGoogleLoginLoading ? 'Loading...' : 'Login with Google'}
        </button>
      </form>
      <p
        onClick={() => {
          if (!isEmailLoginLoading && !isGoogleLoginLoading) {
            onSwitch('forgot');
          }
        }}
        className={`text-blue-500 ${!isEmailLoginLoading && !isGoogleLoginLoading ? 'hover:underline cursor-pointer' : 'opacity-50 cursor-not-allowed'} text-center`}
      >
        Forgot password?
      </p>
      <p
        onClick={() => {
          if (!isEmailLoginLoading && !isGoogleLoginLoading) {
            onSwitch('register');
          }
        }}
        className={`text-blue-500 ${!isEmailLoginLoading && !isGoogleLoginLoading ? 'hover:underline cursor-pointer' : 'opacity-50 cursor-not-allowed'} text-center`}
      >
        Don't have an account? Register
      </p>
    </div>
  );
};

export default LoginForm;