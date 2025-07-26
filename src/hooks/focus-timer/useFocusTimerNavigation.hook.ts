import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useFocusTimerNavigation(initialMenu: string = 'timer') {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMenu, setSelectedMenu] = useState<string>(initialMenu);

  // Xác định menu được chọn dựa trên đường dẫn hiện tại
  useEffect(() => {
    const path = location.pathname;
    if (path === '/focus-timer' || path === '/focus-timer/') {
      setSelectedMenu('timer');
    } else if (path === '/focus-timer/manage') {
      setSelectedMenu('manage');
    } else if (path === '/focus-timer/statistics') {
      setSelectedMenu('statistics');
    }
  }, [location.pathname]);

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