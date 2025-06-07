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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Login</h2>
      {error && (
        <div className={GROUP_CLASSNAMES.errorMessage}>
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
            className={GROUP_CLASSNAMES.authInput}
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
            className={GROUP_CLASSNAMES.authInput}
            required
            disabled={isEmailLoginLoading || isGoogleLoginLoading}
          />
        </div>
        <button
          type="submit"
          className={GROUP_CLASSNAMES.authButtonPrimary}
          disabled={isEmailLoginLoading || isGoogleLoginLoading}
        >
          {isEmailLoginLoading ? 'Logging in...' : 'Login'}
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className={GROUP_CLASSNAMES.authButtonGoogle}
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
        className={`${GROUP_CLASSNAMES.linkHover} ${!isEmailLoginLoading && !isGoogleLoginLoading ? '' : 'opacity-50 cursor-not-allowed'} text-center`}
      >
        Forgot password?
      </p>
      <p
        onClick={() => {
          if (!isEmailLoginLoading && !isGoogleLoginLoading) {
            onSwitch('register');
          }
        }}
        className={`${GROUP_CLASSNAMES.linkHover} ${!isEmailLoginLoading && !isGoogleLoginLoading ? '' : 'opacity-50 cursor-not-allowed'} text-center`}
      >
        Don't have an account? Register
      </p>
    </div>
  );
};

export default LoginForm;
