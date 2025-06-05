import React, { useState } from 'react';
import { AuthView } from '../../types/global.types';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/AuthService';
import { GOOGLE_AUTH_CONFIG } from '../../config/google-auth';

interface LoginFormProps {
  onSwitch: (view: AuthView) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitch }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Giả lập đăng nhập, trong thực tế bạn sẽ gọi API
    console.log('Logging in with:', { email, password });
    navigate('/flashcard-static');
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Open Google OAuth page in a popup
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_AUTH_CONFIG.CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_AUTH_CONFIG.REDIRECT_URI)}&response_type=code&scope=email profile`;
      
      const popup = window.open(
        googleAuthUrl,
        'Google Login',
        'width=500,height=600,menubar=no,toolbar=no,location=no'
      );

      // Listen for the callback from the popup
      window.addEventListener('message', async (event) => {
        // Make sure the message is from our popup
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'googleCallback' && event.data.code) {
          try {
            // Call the API with the received code
            await AuthService.loginWithGoogle(event.data.code);
            // Navigate to home page after successful login
            navigate('/flashcard-static');
            
            // Close the popup after successful login
            if (popup) popup.close();
          } catch (err) {
            setError('Google login failed. Please try again.');
            console.error('Google login error:', err);
          } finally {
            setIsLoading(false);
          }
        }
      });
    } catch (err) {
      setError('Failed to open Google login. Please try again.');
      setIsLoading(false);
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
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          disabled={isLoading}
        >
          Login
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex justify-center items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Login with Google'}
        </button>
      </form>
      <p
        onClick={() => onSwitch('forgot')}
        className="text-blue-500 hover:underline cursor-pointer text-center"
      >
        Forgot password?
      </p>
      <p
        onClick={() => onSwitch('register')}
        className="text-blue-500 hover:underline cursor-pointer text-center"
      >
        Don't have an account? Register
      </p>
    </div>
  );
};

export default LoginForm;