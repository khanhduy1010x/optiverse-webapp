import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface TouchedFields {
  [key: string]: boolean;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  const validateField = useCallback((fieldName: string, value: any): string | null => {
    const rule = rules[fieldName];
    if (!rule) return null;

    // Check if value is empty (including 0 is a valid number, NaN is invalid)
    const isEmpty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
    const isNaN = typeof value === 'number' && Number.isNaN(value);

    // Required validation
    if (rule.required && (isEmpty || isNaN)) {
      return 'This field is required';
    }

    // Custom validation (always call custom validation, don't skip for empty)
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) return customError;
    }

    // Skip other validations if field is empty and not required (but custom was already checked)
    if (isEmpty) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      // Min length validation
      if (rule.minLength && value.length < rule.minLength) {
        return `Must be at least ${rule.minLength} characters`;
      }

      // Max length validation
      if (rule.maxLength && value.length > rule.maxLength) {
        return `Must not exceed ${rule.maxLength} characters`;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        return 'Invalid format';
      }
    }

    return null;
  }, [rules]);

  const validateSingleField = useCallback((fieldName: string, value: any) => {
    const error = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }));
    return !error;
  }, [validateField]);

  const validateForm = useCallback((formData: any): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    
    // Mark all fields as touched
    const allTouched: TouchedFields = {};
    Object.keys(rules).forEach(fieldName => {
      allTouched[fieldName] = true;
    });
    setTouched(allTouched);

    return isValid;
  }, [rules, validateField]);

  const setFieldTouched = useCallback((fieldName: string) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, []);

  const hasError = useCallback((fieldName: string): boolean => {
    return touched[fieldName] && !!errors[fieldName];
  }, [touched, errors]);

  const getError = useCallback((fieldName: string): string => {
    return touched[fieldName] ? errors[fieldName] || '' : '';
  }, [touched, errors]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    validateForm,
    validateSingleField,
    setFieldTouched,
    hasError,
    getError,
    clearErrors,
    errors,
    touched
  };
};