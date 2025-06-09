import tinycolor from 'tinycolor2';
import { AppTheme } from '../types/theme.type';
import COLORS from '../constants/colors.constant';

export function generateThemeFromPrimary(primaryColor: string): AppTheme {
  const primary = tinycolor(primaryColor).toHexString();
  const onPrimary = tinycolor(primary).isLight()
    ? COLORS.black500
    : COLORS.white900;
  const background = tinycolor(primary)
    .desaturate(10)
    .lighten(15)
    .toHexString();
  const surface = tinycolor(primary).lighten(15).toHexString();
  const border = tinycolor(primary).isLight()
    ? COLORS.black500
    : COLORS.white900;
  const text = tinycolor(primary).isLight() ? COLORS.black500 : COLORS.white900;

  return {
    colors: {
      primary,
      onPrimary,
      background,
      surface,
      border,
      text,
    },
    components: {
      button: {
        default: {
          background: primary,
          text: onPrimary,
        },
        inverted: {
          background: onPrimary,
          text: primary,
        },
      },
      input: {
        default: {
          background: primary,
          text: onPrimary,
        },
        inverted: {
          background: onPrimary,
          text: primary,
        },
      },
    },
    fonts: {
      regular: 'NotoSans-Regular',
      bold: 'NotoSans-Bold',
    },
  };
}
