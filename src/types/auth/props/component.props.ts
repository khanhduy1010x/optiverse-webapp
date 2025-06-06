import { Dispatch, SetStateAction } from 'react';
import { AuthViewType } from '../auth.types';

export interface LoginFormProps {
  onSwitch: (view: AuthViewType) => void;
}

export interface RegisterFormProps {
  onSwitch: (view: AuthViewType) => void;
  setData: Dispatch<SetStateAction<string>>;
}

export interface ForgotPasswordFormProps {
  onSwitch: (view: AuthViewType) => void;
  setData: Dispatch<SetStateAction<string>>;
}

export interface VerifyCodeFormProps {
  onSwitch: (view: AuthViewType) => void;
  data: string;
  setToken?: Dispatch<SetStateAction<string>>;
}

export interface VerifyCodeRegisterFormProps {
  onSwitch: (view: AuthViewType) => void;
  data: string;
}

export interface ResetPasswordFormProps {
  onSwitch: (view: AuthViewType) => void;
  token: string;
}

export interface AuthContainerProps {
  initialView?: AuthViewType;
}
