import React from 'react';
import COLORS from '../../constants/colors.constant';
import { useTheme } from '../../contexts/theme.context';
import { IconName } from '../../assets/icons';
import { GROUP_CLASSNAMES } from '../../styles';
import Text from './Text.component';
import Icon from './Icon/Icon.component';
import { BUTTON_CSS } from '../../styles/button.style';
import { SystemStyle } from '../../types/theme.type';
import { makeCircleShadow } from '../../utils/theme.util';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  title?: string;
  textType?: 'regular' | 'bold';
  textSize?: number;
  inverted?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  displayLeft?: boolean;
  displayRight?: boolean;
  children?: React.ReactNode;
}

interface FlashcardButtonProps {
  onClick?: () => void;
  difficulty: string;
  minutes: number;
  textType?: 'regular' | 'bold';
  textSize?: number;
  className?: string;
  textStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

interface CircleButtonProps extends ButtonProps {
  name: IconName;
}

const DefaultButton: React.FC<ButtonProps> = ({
  title,
  textType = 'regular',
  textSize = 16,
  className = '',
  inverted = false,
  leftIcon,
  rightIcon,
  displayLeft = true,
  displayRight = true,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const { components } = theme;

  const buttonColor: React.CSSProperties = {
    backgroundColor: inverted ? components.button.inverted.background : components.button.default.background,
    borderColor: inverted ? components.button.inverted.text : components.button.default.text
  }

  const textColor: React.CSSProperties = {
    color: inverted ? components.button.inverted.text : components.button.default.text,
  }

  return <button
    className={`
        ${GROUP_CLASSNAMES.transition} 
        ${BUTTON_CSS.rootbg} 
        border-2 
        ${className} 
      `}
    style={buttonColor}
    {...props}
  >
    {
      (leftIcon || rightIcon) && displayLeft &&
      <div
        className={`${BUTTON_CSS.rootView} 
          bg-transparent
          text-[${COLORS.white900}]
        `}
        style={textColor}
      >
        {leftIcon ? <Icon name={leftIcon as IconName}></Icon> : undefined}
      </div>
    }

    {children ? (
      <div
        className={`${BUTTON_CSS.rootView} 
            bg-transparent
            flex-1
          `}
        style={textColor}
      >
        {children}
      </div>
    ) : title ? (
      <div
        className={`${BUTTON_CSS.rootView} 
            bg-transparent
            flex-1
          `}
      >
        <Text
          title={title}
          textType={textType}
          textSize={textSize}
          style={textColor}
        />
      </div>
    ) : null}

    {
      (leftIcon || rightIcon) && displayRight &&
      <div
        className={`${BUTTON_CSS.rootView} 
          bg-transparent
          text-[${COLORS.white900}]
        `}
        style={textColor}
      >
        {rightIcon ? <Icon name={rightIcon as IconName}></Icon> : undefined}
      </div>
    }
  </button>
}

const NeubrutalismButton: React.FC<ButtonProps> = ({
  title,
  textType = 'regular',
  textSize = 16,
  className = '',
  inverted = false,
  leftIcon,
  rightIcon,
  displayLeft = true,
  displayRight = true,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const { components } = theme;

  const buttonColor: React.CSSProperties = {
    backgroundColor: inverted ? components.button.inverted.background : components.button.default.background,
    borderColor: 'rgba(0,0,0,1)'
  }

  const textColor: React.CSSProperties = {
    color: inverted ? components.button.inverted.text : components.button.default.text,
  }

  return <button
    className={`
        ${GROUP_CLASSNAMES.transition} 
        ${BUTTON_CSS.rootbg} 
        relative inline-flex items-center justify-center border-3 rounded-md shadow-[4px_4px_0px_rgba(0,0,0,1)]
        ${className} 
      `}
    style={buttonColor}
    {...props}
  >
    {
      (leftIcon || rightIcon) && displayLeft &&
      <div
        className={`${BUTTON_CSS.rootView} 
          bg-transparent
          text-[${COLORS.white900}]
        `}
        style={textColor}
      >
        {leftIcon ? <Icon name={leftIcon as IconName}></Icon> : undefined}
      </div>
    }

    {children ? (
      <div
        className={`${BUTTON_CSS.rootView} 
            bg-transparent
            flex-1
          `}
        style={textColor}
      >
        {children}
      </div>
    ) : title ? (
      <div
        className={`${BUTTON_CSS.rootView} 
            bg-transparent
            flex-1
          `}
      >
        <Text
          title={title}
          textType={textType}
          textSize={textSize}
          style={textColor}
        />
      </div>
    ) : null}

    {
      (leftIcon || rightIcon) && displayRight &&
      <div
        className={`${BUTTON_CSS.rootView} 
          bg-transparent
          text-[${COLORS.white900}]
        `}
        style={textColor}
      >
        {rightIcon ? <Icon name={rightIcon as IconName}></Icon> : undefined}
      </div>
    }
  </button>
}

const PixelButton: React.FC<ButtonProps> = ({
  title,
  textType = 'bold',
  textSize = 20,
  className = '',
  inverted = false,
  leftIcon,
  rightIcon,
  displayLeft = true,
  displayRight = true,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const { components } = theme;

  const buttonColor: React.CSSProperties = {
    backgroundColor: inverted ? components.button.inverted.background : components.button.default.background,
    borderColor: inverted ? components.button.inverted.text : components.button.default.text,
    boxShadow: `
      0px 5px black, 0px -5px black, 
      5px 0px black, -5px 0px black,
      0px 10px #00000038, 5px 5px #00000038, 
      -5px 5px #00000038,
      inset 0px 5px #ffffff36
    `,
  }

  const textColor: React.CSSProperties = {
    color: inverted ? components.button.inverted.text : components.button.default.text,
    textTransform: 'uppercase'
  }

  return <button
    className={`
        ${GROUP_CLASSNAMES.transition} 
        ${BUTTON_CSS.rootbg} 
        rounded-none
        border-none
        ${className} 
      `}
    style={buttonColor}
    {...props}
  >
    {
      (leftIcon || rightIcon) && displayLeft &&
      <div
        className={`${BUTTON_CSS.rootView} 
          bg-transparent
          text-[${COLORS.white900}]
        `}
        style={textColor}
      >
        {leftIcon ? <Icon name={leftIcon as IconName}></Icon> : undefined}
      </div>
    }

    {children ? (
      <div
        className={`${BUTTON_CSS.rootView} 
            bg-transparent
            flex-1
          `}
        style={textColor}
      >
        {children}
      </div>
    ) : title ? (
      <div
        className={`${BUTTON_CSS.rootView} 
            bg-transparent
            flex-1
          `}
      >
        <Text
          title={title}
          textType={textType}
          textSize={textSize}
          style={textColor}
        />
      </div>
    ) : null}

    {
      (leftIcon || rightIcon) && displayRight &&
      <div
        className={`${BUTTON_CSS.rootView} 
          bg-transparent
          text-[${COLORS.white900}]
        `}
        style={textColor}
      >
        {rightIcon ? <Icon name={rightIcon as IconName}></Icon> : undefined}
      </div>
    }
  </button>
}

const Button: React.FC<ButtonProps> = ({
  ...props
}) => {
  const { UIStyle } = useTheme();

  if (UIStyle === SystemStyle.Neubrutalism)
    return <NeubrutalismButton {...props}></NeubrutalismButton>

  if (UIStyle === SystemStyle.Pixel) {
    return <PixelButton {...props}></PixelButton>
  }

  return <DefaultButton {...props}></DefaultButton>
};

const DefaultCircleButton: React.FC<CircleButtonProps> = ({
  name = 'add',
  inverted = false,
  className,
  ...props
}) => {
  const { theme } = useTheme();
  const { components } = theme;

  const buttonColor: React.CSSProperties = {
    backgroundColor: inverted ? components.button.inverted.background : components.button.default.background,
    borderColor: inverted ? components.button.inverted.text : components.button.default.text,
  }

  const textColor: React.CSSProperties = {
    color: inverted ? components.button.inverted.text : components.button.default.text,
  }

  return (
    <button
      className={`
        ${GROUP_CLASSNAMES.transition} 
        ${BUTTON_CSS.rootbg} 
        border-2 
        absolute justify-center w-[60px] h-[60px] bottom-[54px] right-[54px] rounded-full
        ${className} 
      `}
      style={buttonColor}
      {...props}
    >
      {
        <div
          className={`${BUTTON_CSS.rootView} 
          bg-transparent
          text-[${COLORS.white900}]
        `}
          style={textColor}
        >
          {name ? <Icon name={name as IconName}></Icon> : undefined}
        </div>

      }
    </button>
  );
}

const NeubrutalismCircleButton: React.FC<CircleButtonProps> = ({
  name = 'add',
  inverted = false,
  className,
  ...props
}) => {
  const { theme } = useTheme();
  const { components } = theme;

  const buttonColor: React.CSSProperties = {
    backgroundColor: inverted ? components.button.inverted.background : components.button.default.background,
    borderColor: 'rgba(0,0,0,1)'
  }

  const textColor: React.CSSProperties = {
    color: inverted ? components.button.inverted.text : components.button.default.text,
  }

  return (
    <button
      className={`
        ${GROUP_CLASSNAMES.transition} 
        ${BUTTON_CSS.rootbg} 
        border-3 
        absolute justify-center w-[60px] h-[60px] bottom-[54px] right-[54px] rounded-full
        shadow-[4px_4px_0px_rgba(0,0,0,1)]
        ${className} 
      `}
      style={buttonColor}
      {...props}
    >
      {
        <div
          className={`${BUTTON_CSS.rootView} 
          bg-transparent
          text-[${COLORS.white900}]
        `}
          style={textColor}
        >
          {name ? <Icon name={name as IconName}></Icon> : undefined}
        </div>

      }
    </button>
  );
}

const PixelCircleButton: React.FC<CircleButtonProps> = ({
  name = 'add',
  inverted = false,
  className,
  ...props
}) => {
  const { theme } = useTheme();
  const { components } = theme;

  const buttonColor: React.CSSProperties = {
    backgroundColor: inverted ? components.button.inverted.background : components.button.default.background,

  }

  const textColor: React.CSSProperties = {
    color: inverted ? components.button.inverted.text : components.button.default.text,
  }

  

  return (
    <button
      className={`
        ${GROUP_CLASSNAMES.transition} 
        ${BUTTON_CSS.rootbg} 

        absolute justify-center w-[60px] h-[60px] bottom-[54px] right-[54px] rounded-full
        border-none

        ${className} 
      `}
      style={buttonColor}
      {...props}
    >
      <span
        className='scale-65'
        style={{
          position: 'absolute', left: -2, top: -2,
          display: 'inline-block', width: '6px', height: '6px',
          background: 'transparent',
          boxShadow: makeCircleShadow({})
        }}
      />
      {
        <div
          className={`${BUTTON_CSS.rootView} 
          bg-transparent
          text-[${COLORS.white900}]
        `}
          style={textColor}
        >
          {name ? <Icon name={name as IconName} ></Icon> : undefined}
        </div>

      }
    </button>
  );
}

const CircleButton: React.FC<CircleButtonProps> = ({
  ...props
}) => {
  const { UIStyle } = useTheme();

  if (UIStyle === SystemStyle.Neubrutalism)
    return <NeubrutalismCircleButton {...props}></NeubrutalismCircleButton>

  if (UIStyle === SystemStyle.Pixel) {
    return <PixelCircleButton {...props}></PixelCircleButton>
  }

  return <DefaultCircleButton {...props}></DefaultCircleButton>
};

const FlashcardButton: React.FC<FlashcardButtonProps> = ({
  onClick,
  difficulty,
  minutes,
  textType = 'regular',
  textSize = 16,
  className = '',
  style,
  textStyle,
  ...props
}) => {
  const { theme } = useTheme();
  const { components } = theme;

  return (
    <button
      className={`${GROUP_CLASSNAMES.transition} ${BUTTON_CSS.rootbg} 
        flex flex-col justify-center w-[100px] h-[80px] 
        pt-1 pb-1 pl-2 pr-2 
        bg-[${components.button.default.background}] 
        ${className}
      `}
      style={{
        ...style,
      }}
      onClick={onClick}
      {...props}
    >
      <Text
        title={difficulty}
        textType={textType}
        textSize={textSize}
        style={{
          ...textStyle,
        }}
      />
      {/* <Text
        title={`${minutes} minutes`}
        textStyle="regular12"
        style={{
          ...textStyle,
        }}
        translate={translate}
      /> */}
    </button>
  );
};

export { Button, CircleButton, FlashcardButton };
export default Button;
