import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import VerifyCodeForm from './VerifyCodeForm';
import { AuthView } from '../../types/global.types';


interface AuthContainerProps {
  initialView?: AuthView; 
}

const AuthContainer: React.FC<AuthContainerProps> = ({ initialView = 'login' }) => {
  const [view, setView] = useState<AuthView>(initialView);

  const renderForm = () => {
    switch (view) {
      case 'register':
        return <RegisterForm onSwitch={setView} />;
      case 'forgot':
        return <ForgotPasswordForm onSwitch={setView} />;
      case 'verify':
        return <VerifyCodeForm onSwitch={setView} />;
      default:
        return <LoginForm onSwitch={setView} />;
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
      {renderForm()}
    </div>
  );
};

export default AuthContainer;
