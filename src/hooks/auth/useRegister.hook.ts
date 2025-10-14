import { useState, useMemo } from 'react';
import authService from '../../services/auth.service';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import {
  RegisterFormData,
  UseRegisterFormProps,
} from '../../types/auth/props/component.props';

export function useRegister({ onSuccess }: UseRegisterFormProps) {
  const { t } = useAppTranslate('auth');
  const [formData, setFormData] = useState<RegisterFormData>({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setFormError('');
  };

  const strength = useMemo(() => {
    const pwd = formData.password;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  }, [formData.password]);

  const strengthLabels = [
    t('register_strength_weak'),
    t('register_strength_fair'),
    t('register_strength_good'),
    t('register_strength_strong'),
  ];
  const strengthLabel = strengthLabels[strength - 1] || '';
  const strengthColor =
    ['#ef4444', '#eab308', '#3b82f6', '#22c55e'][strength - 1] || '#d1d5db';

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const name = formData.full_name.trim();

    const nameRegex = /^[A-Za-zÀ-ỹ\s]+$/;
    if (!formData.full_name.trim())
      newErrors.full_name = t('register_error_full_name_required');
    else if (formData.full_name.trim().length < 3)
      newErrors.full_name = t('register_error_full_name_min');
    else if (!nameRegex.test(name))
      newErrors.full_name = t('register_error_full_name_letters_only');

    if (!formData.email.trim())
      newErrors.email = t('register_error_email_required');
    else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = t('register_error_email_invalid');

    if (!formData.password)
      newErrors.password = t('register_error_password_required');
    else if (formData.password.length < 6)
      newErrors.password = t('register_error_password_min');

    if (!formData.confirmPassword)
      newErrors.confirmPassword = t('register_error_confirm_required');
    else if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = t('register_error_confirm_match');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      await authService.register({
        email: formData.email.trim(),
        full_name: formData.full_name.trim(),
        password: formData.password,
      });
    } catch (error: any) {
      const code = error?.response?.data?.code;
      const message = error?.response?.data?.message || '';

      if (code === 1011 || /email exists/i.test(message)) {
        setErrors(prev => ({
          ...prev,
          email: t('register_error_email_taken'),
        }));
        setLoading(false);

        return;
      }
    } finally {
      setLoading(false);
    }
    onSuccess(formData.email);
    setFormData({
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setFormError('');
  };
  const isFormValid =
    formData.full_name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.password.trim() !== '' &&
    formData.confirmPassword.trim() !== '';

  return {
    formData,
    errors,
    handleChange,
    onSubmit,
    focusedField,
    setFocusedField,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    strength,
    strengthLabel,
    strengthColor,
    formError,
    isFormValid,
    loading,
  };
}
