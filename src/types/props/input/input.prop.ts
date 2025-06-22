import { Control, RegisterOptions, FieldValues, Path } from 'react-hook-form';
import { IconName } from '../../../assets/icons';

export type FieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  type?: string;
  rules?: RegisterOptions<T, Path<T>>;
  rows?: number;
  iconName?: IconName;
  onClickIcon?: () => void;
  otpLength?: number;
} & React.InputHTMLAttributes<HTMLInputElement>;
