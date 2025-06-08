import { useState } from 'react';
import authService from '../../services/auth.service';

interface UseRegisterFormProps {
  onSuccess: (email: string) => void;
}

export function useRegisterForm({ onSuccess }: UseRegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Registering with:', { fullName, email, password });

    await authService.register({
      email,
      full_name: fullName,
      password,
    });
    onSuccess(email);
  };

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
  };
}
