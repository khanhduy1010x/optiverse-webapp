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

// Task Event Validation Functions
export const validateTaskEventDateTime = (startTime: Date | string, endTime?: Date | string): string | true => {
  try {
    // Convert to Date objects if they are strings
    const start = startTime instanceof Date ? startTime : new Date(startTime);
    const end = endTime ? (endTime instanceof Date ? endTime : new Date(endTime)) : null;

    // Check if start time is valid
    if (isNaN(start.getTime())) {
      return 'start_time_invalid';
    }

    // If end time is provided, validate it
    if (end) {
      if (isNaN(end.getTime())) {
        return 'end_time_invalid';
      }

      // Check if end time is after start time
      if (end <= start) {
        return 'end_time_must_be_after_start_time';
      }
    }

    return true;
  } catch (error) {
    return 'datetime_validation_error';
  }
};

export const validateTaskEventTitle = (title: string): string | true => {
  if (!title || !isNotEmpty(title)) {
    return 'title_required';
  }

  if (!isLengthIn(title, 1, 100)) {
    return 'title_length_invalid';
  }

  return true;
};

export const validateTaskEventDescription = (description?: string): string | true => {
  if (description && description.length > 500) {
    return 'description_too_long';
  }

  return true;
};

export const validateTaskEvent = (data: {
  title: string;
  start_time: Date | string;
  end_time?: Date | string;
  description?: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate title
  const titleValidation = validateTaskEventTitle(data.title);
  if (titleValidation !== true) {
    errors.push(titleValidation);
  }

  // Validate datetime
  const datetimeValidation = validateTaskEventDateTime(data.start_time, data.end_time);
  if (datetimeValidation !== true) {
    errors.push(datetimeValidation);
  }

  // Validate description
  const descriptionValidation = validateTaskEventDescription(data.description);
  if (descriptionValidation !== true) {
    errors.push(descriptionValidation);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
