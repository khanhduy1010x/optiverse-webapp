import React, { Dispatch, SetStateAction, useState } from 'react';
import { AuthView } from '../../types/global.types';
import COLORS from '../../constants/colors.constant';
import { Button } from '../../components/common/Button.component';

interface RegisterFormProps {
  onSwitch: (view: AuthView) => void;
  setData: Dispatch<SetStateAction<string>>;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitch, setData }) => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

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

  return (
    <div className="w-3/5 grid gap-10">
      <h2 className="w-full text-2xl font-bold text-gray-800 text-center">
        Register
      </h2>
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
        <Button title="Create Account" className="w-full"></Button>
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