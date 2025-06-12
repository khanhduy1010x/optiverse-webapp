import authService from '../../services/auth.service';
import { RegisterForm } from '../../types/auth/auth.types';
import { useForm } from 'react-hook-form';

interface UseRegisterFormProps {
  onSuccess: (email: string) => void;
}

export function useRegisterForm({ onSuccess }: UseRegisterFormProps) {
  const { handleSubmit, control, watch, setError } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    console.log('Registering with:', { data });

    try {
      await authService.register({
        email: watch('email'),
        full_name: watch('full_name'),
        password: watch('password'),
      });
      onSuccess(watch('email'));
    } catch (error: any) {
      if (error.type === 'email') {
        setError('email', {
          message: error.message,
        });
      }
    }
  };

  return {
    onSubmit,
    control,
    handleSubmit,
    watch,
  };
}
