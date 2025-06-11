import authService from '../../services/auth.service';
import { RegisterForm } from '../../types/auth/auth.types';
import { useForm } from 'react-hook-form';

interface UseRegisterFormProps {
  onSuccess: (email: string) => void;
}

export function useRegisterForm({ onSuccess }: UseRegisterFormProps) {
  const { handleSubmit, control, watch } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    console.log('Registering with:', { data });

    await authService.register({
      email: watch('email'),
      full_name: watch('full_name'),
      password: watch('password'),
    });
    onSuccess(watch('email'));
  };

  return {
    onSubmit,
    control,
    handleSubmit,
  };
}
