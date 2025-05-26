import COLORS from "../constants/colors";
import { TEXT } from "../constants/typography";
 
const rootBackgroundStyles = {
  padding: 12,
  borderRadius: 4,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
} as const;

const rootTextBtnStyles = {
  ...TEXT.bold20,
  textAlign: "center",
} as const;

const rootViewStyles = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
} as const;

export const BUTTON_STYLES = {
  rootbg: {
    ...rootBackgroundStyles,
  },
  rootText: {
    ...rootTextBtnStyles,
  },
  rootView: {
    ...rootViewStyles,
  },
  darkbg: {
    ...rootBackgroundStyles,
    backgroundColor: COLORS.black500,
  },
  lightbg: {
    ...rootBackgroundStyles,
    backgroundColor: COLORS.white900,
  },
  textdarkbg: {
    ...rootTextBtnStyles,
    color: COLORS.white900,
  },
  textlightbg: {
    ...rootTextBtnStyles,
    color: COLORS.black500,
  },
  circlebg: {
    aspectRatio: 1,
    borderRadius: 9999,
    justifyContent: "center",
  },
} as const;
