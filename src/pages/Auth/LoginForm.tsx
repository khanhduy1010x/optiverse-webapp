import React, { useState } from 'react';
import { AuthView } from '../../types/global.types';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSwitch: (view: AuthView) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitch }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
 const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Giả lập đăng nhập, trong thực tế bạn sẽ gọi API
    console.log('Logging in with:', { email, password });
    navigate('/flashcard-static');
  };

  const handleGoogleLogin = () => {
    // Giả lập đăng nhập với Google, trong thực tế bạn sẽ tích hợp Google OAuth
    console.log('Logging in with Google');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Login</h2>
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
        >
          Login
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Login with Google
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
        Don’t have an account? Register
      </p>
    </div>
  );
};

export default LoginForm;