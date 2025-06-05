import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import VerifyCodeFormRegister from './VerifyCodeFormRegister';
import { AuthView } from '../../types/global.types';
import LogoInAuth from '../../components/common/Logo/LogoInAuth';
import ResetPasswordForm from './ResetPasswordForm';
import VerifyCodeForm from './VerifyCodeForm';

interface AuthContainerProps {
  initialView?: AuthView;
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  initialView = 'login',
}) => {
  const [view, setView] = useState<AuthView>(initialView);
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
        return <VerifyCodeForm onSwitch={setView} data={data} setToken={setToken}/>;
      case 'reset':
        return <ResetPasswordForm onSwitch={setView} token={token}/>;
      default:
        return <LoginForm onSwitch={setView} />;
    }
  };

  return (
    <div className="flex flex-row w-full h-full p-20">
      <div className="w-5/11 flex justify-center items-center bg-white border-r-2 border-black">
        {<LogoInAuth></LogoInAuth>}
      </div>
      <div className="w-6/11 flex justify-center items-center bg-white">
        {renderForm()}
      </div>
    </div>
  );
};

export default AuthContainer;
