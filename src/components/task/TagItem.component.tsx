import React, { useMemo } from 'react';
import { Tag } from '../../types/task/response/tag.response';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import './TagItem.component.css';

interface TagItemProps {
  tag: Tag;
  className?: string;
}

/**
 * Component TagItem hiển thị một tag duy nhất với phong cách Apple
 * - Thiết kế gọn gàng, thanh lịch
 * - Smooth transitions và hover effects
 * - Sử dụng CSS variables để áp dụng màu tag
 */
export const TagItem: React.FC<TagItemProps> = ({ tag, className = '' }) => {
  const { t } = useAppTranslate();
  
  // Memoize style calculation để tránh re-render không cần thiết
  const tagStyle = useMemo(() => {
    const bgColor = tag.color ? `${tag.color}20` : '#f3f4f6';
    const textColor = tag.color || '#6b7280';
    
    return {
      '--tag-bg-color': bgColor,
      '--tag-text-color': textColor
    } as React.CSSProperties;
  }, [tag.color]);

  return (
    <span
      className={`tag-item ${className}`}
      style={tagStyle}
      title={tag.name}
    >
      {tag.name || t('unnamed_tag')}
    </span>
  );
};

export default TagItem;
