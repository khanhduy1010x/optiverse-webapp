import React from 'react';
import { LoginFormProps } from '../../types/auth/props/component.props';
import { GROUP_CLASSNAMES } from '../../styles';
import { useLoginForm } from '../../hooks/auth/useLogin.hook';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { Button } from '../../components/common/Button.component';

const LoginForm: React.FC<LoginFormProps> = ({ onSwitch }) => {
  const { t } = useAppTranslate('auth');
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
      <h2 className="text-2xl font-bold text-white text-center tracking-widest mb-6">{t('login_title')}</h2>
      {error && (
        <div className={GROUP_CLASSNAMES.errorMessage}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder={t('username_placeholder')}
            value={email}
            onChange={handleInputChange(setEmail)}
            className="w-full px-4 py-2 rounded-md bg-[#18223a] border border-[#00eaff40] focus:border-[#00eaff] text-white outline-none transition-all placeholder:text-white"
            required
            disabled={isEmailLoginLoading || isGoogleLoginLoading}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder={t('password_placeholder')}
            value={password}
            onChange={handleInputChange(setPassword)}
            className="w-full px-4 py-2 rounded-md bg-[#18223a] border border-[#00eaff40] focus:border-[#00eaff] text-white outline-none transition-all placeholder:text-white"
            required
            disabled={isEmailLoginLoading || isGoogleLoginLoading}
          />
        </div>
        <Button
          title={isEmailLoginLoading ? t('logging_in') : t('login_button')}
          className="w-full"
          disabled={isEmailLoginLoading || isGoogleLoginLoading}
          inverted
        />
        <Button
          title={isGoogleLoginLoading ? t('google_loading') : t('login_with_google')}
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isEmailLoginLoading || isGoogleLoginLoading}
          inverted
        />
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
        {t('forgot_password')}
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
        {t('no_account_register')}
      </p>
    </div>
  );
};

export default LoginForm;
