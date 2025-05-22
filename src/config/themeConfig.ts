const COLORS = {
  white900: '#FFFFFF',
  black500: '#1A202C',
};

export const lightTheme = {
  background: COLORS.white900,
  text: COLORS.black500,
  buttonBackground: COLORS.black500,
  buttonText: COLORS.white900,
};

export const darkTheme = {
  background: COLORS.black500,
  text: COLORS.white900,
  buttonBackground: COLORS.white900,
  buttonText: COLORS.black500,
};

export const FONTS = {
  regular: 'NotoSans-Regular',
  bold: 'NotoSans-Bold',
} as const;

export type FontKeys = keyof typeof FONTS;