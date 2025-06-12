import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/app-icon/optiverse.logo.svg';
import { LoginFormProps } from '../../../types/auth/props/component.props';
const LogoInAuth: React.FC<LoginFormProps> = ({ onSwitch }) => {
  return (
    <img
      src={logo}
      alt="Logo"
      className="w-2/3"
      onClick={() => onSwitch('login')}
      style={{
        cursor: 'pointer',
      }}
    ></img>
  );
};

export default LogoInAuth;
