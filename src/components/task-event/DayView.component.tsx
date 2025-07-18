import React, { useMemo } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { format } from 'date-fns';
import { CalendarEvent } from './CalendarEvent.component';

interface DayViewProps {
  currentDate: Date;
  currentTime: Date;
  taskEvents: TaskEvent[];
  handleAddEvent: (date?: Date, hour?: number) => void;
  handleEditEvent: (event: TaskEvent) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  currentTime,
  taskEvents,
  handleAddEvent,
  handleEditEvent
}) => {
  // Tạo mảng các giờ trong ngày
  const hours = useMemo(() => {
    return Array.from({ length: 24 }).map((_, index) => index);
  }, []);

  // Kiểm tra xem hiện tại có phải là giờ hiện tại không
  const isCurrentHour = (hour: number) => {
    try {
      return (
        currentTime.getHours() === hour &&
        currentTime.getDate() === currentDate.getDate() &&
        currentTime.getMonth() === currentDate.getMonth() &&
        currentTime.getFullYear() === currentDate.getFullYear()
      );
    } catch (error) {
      console.error('Error checking if current hour:', error, hour);
      return false;
    }
  };
    
  // Hàm lấy màu sắc cho sự kiện
  const getEventColor = (event: TaskEvent) => {
    if (event.color) return event.color;
    
    // Màu mặc định dựa trên title nếu không có màu được chỉ định
    const colors = [
      'bg-blue-200 hover:bg-blue-300 border-blue-300',
      'bg-green-200 hover:bg-green-300 border-green-300',
      'bg-purple-200 hover:bg-purple-300 border-purple-300',
      'bg-red-200 hover:bg-red-300 border-red-300',
      'bg-yellow-200 hover:bg-yellow-300 border-yellow-300',
      'bg-pink-200 hover:bg-pink-300 border-pink-300',
      'bg-indigo-200 hover:bg-indigo-300 border-indigo-300'
    ];

    // Tạo một số ngẫu nhiên nhưng nhất quán dựa trên title
    let hash = 0;
    for (let i = 0; i < event.title.length; i++) {
      hash = ((hash << 5) - hash) + event.title.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Lấy màu từ mảng màu
    return colors[Math.abs(hash) % colors.length];
  };

  // Hàm định dạng thời gian
  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Kiểm tra xem một sự kiện có thuộc về giờ cụ thể không
  const isEventInHour = (event: TaskEvent, hour: number) => {
    try {
      const eventDate = new Date(event.start_time);
      return eventDate.getHours() === hour;
    } catch (error) {
      console.error('Error checking if event is in hour:', error, event, hour);
      return false;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header hiển thị ngày hiện tại */}
      <div className="flex border-b sticky top-0 bg-white z-10 shadow-sm">
        <div className="w-20 flex-shrink-0 border-r bg-gray-50"></div>
        <div className="flex-1 p-4 text-center">
          <div className="font-medium text-blue-600 text-lg md:text-xl">{format(currentDate, 'EEEE')}</div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800">{format(currentDate, 'MMMM d, yyyy')}</div>
        </div>
      </div>

      {/* Lưới thời gian */}
      <div className="flex-grow overflow-x-auto">
        {hours.map((hour) => {
          const isCurrentTimeHour = isCurrentHour(hour);
          const isWorkingHour = hour >= 9 && hour <= 17; // 9 AM - 5 PM

          return (
            <div key={hour} className="flex border-b hover:bg-blue-50/30 group transition-colors min-w-[340px] md:min-w-0">
              {/* Nhãn giờ */}
              <div className="w-20 flex-shrink-0 border-r text-sm text-gray-600 p-2 sticky left-0 bg-white flex items-center justify-center select-none">
                <span className="font-medium">
                  {(() => {
                    if (hour === 0) return '12 AM';
                    if (hour < 12) return `${hour} AM`;
                    if (hour === 12) return '12 PM';
                    return `${hour - 12} PM`;
                  })()}
                </span>
              </div>
              {/* Ô cho giờ */}
              <div 
                className={`flex-1 h-24 relative transition-colors ${
                  isCurrentTimeHour ? 'bg-blue-100/60' : 
                  isWorkingHour ? 'bg-gray-50/70' : ''
                }`}
              >
                {/* Đường chỉ thời gian hiện tại */}
                {isCurrentTimeHour && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-pink-500 z-10 animate-pulse"
                    style={{
                      top: `${(currentTime.getMinutes() / 60) * 100}%`,
                    }}
                  >
                    <div className="absolute -left-1 -top-2.5 w-5 h-5 rounded-full bg-pink-500 shadow-md flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  </div>
                )}
                {/* Container cho các sự kiện trong giờ này */}
                <div className="absolute inset-0 p-1 flex flex-col gap-1">
                  {taskEvents
                    .filter(event => isEventInHour(event, hour))
                    .map((event, eventIndex) => {
                      try {
                        return (
                          <CalendarEvent
                            key={event._id || eventIndex}
                            event={event}
                            onClick={() => handleEditEvent(event)}
                            className="w-full block mb-1 rounded-xl shadow-md hover:scale-[1.03] transition-all duration-200"
                          />
                        );
                      } catch (error) {
                        console.error('Error rendering event:', error, event);
                        return null;
                      }
                    })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 