import { useState } from 'react';

export function useForgotPasswordContainer() {
  const [step, setStep] = useState<'forgot' | 'verify' | 'reset'>('forgot');

  const [email, setEmail] = useState<string>('');

  const [resetToken, setResetToken] = useState<string>('');

  return {
    step,
    setStep,
    email,
    setEmail,
    resetToken,
    setResetToken,
  };
}
