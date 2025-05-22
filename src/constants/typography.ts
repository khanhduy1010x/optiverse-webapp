import { FONTS } from "../config/themeConfig";

const rootTextRegular: React.CSSProperties = {
  fontFamily: FONTS.regular,
  fontWeight: 500,
};

const rootTextBold: React.CSSProperties = {
  fontFamily: FONTS.bold,
  fontWeight: 700,
};

export const TEXT = {
  regular10: {
    ...rootTextRegular,
    fontSize: 10,
  },
  regular12: {
    ...rootTextRegular,
    fontSize: 12,
  },
  bold12: {
    ...rootTextBold,
    fontSize: 12,
  },
  regular16: {
    ...rootTextRegular,
    fontSize: 16,
  },
  bold16: {
    ...rootTextBold,
    fontSize: 16,
  },
  regular20: {
    ...rootTextRegular,
    fontSize: 20,
  },
  bold20: {
    ...rootTextBold,
    fontSize: 20,
  },
  regular24: {
    ...rootTextRegular,
    fontSize: 24,
  },
  bold24: {
    ...rootTextBold,
    fontSize: 24,
  },
  regular28: {
    ...rootTextRegular,
    fontSize: 28,
  },
  bold28: {
    ...rootTextBold,
    fontSize: 28,
  },
  regular32: {
    ...rootTextRegular,
    fontSize: 32,
  },
  bold32: {
    ...rootTextBold,
    fontSize: 32,
  },
  bold64: {
    ...rootTextBold,
    fontSize: 64,
  },
};