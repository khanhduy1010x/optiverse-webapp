export const isNotEmpty = (value: string) => {
  return value.trim() !== '';
};

export const isLengthIn = (value: string, min: number, max: number) => {
  return value.trim().length >= min && value.trim().length <= max;
};

export const validatePassword = (password: string) => {
  if (!isNotEmpty(password)) {
    return 'must not be empty';
  }

  if (!isLengthIn(password, 8, 32)) {
    return 'length must be between 8 to 32 characters';
  }

  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,32}$/;
  if (!regex.test(password)) {
    return 'must contain uppercase, lowercase, number and special character';
  }

  return true;
};

export const validateOTP = (value: string): string | true => {
  const otpRegex = /^\d{6}$/;

  if (!value) {
    return 'OTP is required';
  }

  if (!otpRegex.test(value)) {
    return 'OTP must be 6 digits';
  }

  return true;
};
