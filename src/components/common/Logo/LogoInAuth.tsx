import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/app-icon/optiverse.logo.svg';
import { LoginFormProps } from '../../../types/auth/props/component.props';
const LogoInAuth: React.FC<LoginFormProps> = ({ onSwitch }) => {
  return (
    <img
      src={logo}
      alt="Logo"
      className="w-[120%] max-w-[320px] mx-auto logo-glow"
      onClick={() => onSwitch('login')}
      style={{
        cursor: 'pointer',
        filter: 'drop-shadow(0 0 16px #6a4cff) drop-shadow(0 0 32px #fff)',
        padding: '8px',
      }}
    ></img>
  );
};

export default LogoInAuth;
