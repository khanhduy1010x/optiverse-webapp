import React from 'react';
import { Tag } from '../../types/task/response/tag.response';
import { TagColorDot } from './TagColorDot.component';
import styles from './TagButton.module.css';

interface TagButtonProps {
  tag: Tag;
  isSelected: boolean;
  onSelect: (tag: Tag) => void;
  label: string;
}

interface SelectedTagProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  bgColor: string;
  textColor: string;
}

// Wrapper component để handle inline styles cho selected tag
const SelectedTagButton = React.forwardRef<HTMLButtonElement, SelectedTagProps>(
  ({ bgColor, textColor, ...props }, ref) => {
    const buttonRef = ref as React.MutableRefObject<HTMLButtonElement | null>;
    
    React.useEffect(() => {
      if (buttonRef?.current) {
        buttonRef.current.style.backgroundColor = bgColor + '33';
        buttonRef.current.style.borderColor = bgColor;
        buttonRef.current.style.color = textColor;
      }
    }, [bgColor, textColor, buttonRef]);

    return (
      <button
        ref={buttonRef}
        {...props}
        className={styles['tag-button-selected']}
      />
    );
  }
);

SelectedTagButton.displayName = 'SelectedTagButton';

const getTextColor = (bgColor: string): string => {
  // Chuyển hex sang RGB để tính độ sáng
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Nếu màu tối, dùng text sáng; nếu sáng, dùng text tối
  return brightness > 128 ? '#1f2937' : '#ffffff';
};

export const TagButton: React.FC<TagButtonProps> = ({ tag, isSelected, onSelect, label }) => {
  if (!isSelected) {
    return (
      <button
        type="button"
        onClick={() => onSelect(tag)}
        className="px-3 py-2 rounded-lg text-xs font-medium border transition-colors bg-white border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        title={label}
      >
        <TagColorDot color={tag.color} />
        {tag.name}
      </button>
    );
  }

  // Khi được chọn, hiển thị với màu thực từ tag
  const bgColor = tag.color || '#f3f4f6';
  const textColor = getTextColor(bgColor);
  
  return (
    <SelectedTagButton
      type="button"
      onClick={() => onSelect(tag)}
      bgColor={bgColor}
      textColor={textColor}
      title={label}
    >
      <span className="flex items-center gap-2">
        <TagColorDot color={tag.color} />
        {tag.name}
      </span>
    </SelectedTagButton>
  );
};
