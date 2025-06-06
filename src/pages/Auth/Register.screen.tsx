import React from 'react';
import COLORS from '../../constants/colors.constant';
import { Button } from '../../components/common/Button.component';
import { RegisterFormProps } from '../../types/auth/props/component.props';
import { useRegisterForm } from '../../hooks/auth/useRegister.hook';

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitch, setData }) => {
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
  } = useRegisterForm({
    onSuccess: (email: string) => {
      setData(email);
      onSwitch('verify-register');
    },
  });

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
        <Button title="Create Account" className="w-full" />
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
