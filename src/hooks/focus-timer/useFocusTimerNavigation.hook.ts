import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useFocusTimerNavigation(initialMenu: string = 'manage') {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState<string>(initialMenu);

  const handleNavigate = (menuKey: string, path: string) => {
    setSelectedMenu(menuKey);
    navigate(path);
  };

  return {
    selectedMenu,
    handleNavigate,
  };
}

export default useFocusTimerNavigation;
