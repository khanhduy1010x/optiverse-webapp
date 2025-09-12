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
    <div >
      <h2 className="w-full text-2xl font-bold text-white text-center tracking-widest mb-6">
        Register
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <div>
          <label className="block text-white font-medium mb-1" htmlFor="full_name">Full name</label>
          <InputField<RegisterForm>
            name="full_name"
            control={control}
            label={undefined}
            placeholder="Enter your full name"
            className="bg-[#18223a] border border-[#00eaff40] focus:border-[#00eaff] text-white placeholder:text-white rounded-md px-4 py-2 outline-none transition-all"
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
          <label className="block text-white font-medium mb-1" htmlFor="email">Email</label>
          <InputField<RegisterForm>
            name="email"
            control={control}
            label={undefined}
            placeholder="you@example.com"
            className="bg-[#18223a] border border-[#00eaff40] focus:border-[#00eaff] text-white placeholder:text-white rounded-md px-4 py-2 outline-none transition-all"
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
          <label className="block text-white font-medium mb-1" htmlFor="password">Password</label>
          <PasswordInputField<RegisterForm>
            control={control}
            name="password"
            label={undefined}
            placeholder="Enter password"
            className="bg-[#18223a] border border-[#00eaff40] focus:border-[#00eaff] text-white placeholder:text-white rounded-md px-4 py-2 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-white font-medium mb-1" htmlFor="confirmPassword">Confirm Password</label>
          <PasswordInputField<RegisterForm>
            control={control}
            name="confirmPassword"
            label={undefined}
            placeholder="Enter password"
            className="bg-[#18223a] border border-[#00eaff40] focus:border-[#00eaff] text-white placeholder:text-white rounded-md px-4 py-2 outline-none transition-all"
            rules={{
              validate: value =>
                value === watch('password') || 'does not match password',
            }}
          />
        </div>
        <Button title="Create Account" className="w-full py-2 rounded-md bg-[#10182a] border border-[#00eaff] text-white font-bold tracking-wide hover:bg-[#00eaff20] transition-all" inverted={false} />
      </form>
      <p
        onClick={() => onSwitch('login')}
        className="text-[#a6baff] hover:underline text-center cursor-pointer mt-6 transition-all"
      >
        Already have an account ? Login
      </p>
    </div>
  );
};

export default RegisterFormScreen;
