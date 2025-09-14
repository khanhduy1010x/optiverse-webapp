import React, { useState, Suspense } from 'react';
import LoginForm from './Login.screen';
import RegisterForm from './Register.screen';
import ForgotPasswordForm from './ForgotPassword.screen';
import VerifyCodeFormRegister from './VerifyCodeRegister.screen';
import ResetPasswordForm from './ResetPassword.screen';
import VerifyCodeForm from './VerifyCode.screen';
import GLBModel from '../../components/GLBModel';
import { AuthContainerProps } from '../../types/auth/props/component.props';
import { AuthViewType } from '../../types/auth/auth.types';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const AuthContainer: React.FC<AuthContainerProps> = ({
  initialView = 'login',
}) => {
  const [view, setView] = useState<AuthViewType>(initialView);
  const [data, setData] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const { t } = useAppTranslate('auth');

  const renderForm = () => {
    switch (view) {
      case 'register':
        return <RegisterForm onSwitch={setView} setData={setData} />;
      case 'forgot':
        return <ForgotPasswordForm onSwitch={setView} setData={setData} />;
      case 'verify-register':
        return <VerifyCodeFormRegister onSwitch={setView} data={data} />;
      case 'verify':
        return (
          <VerifyCodeForm onSwitch={setView} data={data} setToken={setToken} />
        );
      case 'reset':
        return <ResetPasswordForm onSwitch={setView} token={token} />;
      default:
        return <LoginForm onSwitch={setView} />;
    }
  };

  return (
    <div className="flex flex-row w-full h-screen relative bg-[url('/Background2.png')] bg-cover  bg-center" style={{ minHeight: '100vh' }}>
      {/* 3D Section (Left) */}
      <div className="relative flex flex-col justify-center items-center w-1/2 z-10 ">
        <div className="inline-block">
          <GLBModel 
            modelPath="/model3D/logo_optiverse.glb" 
            autoRotate={true}
          />
        </div>
        
        {/* Title and Description with Space Theme */}
        <div className="text-center space-y-6 max-w-lg">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00eaff] via-[#0099cc] to-[#6600ff] bg-clip-text text-transparent leading-tight">
            {t('english_learning_title')}
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed font-light tracking-wide">
            {t('english_learning_description')}
          </p>
          
          {/* Decorative Stars */}
          <div className="flex justify-center space-x-4 mt-6">
            <div className="w-2 h-2 bg-[#00eaff] rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="w-2 h-2 bg-[#6600ff] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="w-1 h-1 bg-[#00eaff] rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
        </div>
      </div>
      {/* Login Section (Right) */}
     <div className="flex flex-col justify-center items-center w-1/2 z-10">
<div
  className="
    w-full max-w-sm p-10 rounded-xl
    border border-cyan-400/40
    bg-white/5                
    backdrop-blur-2xl         
    shadow-lg shadow-cyan-500/20
  "
>
    {renderForm()}
  </div>
</div>

    </div>
  );
};

export default AuthContainer;
