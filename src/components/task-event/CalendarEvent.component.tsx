import React from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import styles from './CalendarEvent.module.css';

interface CalendarEventProps {
  event: TaskEvent;
  onClick: () => void;
  className?: string;
}

// Apple-style color palette - minimal and elegant
const COLOR_CONFIG = [
  { key: 'purple', dotClass: styles.purpleDot },
  { key: 'blue', dotClass: styles.blueDot },
  { key: 'pink', dotClass: styles.pinkDot },
  { key: 'green', dotClass: styles.greenDot },
  { key: 'orange', dotClass: styles.orangeDot },
  { key: 'red', dotClass: styles.redDot }
];

export const CalendarEvent: React.FC<CalendarEventProps> = ({
  event,
  onClick,
  className
}) => {
  // Use event color if available, otherwise select based on title hash
  const getEventColorStyle = () => {
    if (event.color) {
      return {
        backgroundColor: `${event.color}20`, // 20% opacity
        borderLeftColor: event.color,
        color: event.color
      };
    }
    
    // Fallback to hash-based color selection
    const colorIndex = (event.title?.length || 0) % COLOR_CONFIG.length;
    const colorConfig = COLOR_CONFIG[colorIndex];
    return { colorClass: styles[colorConfig.key as keyof typeof styles] };
  };

  const colorStyle = getEventColorStyle();
  const isCustomColor = event.color !== undefined;
  const colorClass = !isCustomColor ? (colorStyle as any).colorClass : '';
  
  // Format time range
  const formatTimeRange = () => {
    const startDate = new Date(event.start_time);
    const startTime = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
    
    if (event.end_time) {
      const endDate = new Date(event.end_time);
      const endTime = endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
      return `${startTime} - ${endTime}`;
    }
    
    return startTime;
  };
  
  // Get dot color
  const getDotColor = () => {
    if (event.color) {
      return event.color;
    }
    const colorIndex = (event.title?.length || 0) % COLOR_CONFIG.length;
    const colorConfig = COLOR_CONFIG[colorIndex];
    return colorConfig.key;
  };

  return (
    <div
      onClick={onClick}
      className={`${styles.eventCard} ${colorClass} ${className || ''}`}
      style={isCustomColor ? (colorStyle as any) : undefined}
    >
      <div className={styles.eventContent}>
        <div 
          className={styles.eventDot}
          style={isCustomColor ? { backgroundColor: event.color } : undefined}
        ></div>
        <div className={styles.eventBody}>
          <p className={styles.eventTitle}>{event.title || 'Untitled Event'}</p>
          <p className={styles.eventTime}>{formatTimeRange()}</p>
        </div>
      </div>
    </div>
  );
}; 