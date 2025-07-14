import React, { useMemo } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday } from 'date-fns';
import { CalendarEvent } from './CalendarEvent.component';

interface MonthViewProps {
  currentDate: Date;
  taskEvents: TaskEvent[];
  handleAddEvent: (date?: Date, hour?: number) => void;
  handleEditEvent: (event: TaskEvent) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  taskEvents,
  handleAddEvent,
  handleEditEvent
}) => {
  // Tạo mảng các ngày trong tháng (bao gồm cả ngày của tháng trước và tháng sau để hiển thị đủ lịch)
  const days = useMemo(() => {
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const startDate = startOfWeek(monthStart);
      const endDate = endOfWeek(monthEnd);

      const daysArray = [];
      let day = startDate;

      while (day <= endDate) {
        daysArray.push(day);
        day = addDays(day, 1);
      }

      return daysArray;
    } catch (error) {
      console.error('Error generating month days:', error);
      return [];
    }
  }, [currentDate]);

  // Hàm lấy màu sắc cho sự kiện
  const getEventColor = (event: TaskEvent) => {
    if (event.color) return event.color;
    
    // Màu mặc định dựa trên title nếu không có màu được chỉ định
    const colors = [
      'bg-blue-200 hover:bg-blue-300 border-blue-300 text-blue-800',
      'bg-green-200 hover:bg-green-300 border-green-300 text-green-800',
      'bg-purple-200 hover:bg-purple-300 border-purple-300 text-purple-800',
      'bg-red-200 hover:bg-red-300 border-red-300 text-red-800',
      'bg-yellow-200 hover:bg-yellow-300 border-yellow-300 text-yellow-800',
      'bg-pink-200 hover:bg-pink-300 border-pink-300 text-pink-800',
      'bg-indigo-200 hover:bg-indigo-300 border-indigo-300 text-indigo-800'
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

  // Kiểm tra xem một sự kiện có thuộc về một ngày cụ thể không
  const getEventsForDay = (day: Date) => {
    try {
      return taskEvents.filter(event => {
        const eventDate = new Date(event.start_time);
        return (
          eventDate.getDate() === day.getDate() &&
          eventDate.getMonth() === day.getMonth() &&
          eventDate.getFullYear() === day.getFullYear()
        );
      });
    } catch (error) {
      console.error('Error filtering events for day:', error, day);
      return [];
    }
  };

  // Hàm định dạng thời gian
  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Hàm tạo các hàng cho lịch
  const renderCalendarRows = () => {
    const rows: React.ReactNode[] = [];
    let cells: React.ReactNode[] = [];

    // Tên các ngày trong tuần
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Tạo header cho lịch
    rows.push(
      <div key="header" className="grid grid-cols-7 border-b bg-gray-50">
        {weekDays.map((day, index) => (
          <div 
            key={index} 
            className={`p-2 text-center font-semibold text-sm text-gray-600 border-r ${
              index === 0 || index === 6 ? 'text-red-500' : ''
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    );

    // Tạo các ô cho từng ngày
    days.forEach((day, i) => {
      const dayEvents = getEventsForDay(day);
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isTodayDate = isToday(day);
      
      cells.push(
        <div
          key={i}
          className={`min-h-[120px] p-1 border-r border-b relative ${
            !isCurrentMonth ? 'bg-gray-50' : ''
          }`}
          onClick={() => handleAddEvent(day, 9)} // Mặc định thêm sự kiện vào 9 giờ sáng
        >
          {/* Hiển thị ngày */}
          <div 
            className={`text-right p-1 ${
              !isCurrentMonth ? 'text-gray-400' : 'text-gray-700'
            }`}
          >
            <span 
              className={`inline-block w-7 h-7 rounded-full text-center leading-7 ${
                isTodayDate ? 'bg-blue-500 text-white' : ''
              }`}
            >
              {format(day, 'd')}
            </span>
          </div>
          
          {/* Hiển thị các sự kiện trong ngày */}
          <div className="mt-1 max-h-[90px] overflow-y-auto flex flex-col items-start gap-1">
            {dayEvents.slice(0, 3).map((event, index) => (
              <CalendarEvent
                key={event._id || index}
                event={event}
                onClick={() => handleEditEvent(event)}
                className="w-full block"
              />
            ))}
            
            {/* Hiển thị số sự kiện còn lại nếu có nhiều hơn 3 */}
            {dayEvents.length > 3 && (
              <div className="text-xs text-center bg-gray-100 rounded py-0.5 cursor-pointer">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );

      // Tạo hàng mới sau mỗi 7 ô (1 tuần)
      if ((i + 1) % 7 === 0) {
        rows.push(
          <div key={i} className="grid grid-cols-7">
            {cells}
          </div>
        );
        cells = [];
      }
    });

    // Thêm hàng cuối cùng nếu còn cells
    if (cells.length > 0) {
      rows.push(
        <div key="last-row" className="grid grid-cols-7">
          {cells}
        </div>
      );
    }

    return rows;
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header hiển thị tháng và năm */}
      <div className="border-b p-2 bg-white sticky top-0 z-10">
        <h2 className="text-xl font-semibold text-center text-gray-800">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>

      {/* Lưới lịch */}
      <div className="flex-grow">
        {renderCalendarRows()}
      </div>
    </div>
  );
}; 