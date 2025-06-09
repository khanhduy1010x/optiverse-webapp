import { Control, RegisterOptions, FieldValues, Path } from 'react-hook-form';

export interface FieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  type?: string;
  rules?: RegisterOptions<T, Path<T>>;
  rows?: number;
}
