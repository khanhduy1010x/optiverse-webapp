import React from 'react';
import COLORS from '../../constants/colors.constant';
import { TEXT } from '../../constants/typography.constant';
import { useTheme } from '../../contexts/theme.context';
import { GROUP_CLASSNAMES } from '../../styles';
import Text from './Text.component';
import View from './View.component';

interface Props {
  placeholder?: string;
  label: string;
  transparent?: boolean;
  error?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Input: React.FC<Props> = ({
  label,
  transparent = false,
  error,
  className = '',
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
  };

  const labelStyles: React.CSSProperties = {
    position: 'absolute',
    top: 10,
    left: 12,
    color: error ? COLORS.red500 : COLORS.black200,
    zIndex: 1,
    ...TEXT.regular10,
  };

  const inputStyles: React.CSSProperties = {
    backgroundColor: transparent ? theme.buttonBackground : theme.buttonText,
    color: error ? COLORS.red500 : (transparent ? theme.buttonText : theme.buttonBackground),
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: error ? COLORS.red500 : COLORS.black200,
    paddingTop: 28,
    paddingLeft: 11,
    paddingRight: 11,
    paddingBottom: 12,
    ...TEXT.regular16,
  };

  return (
    <View style={containerStyles}>
      <Text title={label} style={labelStyles} />
      {error && (
        <Text
          title={error}
          style={{ ...labelStyles, color: COLORS.red500 }}
          className="ml-1"
          translate={false}
        />
      )}
      <input
        className={`${GROUP_CLASSNAMES.formInput} ${className}`}
        style={{ ...inputStyles, ...style }}
        {...props}
      />
    </View>
  );
};

export default Input;