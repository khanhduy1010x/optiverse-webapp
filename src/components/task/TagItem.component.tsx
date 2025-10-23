import React from 'react';
import { Tag } from '../../types/task/response/tag.response';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import './TagItem.component.css';

interface TagItemProps {
  tag: Tag;
  className?: string;
}

/**
 * Component TagItem hiển thị một tag duy nhất
 * Sử dụng CSS variables để áp dụng màu tag
 */
export const TagItem: React.FC<TagItemProps> = ({ tag, className = '' }) => {
  const { t } = useAppTranslate();
  const bgColor = tag.color ? `${tag.color}15` : '#e5e7eb15';
  const textColor = tag.color || '#6b7280';

  const tagStyle = {
    '--tag-bg-color': bgColor,
    '--tag-text-color': textColor
  } as React.CSSProperties;

  return (
    // eslint-disable-next-line react/style-prop-object
    <span
      className={`tag-item ${className}`}
      style={tagStyle}
    >
      {tag.name || t('unnamed_tag')}
    </span>
  );
};

export default TagItem;
