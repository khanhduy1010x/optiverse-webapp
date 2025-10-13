import React, { useRef, useState } from 'react';
import { FieldValues, useController } from 'react-hook-form';
import { FieldProps } from '../../types/props/input/input.prop';
import COLORS from '../../constants/colors.constant';
import { useTheme } from '../../contexts/theme.context';
import Icon from './Icon/Icon.component';
import { validatePassword } from '../../utils/validate.util';

const InputField = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = 'text',
  rules,
  iconName,
  onClickIcon,
  className,
}: FieldProps<T>) => {
  const { theme } = useTheme();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            color: error ? COLORS.red500 : theme.components.button.default.text,
          }}
        >
          {error ? `${label} ${error.message}` : label}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          id={name}
          {...field}
          value={field.value ?? ''}
          type={type}
          placeholder={placeholder}
          style={{
            padding: '8px 36px 8px 8px',
            width: '100%',
            border: '2px solid',
            borderRadius: '4px',
            borderColor: error
              ? COLORS.red500
              : theme.components.button.default.text,
            color: error ? COLORS.red500 : theme.components.button.default.text,
          }}
          className={className}
        />
        {iconName && (
          <div
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: onClickIcon ? 'pointer' : 'default',
              userSelect: 'none',
              paddingLeft: '8px',
              borderLeft: '1px solid',
            }}
            onClick={onClickIcon}
          >
            {<Icon name={iconName} />}
          </div>
        )}
      </div>
    </div>
  );
};

export const TextareaField = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  rules,
  rows = 4,
}: FieldProps<T>) => {
  const { theme } = useTheme();
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            color: error ? COLORS.red500 : theme.components.button.default.text,
          }}
        >
          {error ? `${label} ${error.message}` : label}
        </label>
      )}
      <textarea
        id={name}
        {...field}
        rows={rows}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px',
          border: '2px solid',
          borderRadius: '4px',
          borderColor: error
            ? COLORS.red500
            : theme.components.button.default.text,
          color: error ? COLORS.red500 : theme.components.button.default.text,
          resize: 'vertical',
        }}
      />
    </div>
  );
};

export const PasswordInputField = <T extends FieldValues>({
  name,
  label,
  control,
  rules,
  className,
}: FieldProps<T>) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <InputField<T>
      name={name}
      control={control}
      label={label}
      type={showPassword ? 'text' : 'password'}
      placeholder="Enter password"
      className={className}
      rules={{
        required: 'is required',
        setValueAs: v => v.trim(),
        validate: v => validatePassword(v),
        ...rules,
      }}
      iconName={showPassword ? 'eye' : 'hiddenEye'}
      onClickIcon={() => {
        setShowPassword(val => !val);
      }}
    />
  );
};

export const OTPInputField = <T extends FieldValues>({
  name,
  control,
  label,
  rules,
  otpLength = 6,
}: FieldProps<T>) => {
  const { theme } = useTheme();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (i: number, value: string) => {
    const newValue = field.value?.split('') || Array(otpLength).fill('');
    newValue[i] = value;
    field.onChange(newValue.join(''));

    if (value && i < otpLength - 1) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !field.value?.[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        alignItems: 'center',
      }}
    >


      {label && (
        <div className="flex items-center gap-4 w-full justify-center mb-3">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-xs uppercase tracking-[0.4em] text-gray-400 whitespace-nowrap">
            {label}
          </span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>
      )}



      <div style={{ display: 'flex', gap: 24 }}>
        {[...Array(otpLength)].map((_, i) => (
          <input
            key={i}
            type="text"
            maxLength={1}
            {...field}
            value={field.value?.[i] || ''}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            ref={el => {
              if (el) inputRefs.current[i] = el;
            }}
            style={{
              width: '40px',
              height: '40px',
              textAlign: 'center',
              fontSize: '1.25rem',
              border: '2px solid',
              borderColor: error ? COLORS.red500 : theme.components.button.default.text,
              borderRadius: '6px',
            }}
          />
        ))}
      </div>
    </div>

  );
};

export const SearchInputField = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = 'text',
  rules,
  className,
}: FieldProps<T>) => {
  const { theme } = useTheme();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      className={className}
    >
      {label && (
        <label
          htmlFor={name}
          style={{
            color: error ? COLORS.red500 : theme.components.button.default.text,
          }}
        >
          {error ? `${label} ${error.message}` : label}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          id={name}
          {...field}
          value={field.value ?? ''}
          type={type}
          placeholder={placeholder}
          className={`pl-10 p-3 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
        />
      </div>
    </div>
  );
};

export default InputField;
