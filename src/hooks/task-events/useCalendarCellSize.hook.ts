import { useMemo } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';

interface CalendarCellSize {
  height: number;
  top: number;
  duration: number; // Thời gian của sự kiện tính theo phút
}

interface UseCalendarCellSizeProps {
  event: TaskEvent;
  hourHeight: number; // Chiều cao của một giờ trong lịch (px)
  condensedHourHeight?: number; // Chiều cao của giờ ngưng làm việc (px)
  workingHoursStart?: number; // Giờ bắt đầu làm việc (mặc định: 7)
  workingHoursEnd?: number; // Giờ kết thúc làm việc (mặc định: 19)
}

export const useCalendarCellSize = ({
  event,
  hourHeight,
  condensedHourHeight = 40,
  workingHoursStart = 7,
  workingHoursEnd = 19
}: UseCalendarCellSizeProps): CalendarCellSize => {
  return useMemo(() => {
    try {
      // Kiểm tra đầu vào
      if (!event || !event.start_time) {
        console.error('Invalid event in useCalendarCellSize:', event);
        return { height: 20, top: 0, duration: 15 };
      }

      // Chuyển đổi chuỗi thời gian thành đối tượng Date nếu cần
      const startTime = event.start_time instanceof Date ? 
        event.start_time : 
        new Date(event.start_time);
        
      const endTime = event.end_time ? 
        (event.end_time instanceof Date ? event.end_time : new Date(event.end_time)) : 
        new Date(startTime.getTime() + 60 * 60 * 1000); // Mặc định 1 giờ
      
      // Kiểm tra tính hợp lệ của thời gian
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        console.error('Invalid date in useCalendarCellSize:', { startTime, endTime });
        return { height: 20, top: 0, duration: 15 };
      }
      
      // Tính toán thời gian (phút)
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.max(Math.round(durationMs / (60 * 1000)), 15); // Tối thiểu 15 phút
      
      // Tính vị trí top dựa trên giờ bắt đầu
      let top = 0;
      const startHour = startTime.getHours();
      const startMinute = startTime.getMinutes();
      
      // Tính toán vị trí top dựa trên giờ
      for (let hour = 0; hour < startHour; hour++) {
        if (hour >= workingHoursStart && hour <= workingHoursEnd) {
          top += hourHeight;
        } else {
          top += condensedHourHeight;
        }
      }
      
      // Thêm phần phút
      const currentHourHeight = (startHour >= workingHoursStart && startHour <= workingHoursEnd) 
        ? hourHeight 
        : condensedHourHeight;
      
      top += (startMinute / 60) * currentHourHeight;
      
      // Tính chiều cao dựa trên thời lượng
      let height = 0;
      let remainingMinutes = durationMinutes;
      let currentHour = startHour;
      let currentMinute = startMinute;
      
      // Giới hạn số vòng lặp để tránh vòng lặp vô hạn
      let loopCount = 0;
      const maxLoops = 24 * 60; // Tối đa 24 giờ
      
      while (remainingMinutes > 0 && loopCount < maxLoops) {
        // Số phút còn lại trong giờ hiện tại
        const minutesInCurrentHour = 60 - currentMinute;
        
        // Chiều cao của giờ hiện tại
        const isWorkingHour = currentHour >= workingHoursStart && currentHour <= workingHoursEnd;
        const currentHeight = isWorkingHour ? hourHeight : condensedHourHeight;
        
        // Số phút sẽ sử dụng trong giờ hiện tại
        const minutesToUse = Math.min(remainingMinutes, minutesInCurrentHour);
        
        // Thêm chiều cao tương ứng
        height += (minutesToUse / 60) * currentHeight;
        
        // Cập nhật thời gian còn lại
        remainingMinutes -= minutesToUse;
        
        // Chuyển sang giờ tiếp theo nếu cần
        if (remainingMinutes > 0) {
          currentHour = (currentHour + 1) % 24;
          currentMinute = 0;
        }
        
        loopCount++;
      }
      
      // Đảm bảo chiều cao tối thiểu để hiển thị nội dung
      height = Math.max(height, 20);
      
      return { height, top, duration: durationMinutes };
    } catch (error) {
      console.error('Error in useCalendarCellSize:', error);
      return { height: 20, top: 0, duration: 15 };
    }
  }, [event, hourHeight, condensedHourHeight, workingHoursStart, workingHoursEnd]);
}; 