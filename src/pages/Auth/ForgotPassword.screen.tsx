import React from 'react';
import { ForgotPasswordFormProps } from '../../types/auth/props/component.props';
import { useForgotPassword } from '../../hooks/auth/useForgotPassword.hook';
import { Button } from '../../components/common/Button.component';

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSwitch = () => {},
  setData = () => {},
}) => {
  const { email, setEmail, message, loading, handleSubmit } = useForgotPassword(
    {
      onSuccess: email => {
        setData(email);
        onSwitch('verify');
      },
    }
  );

  return (
    <div className="space-y-6 w-full">
      <h2 className="text-2xl font-bold text-white text-center tracking-widest mb-6">Forgot Password</h2>
      <p className="text-white text-center mb-4">Please enter your email to receive a code</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white font-medium mb-1" htmlFor="email">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-[#18223a] border border-[#00eaff40] focus:border-[#00eaff] text-white outline-none transition-all placeholder:text-white"
            required
          />
        </div>
        <Button
          title={loading ? 'Sending...' : 'Send OTP'}
          className="w-full"
          disabled={loading}
          inverted
        />
        {message && (
          <p className="text-sm text-center text-white">{message}</p>
        )}
      </form>
      <p
        onClick={() => onSwitch('login')}
        className="text-[#a6baff] hover:underline cursor-pointer text-center mt-6 transition-all"
      >
        Back to login
      </p>
    </div>
  );
};

export default ForgotPasswordForm;
