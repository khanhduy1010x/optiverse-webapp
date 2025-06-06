import { useRef } from 'react';

export interface CardInteractionProps {
  onClick?: () => void;
  onLongPress?: () => void;
  onContextMenu?: () => void;
}

export function useCardInteractions({
  onClick,
  onLongPress,
  onContextMenu,
}: CardInteractionProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button !== 0 || !onLongPress) return;

    longPressTriggered.current = false;
    timerRef.current = setTimeout(() => {
      longPressTriggered.current = true;
      onLongPress();
    }, 500);
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (event.button !== 0 || !onClick) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    if (!longPressTriggered.current) {
      onClick();
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    if (onContextMenu) {
      onContextMenu();
    }
  };

  return {
    handleMouseDown,
    handleMouseUp,
    handleContextMenu,
  };
}
