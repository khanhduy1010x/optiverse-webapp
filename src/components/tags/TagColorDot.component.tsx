import React from 'react';
import styles from './TagButton.module.css';

interface TagColorDotProps {
  color?: string;
}

export const TagColorDot: React.FC<TagColorDotProps> = ({ color }) => {
  if (!color) return null;

  const dotRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (dotRef.current) {
      dotRef.current.style.setProperty('--tag-color', color);
    }
  }, [color]);

  return <span ref={dotRef} className={styles['tag-color-dot']} />;
};
