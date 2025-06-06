import React from 'react';
import { LoginFormProps } from '../../types/auth/props/component.props';
import { useLoginForm } from '../../hooks/auth/useLogin.hook';

const LoginForm: React.FC<LoginFormProps> = ({ onSwitch }) => {
  const {
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
  } = useLoginForm();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Login</h2>
      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleInputChange(setEmail)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={disabled}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={handleInputChange(setPassword)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={disabled}
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          disabled={disabled}
        >
          {isEmailLoginLoading ? 'Logging in...' : 'Login'}
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex justify-center items-center gap-2"
          disabled={disabled}
        >
          {isGoogleLoginLoading ? 'Loading...' : 'Login with Google'}
        </button>
      </form>

      <p
        onClick={() => !disabled && onSwitch('forgot')}
        className={`text-blue-500 ${!disabled ? 'hover:underline cursor-pointer' : 'opacity-50 cursor-not-allowed'} text-center`}
      >
        Forgot password?
      </p>
      <p
        onClick={() => !disabled && onSwitch('register')}
        className={`text-blue-500 ${!disabled ? 'hover:underline cursor-pointer' : 'opacity-50 cursor-not-allowed'} text-center`}
      >
        Don't have an account? Register
      </p>
    </div>
  );
};

export default LoginForm;
