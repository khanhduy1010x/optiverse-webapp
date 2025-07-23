import React, { useState } from 'react';
import LoginForm from './Login.screen';
import RegisterForm from './Register.screen';
import ForgotPasswordForm from './ForgotPassword.screen';
import VerifyCodeFormRegister from './VerifyCodeRegister.screen';
import LogoInAuth from '../../components/common/Logo/LogoInAuth';
import ResetPasswordForm from './ResetPassword.screen';
import VerifyCodeForm from './VerifyCode.screen';
import { AuthContainerProps } from '../../types/auth/props/component.props';
import { AuthViewType } from '../../types/auth/auth.types';
import UniverseBackground from '../../components/common/UniverseBackground';

const AuthContainer: React.FC<AuthContainerProps> = ({
  initialView = 'login',
}) => {
  const [view, setView] = useState<AuthViewType>(initialView);
  const [data, setData] = useState<string>('');
  const [token, setToken] = useState<string>('');

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
    <div className="flex flex-row w-full h-screen relative" style={{ minHeight: '100vh' }}>
      <UniverseBackground />
      {/* Welcome Section */}
      <div className="flex flex-col justify-center items-start w-1/2 px-20 z-10">
        <div className="mb-8">
          <LogoInAuth onSwitch={setView} />
        </div>
        <h1 className="text-6xl font-extrabold text-white mb-4 drop-shadow-lg">Welcom<span className='text-[#00eaff]'>e</span></h1>
        <p className="text-white text-lg mb-8 max-w-lg">
          Đăng ký kênh ủng hộ mình nhé, cảm ơn bạn rất nhiều. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ducimus, nisi?
        </p>
        <button className="px-8 py-2 border-2 border-white text-white rounded-md font-semibold hover:bg-white/10 transition-all">EXPLORE</button>
      </div>
      {/* Login Section */}
      <div className="flex flex-col justify-center items-center w-1/2 z-10">
        <div className="w-full max-w-sm p-10 rounded-xl bg-[#10182a] border-2 border-[#00eaff] shadow-none" style={{ boxShadow: '0 0 16px #00eaff80' }}>
          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
