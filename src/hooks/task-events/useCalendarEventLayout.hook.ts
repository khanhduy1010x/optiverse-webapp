import { useMemo } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';

interface EventWithLayout extends TaskEvent {
  top?: number;
  height?: number;
  left?: number;
  width?: number;
  column?: number;
  totalColumns?: number;
}

interface LayoutOptions {
  events: TaskEvent[];
  startDate: Date;
  endDate: Date;
  viewType: 'Day' | 'Week' | 'Month';
}

export const useCalendarEventLayout = ({
  events,
  startDate,
  endDate,
  viewType
}: LayoutOptions): EventWithLayout[] => {
  return useMemo(() => {
    try {
      if (!events || !Array.isArray(events) || events.length === 0) {
        return [];
      }

      // Lọc các sự kiện trong khoảng thời gian hiển thị
      const filteredEvents = events.filter(event => {
        try {
          if (!event || !event.start_time) return false;
          
          const eventStart = new Date(event.start_time);
          const eventEnd = event.end_time ? new Date(event.end_time) : new Date(eventStart);
          
          // Kiểm tra xem sự kiện có nằm trong khoảng thời gian hiển thị không
          return eventEnd >= startDate && eventStart <= endDate;
        } catch (error) {
          console.error('Error filtering event:', error, event);
          return false;
        }
      });

      // Sắp xếp các sự kiện theo thời gian bắt đầu
      const sortedEvents = [...filteredEvents].sort((a, b) => {
        try {
          const aStart = new Date(a.start_time).getTime();
          const bStart = new Date(b.start_time).getTime();
          return aStart - bStart;
        } catch (error) {
          console.error('Error sorting events:', error);
          return 0;
        }
      });

      // Tính toán layout cho từng loại view
      if (viewType === 'Day') {
        return calculateDayLayout(sortedEvents);
      } else if (viewType === 'Week') {
        return calculateWeekLayout(sortedEvents, startDate, endDate);
      } else if (viewType === 'Month') {
        return calculateMonthLayout(sortedEvents, startDate, endDate);
      }

      return sortedEvents as EventWithLayout[];
    } catch (error) {
      console.error('Error in useCalendarEventLayout:', error);
      return [];
    }
  }, [events, startDate, endDate, viewType]);
};

// Hàm tính toán layout cho Day view
const calculateDayLayout = (events: TaskEvent[]): EventWithLayout[] => {
  try {
    const eventsWithLayout: EventWithLayout[] = [];
    const columns: { end: number; column: number }[][] = [];
    
    events.forEach(event => {
      try {
        const eventStart = new Date(event.start_time);
        const eventEnd = event.end_time ? new Date(event.end_time) : new Date(eventStart.getTime() + 30 * 60 * 1000); // Default 30 min
        
        // Tính toán vị trí và kích thước
        const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
        const endHour = eventEnd.getHours() + eventEnd.getMinutes() / 60;
        
        const top = (startHour / 24) * 100;
        const height = ((endHour - startHour) / 24) * 100;
        
        // Tìm cột phù hợp
        let column = 0;
        let found = false;
        
        if (!columns[0]) {
          columns[0] = [];
        }
        
        while (!found) {
          if (!columns[column]) {
            columns[column] = [];
            found = true;
          } else {
            // Kiểm tra xem có thể đặt vào cột này không
            const conflicts = columns[column].some(item => {
              return eventStart.getTime() < item.end;
            });
            
            if (!conflicts) {
              found = true;
            } else {
              column++;
            }
          }
        }
        
        // Thêm sự kiện vào cột đã tìm thấy
        columns[column].push({
          end: eventEnd.getTime(),
          column
        });
        
        // Tính toán số cột tổng cộng
        const totalColumns = columns.length;
        
        // Tính toán chiều rộng và vị trí ngang
        const width = 1 / totalColumns * 100;
        const left = (column / totalColumns) * 100;
        
        eventsWithLayout.push({
          ...event,
          top,
          height,
          left,
          width,
          column,
          totalColumns
        });
      } catch (error) {
        console.error('Error calculating layout for event:', error, event);
      }
    });
    
    return eventsWithLayout;
  } catch (error) {
    console.error('Error in calculateDayLayout:', error);
    return [];
  }
};

