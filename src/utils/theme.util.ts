import tinycolor from 'tinycolor2';
import { AppTheme } from '../types/theme.type';
import COLORS from '../constants/colors.constant';

export function generateThemeFromPrimary(
  primaryColor: string,
): AppTheme {
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
  };
}

export function makeCircleShadow({ n = 16, s = 6, t = 1, color = '#000', spread = 0.25 }) {
  const c = (n - 1) / 2;
  const r = c;
  const cells = [];

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const d = Math.hypot(x - c, y - c);
      if (Math.abs(d - r) <= t / 2) cells.push([x, y]);
    }
  }

  const shadow = cells.map(([x, y]) => `${x * s}px ${y * s}px 0 ${spread}px ${color}`).join(', ');

  return shadow;
}