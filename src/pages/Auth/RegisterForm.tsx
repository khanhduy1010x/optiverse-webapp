import React, { useState } from 'react';
import { AuthView } from '../../types/global.types';

interface RegisterFormProps {
  onSwitch: (view: AuthView) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitch }) => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Giả lập đăng ký, trong thực tế bạn sẽ gọi API
    console.log('Registering with:', { fullName, email, password });
    onSwitch('verify');
  };

  const handleGoogleRegister = () => {
    // Giả lập đăng ký với Google, trong thực tế bạn sẽ tích hợp Google OAuth
    console.log('Registering with Google');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
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
          Create Account
        </button>
        <button
          type="button"
          onClick={handleGoogleRegister}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Register with Google
        </button>
      </form>
      <p
        onClick={() => onSwitch('login')}
        className="text-blue-500 hover:underline cursor-pointer text-center"
      >
        Already have an account? Login
      </p>
    </div>
  );
};

export default RegisterForm;