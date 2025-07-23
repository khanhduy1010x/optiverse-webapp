import React from 'react';
import { LoginFormProps } from '../../types/auth/props/component.props';
import { GROUP_CLASSNAMES } from '../../styles';
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
    <div className="space-y-6 w-full">
      <h2 className="text-2xl font-bold text-white text-center tracking-widest mb-6">LOGIN</h2>
      {error && (
        <div className={GROUP_CLASSNAMES.errorMessage}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Username"
            value={email}
            onChange={handleInputChange(setEmail)}
            className="w-full px-4 py-2 rounded-md bg-[#18223a] border border-[#00eaff40] focus:border-[#00eaff] text-white outline-none transition-all placeholder:text-[#b0c4d4]"
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
            className="w-full px-4 py-2 rounded-md bg-[#18223a] border border-[#00eaff40] focus:border-[#00eaff] text-white outline-none transition-all placeholder:text-[#b0c4d4]"
            required
            disabled={isEmailLoginLoading || isGoogleLoginLoading}
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 rounded-md bg-[#10182a] border border-[#00eaff] text-white font-bold tracking-wide hover:bg-[#00eaff20] transition-all"
          disabled={isEmailLoginLoading || isGoogleLoginLoading}
        >
          {isEmailLoginLoading ? 'Logging in...' : 'LOGIN'}
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2 rounded-md bg-[#10182a] border border-[#00eaff] text-white font-bold tracking-wide hover:bg-[#00eaff20] transition-all"
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
        className="text-[#a6baff] hover:underline text-center cursor-pointer transition-all"
        style={{ opacity: !isEmailLoginLoading && !isGoogleLoginLoading ? 1 : 0.5 }}
      >
        Forgot password?
      </p>
      <p
        onClick={() => {
          if (!isEmailLoginLoading && !isGoogleLoginLoading) {
            onSwitch('register');
          }
        }}
        className="text-[#6aafff] hover:underline text-center cursor-pointer transition-all"
        style={{ opacity: !isEmailLoginLoading && !isGoogleLoginLoading ? 1 : 0.5 }}
      >
        Don't have an account? Register
      </p>
    </div>
  );
};

export default LoginForm;
