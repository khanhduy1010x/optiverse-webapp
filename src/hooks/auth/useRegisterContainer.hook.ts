import { useEffect, useState } from 'react';

export default function useRegisterContainer() {
  const [isShowOTPScreen, setIsShowOTPScreen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>();
  useEffect(() => {
    setIsShowOTPScreen(false);
  }, []);

  return {
    isShowOTPScreen,
    setIsShowOTPScreen,
    email,
    setEmail,
  };
}