// Hàm tính toán layout cho Week view
const calculateWeekLayout = (events: TaskEvent[], startDate: Date, endDate: Date): EventWithLayout[] => {
  try {
    // Tạo mảng chứa các sự kiện theo ngày trong tuần
    const dayEvents: TaskEvent[][] = Array(7).fill(0).map(() => []);
    
    // Phân loại các sự kiện theo ngày
    events.forEach(event => {
      try {
        const eventDate = new Date(event.start_time);
        const dayOfWeek = eventDate.getDay(); // 0 = Chủ nhật, 6 = Thứ 7
        
        if (dayOfWeek >= 0 && dayOfWeek < 7) {
          dayEvents[dayOfWeek].push(event);
        }
      } catch (error) {
        console.error('Error categorizing event by day:', error, event);
      }
    });
    
    // Tính toán layout cho từng ngày và kết hợp lại
    let eventsWithLayout: EventWithLayout[] = [];
    
    dayEvents.forEach((events, dayIndex) => {
      try {
        // Tính toán layout cho các sự kiện trong một ngày
        const dayLayout = calculateDayLayout(events);
        
        // Điều chỉnh vị trí ngang cho phù hợp với tuần
        dayLayout.forEach(event => {
          // Chiều rộng của mỗi ngày là 1/7
          const dayWidth = 1/7 * 100;
          
          // Điều chỉnh chiều rộng và vị trí ngang
          if (event.totalColumns && event.totalColumns > 0) {
            // Tính toán lại width dựa trên số cột và chiều rộng của ngày
            const columnWidth = dayWidth / event.totalColumns;
            event.width = columnWidth;
            
            // Tính toán lại left dựa trên vị trí ngày và cột trong ngày
            event.left = dayIndex * dayWidth + (event.column || 0) * columnWidth;
          } else {
            event.width = dayWidth;
            event.left = dayIndex * dayWidth;
          }
        });
        
        eventsWithLayout = [...eventsWithLayout, ...dayLayout];
      } catch (error) {
        console.error('Error calculating layout for day:', error, dayIndex);
      }
    });
    
    return eventsWithLayout;
  } catch (error) {
    console.error('Error in calculateWeekLayout:', error);
    return [];
  }
};

// Hàm tính toán layout cho Month view
const calculateMonthLayout = (events: TaskEvent[], startDate: Date, endDate: Date): EventWithLayout[] => {
  try {
    const eventsWithLayout: EventWithLayout[] = [];
    
    // Tạo bản đồ các sự kiện theo ngày
    const eventsByDate: { [key: string]: TaskEvent[] } = {};
    
    // Phân loại các sự kiện theo ngày
    events.forEach(event => {
      try {
        const eventDate = new Date(event.start_time);
        const dateKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;
        
        if (!eventsByDate[dateKey]) {
          eventsByDate[dateKey] = [];
        }
        
        eventsByDate[dateKey].push(event);
      } catch (error) {
        console.error('Error categorizing event by date:', error, event);
      }
    });
    
    // Tính toán số tuần trong tháng
    const firstDay = new Date(startDate);
    firstDay.setDate(1);
    const firstDayOfWeek = firstDay.getDay();
    
    const lastDay = new Date(endDate);
    const daysInMonth = lastDay.getDate();
    
    const weeksInMonth = Math.ceil((firstDayOfWeek + daysInMonth) / 7);
    
    // Duyệt qua từng ngày trong tháng
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(day);
      
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
      const dayEvents = eventsByDate[dateKey] || [];
      
      // Tính toán vị trí của ngày trong lưới tháng
      const dayOfWeek = currentDate.getDay(); // 0-6
      const weekOfMonth = Math.floor((firstDayOfWeek + day - 1) / 7); // 0-5
      
      // Xử lý các sự kiện trong ngày
      dayEvents.forEach((event, index) => {
        try {
          // Tính toán vị trí và kích thước
          const top = (index / Math.max(dayEvents.length, 1)) * 100;
          const height = (1 / Math.max(dayEvents.length, 1)) * 100;
          
          // Chiều rộng của mỗi ngày là 1/7
          const dayWidth = 1/7 * 100;
          
          // Vị trí ngang dựa trên ngày trong tuần
          const left = dayOfWeek * dayWidth;
          
          eventsWithLayout.push({
            ...event,
            top,
            height,
            left,
            width: dayWidth,
            column: index,
            totalColumns: dayEvents.length
          });
        } catch (error) {
          console.error('Error calculating layout for month event:', error, event);
        }
      });
    }
    
    return eventsWithLayout;
  } catch (error) {
    console.error('Error in calculateMonthLayout:', error);
    return [];
  }
}; 