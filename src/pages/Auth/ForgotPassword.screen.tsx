import React from 'react';
import { ForgotPasswordFormProps } from '../../types/auth/props/component.props';
import { useForgotPassword } from '../../hooks/auth/useForgotPassword.hook';

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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
      <p className="text-gray-600">Please enter your email to receive a code</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
        {message && (
          <p className="text-sm text-center text-gray-700">{message}</p>
        )}
      </form>
      <p
        onClick={() => onSwitch('login')}
        className="text-blue-500 hover:underline cursor-pointer text-center"
      >
        Back to login
      </p>
    </div>
  );
};

export default ForgotPasswordForm;
