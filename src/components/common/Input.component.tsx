import React from 'react';
import { FieldValues, useController } from 'react-hook-form';
import { FieldProps } from '../../types/props/input/input.prop';
import COLORS from '../../constants/colors.constant';
import { useTheme } from '../../contexts/theme.context';

const InputField = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = 'text',
  rules,
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
      <input
        id={name}
        {...field}
        type={type}
        placeholder={placeholder}
        style={{
          padding: '8px',
          width: '100%',
          border: '2px solid',
          borderRadius: '4px',
          borderColor: error
            ? COLORS.red500
            : theme.components.button.default.text,
          color: error ? COLORS.red500 : theme.components.button.default.text,
        }}
      />
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

export default InputField;
