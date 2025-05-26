import React from 'react';
import COLORS from '../../constants/colors';
import { TEXT } from '../../constants/typography';
import { useTheme } from '../../contexts/ThemeContext';
import { IconName } from '../../assets/icons';
import { BUTTON_STYLES } from '../../styles';
import View from './View';
import Text from './Text';
import Icon from './Icon/Icon';

interface ButtonProps {
  onClick?: () => void;
  label?: string;
  title?: string;
  fontType?: keyof typeof TEXT;
  translate?: boolean;
  transparent?: boolean;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  className?: string;
  textStyle?: React.CSSProperties;
  leftStyle?: React.CSSProperties;
  rightStyle?: React.CSSProperties;
  textViewStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

interface FlashcardButtonProps {
  difficulty: string;
  minutes: number;
  translate?: boolean;
  fontType?: keyof typeof TEXT;
  className?: string;
  textStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

interface CircleButtonProps extends ButtonProps {
  name: IconName;
}

const Button: React.FC<ButtonProps> = ({
  title,
  fontType = 'regular16',
  style,
  textStyle,
  translate = true,
  transparent = false,
  leftComponent,
  rightComponent,
  leftStyle,
  rightStyle,
  textViewStyle,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <button
      className={`transition-all duration-300 ${className}`}
      style={{
        ...BUTTON_STYLES.rootbg,
        backgroundColor: transparent
          ? COLORS.transparent
          : theme.buttonBackground,
        ...style,
      }}
      {...props}
    >
      <View
        style={{
          ...BUTTON_STYLES.rootView,
          backgroundColor: COLORS.transparent,
          color: COLORS.white900,
          ...leftStyle,
        }}
      >
        {leftComponent}
      </View>

      {title && (
        <View
          style={{
            ...BUTTON_STYLES.rootView,
            backgroundColor: COLORS.transparent,
            flex: 1,
            ...textViewStyle,
          }}
        >
          <Text
            title={title}
            textStyle={fontType}
            style={{
              color: transparent ? theme.buttonBackground : theme.buttonText,
              ...textStyle,
            }}
            translate={translate}
          />
        </View>
      )}

      <View
        style={{
          ...BUTTON_STYLES.rootView,
          backgroundColor: COLORS.transparent,
          color: COLORS.white900,
          ...rightStyle,
        }}
      >
        {rightComponent}
      </View>
    </button>
  );
};

const CircleButton: React.FC<CircleButtonProps> = ({
  name = 'add',
  ...props
}) => {
  return (
    <Button
      leftComponent={<Icon name={name} />}
      rightStyle={{ display: 'none' }}
      style={{
        ...BUTTON_STYLES.circlebg,
        position: 'absolute',
        width: 60,
        bottom: 32,
        right: 24,
      }}
      {...props}
    />
  );
};

const FlashcardButton: React.FC<FlashcardButtonProps> = ({
  difficulty,
  minutes,
  fontType = 'regular16',
  translate = true,
  className = '',
  style,
  textStyle,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <button
      className={`transition-all duration-300 ${className}`}
      style={{
        ...BUTTON_STYLES.rootbg,
        flexDirection: 'column',
        gap: 4,
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 8,
        paddingRight: 8,
        backgroundColor: theme.buttonBackground,
        ...style,
      }}
      {...props}
    >
      <Text
        title={difficulty}
        textStyle={fontType}
        style={{
          color: theme.buttonText,
          ...textStyle,
        }}
        translate={translate}
      />
      <Text
        title={`${minutes} minutes`}
        textStyle="regular12"
        style={{
          color: theme.buttonText,
          ...textStyle,
        }}
        translate={translate}
      />
    </button>
  );
};

export { Button, CircleButton, FlashcardButton };
