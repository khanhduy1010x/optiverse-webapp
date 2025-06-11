import React, { useState } from 'react';
import { FieldValues, useController } from 'react-hook-form';
import { FieldProps } from '../../types/props/input/input.prop';
import COLORS from '../../constants/colors.constant';
import { useTheme } from '../../contexts/theme.context';
import Icon from './Icon/Icon.component';
import { isNotEmpty } from '../../utils/validate.util';

const InputField = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = 'text',
  rules,
  iconName,
  onClickIcon,
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
}: FieldProps<T>) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <InputField<T>
      name={name}
      control={control}
      label={label}
      type={showPassword ? 'text' : 'password'}
      placeholder="Enter password"
      rules={{
        required: 'is required',
        minLength: {
          value: 6,
          message: 'at least 6 characters',
        },
        setValueAs: v => v.trim(),
        validate: v => isNotEmpty(v) || 'not only white space',
        ...rules,
      }}
      iconName={showPassword ? 'eye' : 'hiddenEye'}
      onClickIcon={() => {
        setShowPassword(val => !val);
      }}
    />
  );
};

export default InputField;
