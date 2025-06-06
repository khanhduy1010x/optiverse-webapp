export const handleChangeOTP = (
  index: number,
  value: string,
  code: string[],
  setCode: (code: string[]) => void,
  inputRefs: (HTMLInputElement | null)[]
) => {
  if (!/^[0-9]?$/.test(value)) return;

  const newCode = [...code];
  newCode[index] = value;
  setCode(newCode);

  if (value && index < 5) {
    inputRefs[index + 1]?.focus();
  }
};

export const handleKeyDownOTP = (
  index: number,
  e: React.KeyboardEvent<HTMLInputElement>,
  code: string[],
  inputRefs: (HTMLInputElement | null)[]
) => {
  if (e.key === 'Backspace' && !code[index] && index > 0) {
    inputRefs[index - 1]?.focus();
  }
};
