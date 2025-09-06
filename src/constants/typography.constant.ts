const orgTextRegular = "font-medium";
const orgTextBold = "font-hard";

export const getTypo = (
  size: number,
  isRegular: boolean = true
): string => {
  const base = isRegular ? orgTextRegular : orgTextBold;

  return `${base} text-[${size}px]`;
}
