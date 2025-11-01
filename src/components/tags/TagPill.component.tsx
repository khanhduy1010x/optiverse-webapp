import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { Tag } from '../../types/task/response/tag.response';

interface TagPillProps {
  tag: Tag;
  onRemove?: (tag: Tag) => void;
  className?: string;
  variant?: 'selected' | 'available';
}

/**
 * Component TagPill - Tag pill cho use trong form/selector
 * Phong cách Apple: gọn gàng, thanh lịch
 * 
 * Variants:
 * - selected: Tag đã chọn (với button X)
 * - available: Tag có sẵn để chọn (button để select)
 */
export const TagPill: React.FC<TagPillProps> = ({ 
  tag, 
  onRemove, 
  className = '',
  variant = 'selected'
}) => {
  
  const tagStyle = useMemo(() => {
    const bgColor = tag.color ? `${tag.color}15` : '#f3f4f6';
    const textColor = tag.color || '#6b7280';
    
    return {
      '--tag-bg-color': bgColor,
      '--tag-text-color': textColor
    } as React.CSSProperties;
  }, [tag.color]);

  if (variant === 'selected') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:shadow-sm ${className}`}
        style={tagStyle}
        title={tag.name}
      >
        {tag.name}
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(tag)}
            className="ml-0.5 hover:bg-black/10 rounded-full p-0.5 transition-colors"
            aria-label={`Remove ${tag.name}`}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 border border-current/30 hover:border-current/60 hover:bg-black/5 ${className}`}
      style={{
        color: tag.color || '#6b7280',
        backgroundColor: 'transparent'
      }}
      title={`Add ${tag.name}`}
    >
      {tag.name}
    </button>
  );
};

export default TagPill;
