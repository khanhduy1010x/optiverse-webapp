import React from 'react';
import COLORS from '../../constants/colors.constant';
import { TEXT } from '../../constants/typography.constant';
import { useTheme } from '../../contexts/theme.context';
import { IconName } from '../../assets/icons';
import { BUTTON_STYLES, GROUP_CLASSNAMES } from '../../styles';
import View from './View.component';
import Text from './Text.component';
import Icon from './Icon/Icon.component';

interface ButtonProps {
  onClick?: () => void;
  label?: string;
  title?: string;
  fontType?: keyof typeof TEXT;
  translate?: boolean;
  transparent?: boolean;
  inverted?: boolean;
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
  onClick?: () => void;
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
  inverted = false,
  leftComponent,
  rightComponent,
  leftStyle,
  rightStyle,
  textViewStyle,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();
  const { colors, components, fonts } = theme;

  return (
    <button
      className={`${GROUP_CLASSNAMES.transition} ${className}`}
      style={{
        ...BUTTON_STYLES.rootbg,
        backgroundColor: inverted
          ? components.button.inverted.background
          : components.button.default.background,
        border: '2px solid',
        borderColor: inverted
          ? components.button.inverted.text
          : components.button.default.text,
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
              color: inverted
                ? components.button.inverted.text
                : components.button.default.text,
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
  inverted = false,
  ...props
}) => {
  const { theme } = useTheme();
  const { components } = theme;
  return (
    <Button
      leftComponent={
        <Icon
          name={name}
          color={
            inverted
              ? components.button.inverted.text
              : components.button.default.text
          }
        />
      }
      rightStyle={{ display: 'none' }}
      style={{
        ...BUTTON_STYLES.rootbg,
        backgroundColor: inverted
          ? components.button.inverted.background
          : components.button.default.background,
        justifyContent: 'center',
        position: 'absolute',
        width: 60,
        height: 60,
        bottom: 54,
        right: 54,
        borderRadius: '50%',
      }}
      {...props}
    />
  );
};

const FlashcardButton: React.FC<FlashcardButtonProps> = ({
  onClick,
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
  const { colors, components, fonts } = theme;

  return (
    <button
      className={`${GROUP_CLASSNAMES.transition} flex flex-col ${className}`}
      style={{
        ...BUTTON_STYLES.rootbg,
        flexDirection: 'column',
        width: 100,
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 8,
        paddingRight: 8,
        backgroundColor: components.button.default.background,
        ...style,
      }}
      onClick={onClick}
      {...props}
    >
      <Text
        title={difficulty}
        textStyle={fontType}
        style={{
          color: components.button.default.text,
          ...textStyle,
        }}
        translate={translate}
      />
      <Text
        title={`${minutes} minutes`}
        textStyle="regular12"
        style={{
          color: components.button.default.text,
          ...textStyle,
        }}
        translate={translate}
      />
    </button>
  );
};

export { Button, CircleButton, FlashcardButton };
