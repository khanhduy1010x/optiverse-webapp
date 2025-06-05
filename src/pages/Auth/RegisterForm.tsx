import React, { useState } from 'react';
import { AuthView } from '../../types/global.types';
import COLORS from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/AuthService';
import { GOOGLE_AUTH_CONFIG } from '../../config/google-auth';

interface RegisterFormProps {
  onSwitch: (view: AuthView) => void;
  setData: (data: string) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitch, setData }) => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Registering with:', { fullName, email, password });

    try {
      await fetch(`http://localhost:81/core/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          full_name: fullName,
          password: password,
        }),
      });
      setData(email);
      onSwitch('verify-register');
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Google OAuth flow is the same for login and registration
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
            // Call the API with the received code - this will create a new account if the user doesn't exist
            await AuthService.loginWithGoogle(event.data.code);
            // Navigate to home page after successful registration/login
            navigate('/flashcard-static');
            
            // Close the popup after successful login
            if (popup) popup.close();
          } catch (err) {
            setError('Google registration failed. Please try again.');
            console.error('Google registration error:', err);
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
    <div className="w-3/5 grid gap-10">
      <h2 className="w-full text-2xl font-bold text-gray-800 text-center">
        Register
      </h2>
      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid gap-6">
        <div>
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <Button
          title="Create Account"
          className="w-full"
          onClick={isLoading ? undefined : handleSubmit}
          style={{ opacity: isLoading ? 0.7 : 1 }}
        ></Button>
        <button
          type="button"
          onClick={handleGoogleRegister}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex justify-center items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Register with Google'}
        </button>
      </form>
      <p
        onClick={() => onSwitch('login')}
        className="hover:underline cursor-pointer text-center"
        style={{ color: COLORS.yellow700 }}
      >
        Already have an account ? Login
      </p>
    </div>
  );
};

export default RegisterForm;
