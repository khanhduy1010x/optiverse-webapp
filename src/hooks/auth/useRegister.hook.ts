import { useState } from 'react';

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

    try {
      await fetch(`http://localhost:81/core/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          full_name: fullName,
          password: password,
        }),
      });

      onSuccess(email);
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
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
