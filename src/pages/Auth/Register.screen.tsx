import React from 'react';
import COLORS from '../../constants/colors.constant';
import { Button } from '../../components/common/Button.component';
import { RegisterFormProps } from '../../types/auth/props/component.props';
import { GROUP_CLASSNAMES } from '../../styles';
import { useRegisterForm } from '../../hooks/auth/useRegister.hook';
import InputField, {
  PasswordInputField,
} from '../../components/common/Input.component';
import { RegisterForm } from '../../types/auth/auth.types';
import { isNotEmpty } from '../../utils/validate.util';

const RegisterFormScreen: React.FC<RegisterFormProps> = ({
  onSwitch,
  setData,
}) => {
  const { onSubmit, control, handleSubmit, watch } = useRegisterForm({
    onSuccess: (email: string) => {
      setData(email);
      onSwitch('verify-register');
    },
  });

  return (
    <div className="w-3/5 grid gap-10">
      <h2 className="w-full text-2xl font-bold text-gray-800 text-center">
        Register
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
        <div>
          <InputField<RegisterForm>
            name="full_name"
            control={control}
            label="Full name"
            placeholder="Enter your full name"
            rules={{
              required: 'is required',
              minLength: {
                value: 10,
                message: 'at least 10 characters',
              },
              setValueAs: v => v.trim(),
              validate: v => isNotEmpty(v) || 'not only white space',
            }}
          />
        </div>
        <div>
          <InputField<RegisterForm>
            name="email"
            control={control}
            label="Email"
            placeholder="you@example.com"
            rules={{
              required: 'is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'is invalid',
              },
              setValueAs: v => v.trim(),
              validate: v => isNotEmpty(v) || 'not only white space',
            }}
          />
        </div>

        <div>
          <PasswordInputField<RegisterForm>
            control={control}
            name="password"
            label={'Password'}
          />
        </div>

        <div>
          <PasswordInputField<RegisterForm>
            control={control}
            name="confirmPassword"
            label={'Confirm Password'}
            rules={{
              validate: value =>
                value === watch('password') || 'does not match password',
            }}
          />
        </div>
        <Button title="Create Account" className="w-full" inverted />
      </form>
      <p
        onClick={() => onSwitch('login')}
        className={GROUP_CLASSNAMES.linkHover + ' text-center'}
        style={{ color: COLORS.yellow700 }}
      >
        Already have an account ? Login
      </p>
    </div>
  );
};

export default RegisterFormScreen;
