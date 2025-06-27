import React, { useState, useEffect } from 'react';
import { TaskEvent, RepeatType } from '../../types/task-events/task-events.types';
import { CalendarHeader } from './CalendarHeader.component';
import { CalendarSidebar } from './CalendarSidebar.component';
import { DayView } from './DayView.component';
import { WeekView } from './WeekView.component';
import { MonthView } from './MonthView.component';
import { CreateTaskEventModal } from './CreateTaskEventModal.component';
import { DeleteTaskEventModal } from '../../components/task-event/DeleteTaskEventModal.component';
import { TaskOverdueNotifier } from './TaskOverdueNotifier.component';
import { TaskEventDetail } from './TaskEventDetail.component';
import taskService from '../../services/task.service';
import { useTaskEventOperations } from '../../hooks/task-events/useTaskEventOperations.hook';
import { MiniCalendar } from './MiniCalendar.component';
import { taskEventService } from '../../services/task-event.service';

type ViewType = 'Day' | 'Week' | 'Month' | 'Year';

interface CalendarProps {
  taskId: string;
  taskEvents: TaskEvent[];
  loading: boolean;
  error: string | null;
  addEvent: (event: TaskEvent) => void;
  removeEvent: (eventId: string) => void;
  updateEvent: (eventId: string, event: TaskEvent) => void;
  refreshTaskEvents: () => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  taskId,
  taskEvents,
  loading,
  error,
  addEvent,
  removeEvent,
  updateEvent,
  refreshTaskEvents
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('Week');
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TaskEvent | undefined>(undefined);
  const [eventToDelete, setEventToDelete] = useState<TaskEvent | null>(null);
  const [task, setTask] = useState<any>(null);
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStartTime, setNewEventStartTime] = useState('12:00am');
  const [newEventEndTime, setNewEventEndTime] = useState('1:00am');
  const [startTimeInput, setStartTimeInput] = useState('12:00am');
  const [endTimeInput, setEndTimeInput] = useState('1:00am');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [eventDetail, setEventDetail] = useState<TaskEvent | null>(null);
  
  // Thêm state cho chức năng All day
  const [isAllDay, setIsAllDay] = useState(false);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  // Thêm mới các state để quản lý chức năng lặp lại sự kiện
  const [repeatType, setRepeatType] = useState<RepeatType>('none');
  const [showRepeatOptions, setShowRepeatOptions] = useState(false);
  const [customRepeatFrequency, setCustomRepeatFrequency] = useState(1);
  const [customRepeatUnit, setCustomRepeatUnit] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [customRepeatDays, setCustomRepeatDays] = useState<number[]>([]);
  const [repeatEndType, setRepeatEndType] = useState<'never' | 'on' | 'after'>('never');
  const [repeatEndDate, setRepeatEndDate] = useState<Date | null>(null);
  const [repeatOccurrences, setRepeatOccurrences] = useState(10);
  const [showCustomRepeatModal, setShowCustomRepeatModal] = useState(false);
  
  // Generate time options for dropdown
  const timeOptions = [
    '12:00am', '12:15am', '12:30am', '12:45am',
    '1:00am', '1:15am', '1:30am', '1:45am',
    '2:00am', '2:15am', '2:30am', '2:45am',
    '3:00am', '3:15am', '3:30am', '3:45am',
    '4:00am', '4:15am', '4:30am', '4:45am',
    '5:00am', '5:15am', '5:30am', '5:45am',
    '6:00am', '6:15am', '6:30am', '6:45am',
    '7:00am', '7:15am', '7:30am', '7:45am',
    '8:00am', '8:15am', '8:30am', '8:45am',
    '9:00am', '9:15am', '9:30am', '9:45am',
    '10:00am', '10:15am', '10:30am', '10:45am',
    '11:00am', '11:15am', '11:30am', '11:45am',
    '12:00pm', '12:15pm', '12:30pm', '12:45pm',
    '1:00pm', '1:15pm', '1:30pm', '1:45pm',
    '2:00pm', '2:15pm', '2:30pm', '2:45pm',
    '3:00pm', '3:15pm', '3:30pm', '3:45pm',
    '4:00pm', '4:15pm', '4:30pm', '4:45pm',
    '5:00pm', '5:15pm', '5:30pm', '5:45pm',
    '6:00pm', '6:15pm', '6:30pm', '6:45pm',
    '7:00pm', '7:15pm', '7:30pm', '7:45pm',
    '8:00pm', '8:15pm', '8:30pm', '8:45pm',
    '9:00pm', '9:15pm', '9:30pm', '9:45pm',
    '10:00pm', '10:15pm', '10:30pm', '10:45pm',
    '11:00pm', '11:15pm', '11:30pm', '11:45pm',
  ];
  
  // Fetch the task data when the component mounts
  useEffect(() => {
    const fetchTask = async () => {
      if (taskId && taskId !== 'mock-task-1') {
        try {
          const taskData = await taskService.fetchTaskById(taskId);
          setTask(taskData);
        } catch (error) {
          console.error('Failed to fetch task:', error);
        }
      }
    };
    
    fetchTask();
  }, [taskId]);
  
  // Update current time every minute for the time indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'Day') {
      newDate.setDate(currentDate.getDate() - 1);
    } else if (viewType === 'Week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else if (viewType === 'Month') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else if (viewType === 'Year') {
      newDate.setFullYear(currentDate.getFullYear() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'Day') {
      newDate.setDate(currentDate.getDate() + 1);
    } else if (viewType === 'Week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else if (viewType === 'Month') {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else if (viewType === 'Year') {
      newDate.setFullYear(currentDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Tính toán danh sách end time dựa trên start time đã chọn
  const getEndTimeOptions = () => {
    const startTimeIndex = timeOptions.findIndex(time => time.toLowerCase() === newEventStartTime.toLowerCase());
    if (startTimeIndex === -1) return [];
    
    // Chỉ hiển thị các thời gian sau thời gian bắt đầu
    const availableTimes = timeOptions.slice(startTimeIndex + 1);
    
    // Tạo danh sách tùy chọn với thời lượng
    return availableTimes.map((time, index) => {
      // Tính toán thời lượng
      const duration = getTimeDuration(newEventStartTime, time);
      return {
        time,
        label: `${time} (${duration})`
      };
    });
  };
  
  // Tính khoảng thời gian giữa hai mốc thời gian
  const getTimeDuration = (startTime: string, endTime: string): string => {
    // Chuyển đổi thành đối tượng Date để tính toán
    const today = new Date();
    const start = parseTimeString12h(startTime);
    const end = parseTimeString12h(endTime);
    
    const startDate = new Date(today);
    startDate.setHours(start[0], start[1], 0, 0);
    
    const endDate = new Date(today);
    endDate.setHours(end[0], end[1], 0, 0);
    
    // Nếu thời gian kết thúc là ngày hôm sau
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    // Tính hiệu thời gian tính bằng phút
    const diffMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (60 * 1000));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} mins`;
    } else if (diffMinutes === 60) {
      return '1 hr';
    } else if (diffMinutes % 60 === 0) {
      return `${diffMinutes / 60} hrs`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      if (mins === 30 && hours === 1) {
        return '1.5 hrs';
      } else if (mins === 30) {
        return `${hours}.5 hrs`;
      } else {
        return `${hours} hr ${mins} mins`;
      }
    }
  };
  
  // Hàm phân tích chuỗi thời gian 12h thành [giờ, phút] ở định dạng 24h
  const parseTimeString12h = (timeStr: string): [number, number] => {
    const isPM = timeStr.toLowerCase().includes('pm');
    const timeParts = timeStr.toLowerCase().replace('am', '').replace('pm', '').split(':');
    
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    
    return [hours, minutes];
  };

  // Cập nhật end_time khi start_time thay đổi
  useEffect(() => {
    const endOptions = getEndTimeOptions();
    if (endOptions.length > 0) {
      // Mặc định chọn khoảng thời gian 1 giờ
      const oneHourOption = endOptions.find(option => option.label.includes('1 hr'));
      if (oneHourOption) {
        setNewEventEndTime(oneHourOption.time);
      } else {
        setNewEventEndTime(endOptions[0].time);
      }
    }
  }, [newEventStartTime]);

  // Hàm mở modal thêm mới event, chỉ được gọi từ nút "Add new"
  const handleAddEvent = () => {
    setSelectedEvent(undefined);
    setIsAddScheduleOpen(true);
    
    // Sử dụng ngày hiện tại làm mặc định
    setSelectedDate(new Date());
    
    // Reset endDate khi mở modal mới
    setEndDate(null);
    
    // Reset chế độ All day
    setIsAllDay(false);
    
    // Reset các trạng thái lặp lại
    setRepeatType('none');
    setShowRepeatOptions(false);
    setCustomRepeatFrequency(1);
    setCustomRepeatUnit('week');
    setCustomRepeatDays([]);
    setRepeatEndType('never');
    setRepeatEndDate(null);
    setRepeatOccurrences(10);
    
    // Sử dụng thời gian mặc định
    setNewEventStartTime('9:00am');
    setNewEventTitle('');
    
    // End time sẽ được tự động cập nhật thông qua useEffect
    
    // Tạo đối tượng event tạm thời với các giá trị mặc định
      const tempEvent: Partial<TaskEvent> = {
        task_id: taskId,
        title: '',
      start_time: new Date(),
      end_time: new Date(),
        repeat_type: 'none'
      };
      
      setSelectedEvent(tempEvent as TaskEvent);
  };

  const handleEditEvent = (event: TaskEvent) => {
    // Đóng chi tiết sự kiện nếu đang mở
    setIsDetailOpen(false);
    
    // Mở modal chỉnh sửa
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (event: TaskEvent) => {
    // Đóng chi tiết sự kiện nếu đang mở
    setIsDetailOpen(false);
    
    // Mở modal xóa
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  // Hàm mới để hiển thị chi tiết sự kiện
  const handleViewEventDetail = (event: TaskEvent) => {
    setEventDetail(event);
    setIsDetailOpen(true);
  };

  const getViewTitle = () => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long',
      year: 'numeric',
    };
    
    if (viewType === 'Day') {
      options.day = 'numeric';
      return currentDate.toLocaleDateString('en-US', options);
    } else if (viewType === 'Week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'long' })} ${startOfWeek.getFullYear()}`;
      } else if (startOfWeek.getFullYear() === endOfWeek.getFullYear()) {
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'short' })} ${startOfWeek.getDate()} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short' })} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      } else {
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
    } else if (viewType === 'Month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewType === 'Year') {
      return currentDate.getFullYear().toString();
    }
    
    return '';
  };

  // Toggle chức năng All day
  const handleAllDayToggle = () => {
    setIsAllDay(!isAllDay);
  };

  // Hàm xử lý khi chọn end date
  const handleEndDateSelection = (date: Date) => {
    setEndDate(date);
    setShowEndDatePicker(false);
  };

  // Format ngày kết thúc để hiển thị
  const formatEndDate = () => {
    if (!endDate) return 'Select end date';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[endDate.getDay()]}, ${months[endDate.getMonth()]} ${endDate.getDate()}`;
  };
  
  // Cập nhật renderCalendarView và các hàm liên quan...

  const renderCalendarView = () => {
    if (viewType === 'Day') {
      return (
        <DayView
          currentDate={currentDate}
          currentTime={currentTime}
          taskEvents={taskEvents}
          handleAddEvent={handleAddEvent}
          handleEditEvent={handleViewEventDetail}
        />
      );
    } else if (viewType === 'Week') {
      return (
        <WeekView
          currentDate={currentDate}
          currentTime={currentTime}
          taskEvents={taskEvents}
          handleAddEvent={handleAddEvent}
          handleEditEvent={handleViewEventDetail}
        />
      );
    } else if (viewType === 'Month') {
      return (
        <MonthView
          currentDate={currentDate}
          taskEvents={taskEvents}
          handleAddEvent={handleAddEvent}
          handleEditEvent={handleViewEventDetail}
        />
      );
    } else {
      return <div>Year view not implemented yet</div>;
    }
  };

  // Hàm xử lý thay đổi loại lặp lại
  const handleRepeatTypeChange = (type: RepeatType) => {
    setRepeatType(type);
    setShowRepeatOptions(false);
    
    // Thiết lập ngày lặp lại dựa trên loại lặp lại
    if (type === 'weekly') {
      setCustomRepeatDays([selectedDate.getDay()]);
    } else if (type === 'weekday') {
      setCustomRepeatDays([1, 2, 3, 4, 5]); // Monday to Friday
    }
  };

  // Hàm xử lý thay đổi các ngày lặp lại trong tuần
  const handleRepeatDayToggle = (day: number) => {
    const updatedDays = [...customRepeatDays];
    const index = updatedDays.indexOf(day);
    
    if (index >= 0) {
      updatedDays.splice(index, 1);
    } else {
      updatedDays.push(day);
    }
    
    setCustomRepeatDays(updatedDays);
  };

  // Hàm định dạng hiển thị loại lặp lại
  const getRepeatTypeDisplay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfMonth = selectedDate.getDate();
    const dayOfWeek = selectedDate.getDay();
    const weekNumber = Math.ceil(dayOfMonth / 7);
    const isLastWeek = dayOfMonth > 24; // Ước lượng tuần cuối cùng của tháng
    
    switch (repeatType) {
      case 'none':
        return 'Does not repeat';
      case 'daily':
        return 'Daily';
      case 'weekly':
        if (customRepeatDays && customRepeatDays.length > 0) {
          const dayNames = customRepeatDays.map(day => days[day]);
          return `Weekly on ${dayNames.join(', ')}`;
        }
        return `Weekly on ${days[dayOfWeek]}`;
      case 'monthly':
        if (isLastWeek) {
          return `Monthly on the last ${days[dayOfWeek]}`;
        } else {
          return `Monthly on the ${getOrdinalNumber(weekNumber)} ${days[dayOfWeek]}`;
        }
      case 'yearly':
        return `Annually on ${formatDate(selectedDate, { month: 'long', day: 'numeric' })}`;
      case 'weekday':
        return 'Every weekday (Monday to Friday)';
      case 'custom':
        let text = '';
        if (customRepeatFrequency && customRepeatUnit) {
          text = `Every ${customRepeatFrequency} ${customRepeatUnit}${customRepeatFrequency > 1 ? 's' : ''}`;
          
          if (customRepeatUnit === 'week' && customRepeatDays && customRepeatDays.length > 0) {
            const dayNames = customRepeatDays.map(day => days[day]);
            text += ` on ${dayNames.join(', ')}`;
          }
          
          if (repeatEndType === 'on' && repeatEndDate) {
            text += ` until ${repeatEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
          } else if (repeatEndType === 'after' && repeatOccurrences) {
            text += ` for ${repeatOccurrences} occurrences`;
          }
        }
        return text || 'Custom';
      default:
        return 'Does not repeat';
    }
  };

  // Hàm lấy số thứ tự (1st, 2nd, 3rd, 4th)
  const getOrdinalNumber = (n: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  // Hàm định dạng ngày tháng
  const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) => {
    return date.toLocaleDateString('en-US', options);
  };

  // Hàm xử lý khi lưu tùy chỉnh lặp lại
  const handleSaveCustomRepeat = () => {
    setRepeatType('custom');
    setShowCustomRepeatModal(false);
  };

  // Hàm xử lý khi tăng/giảm giá trị số
  const handleNumberChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: number, min: number, max: number) => {
    const newValue = Math.max(min, Math.min(max, value));
    setter(newValue);
  };

  // Cập nhật hàm createTaskEvent để thêm thông tin lặp lại
  const handleCreateNewEvent = async () => {
    // Logic to create a new event would go here
    if (!newEventTitle.trim()) return;
    
    try {
      console.log('Creating new task event with all day:', isAllDay);
      console.log('Task ID:', taskId);
      console.log('Repeat type:', repeatType);
      console.log('Custom repeat days:', customRepeatDays);
      
      // Reset form và đóng modal trước khi gọi API để UX mượt mà hơn
      const savedTitle = newEventTitle.trim();
      setNewEventTitle('');
      setIsAddScheduleOpen(false);
      
      if (isAllDay && endDate) {
        // Tạo danh sách các ngày từ selectedDate đến endDate
        const dates: Date[] = [];
        let currentDay = new Date(selectedDate);
        const lastDay = new Date(endDate);
        
        // Đặt giờ về 0 để so sánh chỉ theo ngày
        currentDay.setHours(0, 0, 0, 0);
        lastDay.setHours(0, 0, 0, 0);
        
        // Tạo array các ngày
        while (currentDay <= lastDay) {
          dates.push(new Date(currentDay));
          currentDay.setDate(currentDay.getDate() + 1);
        }
        
        // Tạo event cho mỗi ngày
        for (const date of dates) {
          // Parse time strings like "9:30am" to hours and minutes
          const [startHours, startMinutes] = parseTimeString(newEventStartTime);
          const [endHours, endMinutes] = parseTimeString(newEventEndTime);
          
          const startTime = new Date(date);
          startTime.setHours(startHours, startMinutes);
          
          const endTime = new Date(date);
          endTime.setHours(endHours, endMinutes);
          
          const newEventData = {
            task_id: taskId,
            title: savedTitle,
            start_time: startTime,
            end_time: endTime,
            all_day: isAllDay,
            repeat_type: repeatType,
            repeat_interval: repeatType === 'custom' ? customRepeatFrequency : 1,
            repeat_days: customRepeatDays.length > 0 ? customRepeatDays : undefined,
            repeat_end_type: repeatEndType,
            repeat_end_date: repeatEndType === 'on' && repeatEndDate ? repeatEndDate : undefined,
            repeat_occurrences: repeatEndType === 'after' ? repeatOccurrences : undefined
          };
          
          console.log('Creating all-day task event for date:', date.toDateString(), newEventData);
          
          // Gọi API để lưu event vào database
          try {
            const response = await taskEventService.createTaskEvent(newEventData);
            console.log('API response for date', date.toDateString(), ':', response);
            
            if (response && response.data && response.data.data) {
              // Nếu API trả về thành công
              const createdEvent = response.data.data;
              console.log('Event created successfully for date', date.toDateString(), ':', createdEvent);
              
              // Thêm event vào state local tạm thời để UI cập nhật ngay lập tức
              if (addEvent) {
                // Chuyển đổi chuỗi thời gian thành đối tượng Date
                const formattedEvent = {
                  ...createdEvent,
                  start_time: new Date(createdEvent.start_time),
                  end_time: createdEvent.end_time ? new Date(createdEvent.end_time) : undefined
                };
                
                addEvent(formattedEvent);
              }
            }
          } catch (err) {
            console.error('Error creating event for date', date.toDateString(), ':', err);
          }
        }
        
        // Refresh danh sách sau một khoảng thời gian ngắn để đảm bảo API đã cập nhật
        setTimeout(() => {
          console.log('Refreshing task events after create all-day events');
          refreshTaskEvents();
        }, 500);
      } else {
        // Xử lý tạo event đơn lẻ như trước
        // Parse time strings like "9:30am" to hours and minutes
        const [startHours, startMinutes] = parseTimeString(newEventStartTime);
        const [endHours, endMinutes] = parseTimeString(newEventEndTime);
        
        // Sử dụng selectedDate thay vì today
        const startTime = new Date(selectedDate);
        startTime.setHours(startHours, startMinutes);
        
        const endTime = new Date(selectedDate);
        endTime.setHours(endHours, endMinutes);
        
        const newEventData = {
          task_id: taskId,
          title: savedTitle,
          description: '',
          start_time: startTime,
          end_time: endTime,
          all_day: isAllDay,
          repeat_type: repeatType,
          repeat_interval: repeatType === 'custom' ? customRepeatFrequency : 1,
          repeat_days: customRepeatDays.length > 0 ? customRepeatDays : undefined,
          repeat_end_type: repeatEndType,
          repeat_end_date: repeatEndType === 'on' && repeatEndDate ? repeatEndDate : undefined,
          repeat_occurrences: repeatEndType === 'after' ? repeatOccurrences : undefined
        };
        
        console.log('Creating single task event:', newEventData);
        
        // Gọi API để lưu event vào database
        try {
          const response = await taskEventService.createTaskEvent(newEventData);
          console.log('API response:', response);
          
          if (response && response.data && response.data.data) {
            // Nếu API trả về thành công
            const createdEvent = response.data.data;
            console.log('Event created successfully:', createdEvent);
            
            // Thêm event vào state local tạm thời để UI cập nhật ngay lập tức
            if (addEvent) {
              // Chuyển đổi chuỗi thời gian thành đối tượng Date
              const formattedEvent = {
                ...createdEvent,
                start_time: new Date(createdEvent.start_time),
                end_time: createdEvent.end_time ? new Date(createdEvent.end_time) : undefined
              };
              
              addEvent(formattedEvent);
            }
            
            // Refresh danh sách sau một khoảng thời gian ngắn để đảm bảo API đã cập nhật
            setTimeout(() => {
              console.log('Refreshing task events after create');
              refreshTaskEvents();
            }, 500);
          } else {
            console.error('Failed to create event, invalid response:', response);
          }
        } catch (err) {
          console.error('Error creating single event:', err);
        }
      }
    } catch (error) {
      console.error('Error creating task event:', error);
    }
  };
  
  // Helper function to parse time strings like "9:30am" to hours and minutes
  const parseTimeString = (timeStr: string): [number, number] => {
    const isPM = timeStr.toLowerCase().includes('pm');
    const timeParts = timeStr.toLowerCase().replace('am', '').replace('pm', '').split(':');
    
    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1] || '0', 10);
    
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    
    return [hours, minutes];
  };

  // Format the selected date for display
  const formatSelectedDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[selectedDate.getDay()]}, ${months[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
  };

  // Handle date selection from the mini calendar
  const handleDateSelection = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  // Hàm chuyển đổi định dạng giờ từ nhiều kiểu nhập vào sang định dạng 12h
  const formatTimeInput = (input: string): string => {
    // Loại bỏ khoảng trắng
    input = input.trim();
    
    // Kiểm tra nếu đã có am/pm
    if (input.toLowerCase().includes('am') || input.toLowerCase().includes('pm')) {
      return input;
    }
    
    // Xử lý định dạng 24h (ví dụ: 14:30, 14, 14.30)
    const timeRegex = /^(\d{1,2})(?::|\.)?(0[0-9]|[0-5][0-9])?$/;
    const match = input.match(timeRegex);
    
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2] ? match[2] : '00';
      
      // Nếu giờ > 24, không hợp lệ
      if (hours >= 24) return input;
      
      // Xác định am/pm và chuyển sang định dạng 12h
      const isPM = hours >= 12;
      hours = hours % 12 || 12; // Chuyển 0 thành 12
      
      return `${hours}:${minutes}${isPM ? 'pm' : 'am'}`;
    }
    
    // Trả về nguyên bản nếu không nhận dạng được
    return input;
  };
  
  // Xử lý nhập giờ bắt đầu
  const handleStartTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartTimeInput(value);
  };
  
  // Xử lý nhập giờ kết thúc
  const handleEndTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndTimeInput(value);
  };
  
  // Xử lý khi blur ra khỏi ô nhập
  const handleStartTimeBlur = () => {
    const formattedTime = formatTimeInput(startTimeInput);
    setStartTimeInput(formattedTime);
    
    // Cập nhật giờ bắt đầu thực tế nếu định dạng hợp lệ
    if (timeOptions.includes(formattedTime) || 
        timeOptions.some(t => t.toLowerCase() === formattedTime.toLowerCase())) {
      setNewEventStartTime(formattedTime);
    }
  };
  
  // Xử lý khi blur ra khỏi ô nhập
  const handleEndTimeBlur = () => {
    const formattedTime = formatTimeInput(endTimeInput);
    setEndTimeInput(formattedTime);
    
    // Cập nhật giờ kết thúc thực tế nếu định dạng hợp lệ
    if (timeOptions.includes(formattedTime) || 
        timeOptions.some(t => t.toLowerCase() === formattedTime.toLowerCase())) {
      setNewEventEndTime(formattedTime);
    }
  };
  
  // Xử lý khi nhấn Enter
  const handleTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, isStart: boolean) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isStart) {
        handleStartTimeBlur();
      } else {
        handleEndTimeBlur();
      }
    }
  };

  // Cập nhật input khi thời gian thay đổi từ dropdown
  useEffect(() => {
    setStartTimeInput(newEventStartTime);
  }, [newEventStartTime]);
  
  useEffect(() => {
    setEndTimeInput(newEventEndTime);
  }, [newEventEndTime]);

  // Thêm hàm helper để hiển thị thông tin lặp lại giống Google Calendar
  const getFormattedRepeatDisplay = () => {
    switch (repeatType) {
      case 'none':
        return 'Does not repeat';
      case 'daily':
        return 'Daily';
      case 'weekly':
        if (customRepeatDays && customRepeatDays.length > 0) {
          const dayNames = customRepeatDays.map(day => 
            ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
          );
          return `Weekly on ${dayNames.join(', ')}`;
        }
        return `Weekly on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate.getDay()]}`;
      case 'monthly':
        return `Monthly on the ${getOrdinalNumber(Math.ceil(selectedDate.getDate() / 7))} ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate.getDay()]}`;
      case 'yearly':
        return `Annually on ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
      case 'weekday':
        return 'Every weekday (Monday to Friday)';
      case 'custom':
        let text = '';
        if (customRepeatFrequency && customRepeatUnit) {
          text = `Every ${customRepeatFrequency} ${customRepeatUnit}${customRepeatFrequency > 1 ? 's' : ''}`;
          
          if (customRepeatUnit === 'week' && customRepeatDays && customRepeatDays.length > 0) {
            const dayNames = customRepeatDays.map(day => 
              ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
            );
            text += ` on ${dayNames.join(', ')}`;
          }
          
          if (repeatEndType === 'on' && repeatEndDate) {
            text += ` until ${repeatEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
          } else if (repeatEndType === 'after' && repeatOccurrences) {
            text += ` for ${repeatOccurrences} occurrences`;
          }
        }
        return text || 'Custom';
      default:
        return 'Does not repeat';
    }
  };

  return (
    <div className="flex h-full bg-gray-50 relative">
      {/* Task Overdue Notifier - invisible component that checks for overdue tasks */}
      {task && <TaskOverdueNotifier tasks={[task]} taskEvents={taskEvents} />}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <CalendarHeader
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          viewType={viewType}
          setViewType={setViewType}
          getViewTitle={getViewTitle}
          handlePrevious={handlePrevious}
          handleNext={handleNext}
          handleToday={handleToday}
          handleAddEvent={handleAddEvent}
        />
        
        {/* Calendar View */}
        <div className="flex-1 overflow-auto bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading events...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-500">
                <p>{error}</p>
                <button 
                  onClick={refreshTaskEvents}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            renderCalendarView()
          )}
        </div>
      </div>
      
      {/* Add Schedule Sidebar */}
      {isAddScheduleOpen && (
        <div className="fixed top-1/2 right-16 transform -translate-y-1/2 w-[360px] max-w-[90vw] bg-white rounded-xl shadow-2xl z-[2000]">
          <div className="p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-medium">Add Schedule</h3>
              <button 
                onClick={() => setIsAddScheduleOpen(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <input
              type="text"
              placeholder="New schedule title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="w-full border-0 border-b border-gray-200 py-2 mb-4 focus:outline-none focus:ring-0 focus:border-gray-300 placeholder-gray-400"
              autoFocus
            />
            
            <div className="mb-3">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="flex items-center w-full">
                  <div className="flex-1 relative">
                    <button 
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="px-2 py-1.5 bg-gray-100 w-full text-left text-sm rounded-md hover:bg-gray-200 transition-colors"
                    >
                      {formatSelectedDate()}
                    </button>
                    
                    {showDatePicker && (
                      <div className="absolute top-10 left-0 z-50">
                        <MiniCalendar
                          currentDate={selectedDate}
                          miniCalendarDate={selectedDate}
                          setMiniCalendarDate={setSelectedDate}
                          handleDateClick={handleDateSelection}
                          setShowMiniCalendarPopup={setShowDatePicker}
                          showMiniCalendarPopup={showDatePicker}
                        />
                      </div>
                    )}
                  </div>
                  
                  <span className="mx-2">–</span>
                  
                  <div className="flex-1 relative">
                    <button 
                      onClick={() => setShowEndDatePicker(!showEndDatePicker)}
                      className="px-2 py-1.5 bg-gray-100 w-full text-left text-sm rounded-md hover:bg-gray-200 transition-colors"
                    >
                      {endDate ? formatEndDate() : formatSelectedDate()}
                    </button>
                    
                    {showEndDatePicker && (
                      <div className="absolute top-10 left-0 z-50">
                        <MiniCalendar
                          currentDate={endDate || selectedDate}
                          miniCalendarDate={endDate || selectedDate}
                          setMiniCalendarDate={endDate ? setEndDate : setSelectedDate}
                          handleDateClick={handleEndDateSelection}
                          setShowMiniCalendarPopup={setShowEndDatePicker}
                          showMiniCalendarPopup={showEndDatePicker}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Time selection - only shown if All day is not checked */}
            {!isAllDay && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative">
                  <div 
                    className="border border-gray-200 rounded-md p-1.5 text-sm w-24 cursor-pointer bg-blue-500 text-white flex items-center justify-between"
                    onClick={() => setShowStartTimePicker(!showStartTimePicker)}
                  >
                    <input
                      type="text"
                      className="w-full bg-transparent border-none focus:outline-none text-white"
                      value={startTimeInput}
                      onChange={handleStartTimeInputChange}
                      onBlur={handleStartTimeBlur}
                      onKeyDown={(e) => handleTimeKeyDown(e, true)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {showStartTimePicker && (
                    <div className="absolute z-50 mt-1 w-36 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg">
                      {timeOptions.map((time) => (
                        <div 
                          key={`start-${time}`} 
                          className={`p-2 text-sm hover:bg-gray-100 cursor-pointer ${newEventStartTime === time ? 'bg-blue-100' : ''}`}
                          onClick={() => {
                            setNewEventStartTime(time);
                            setShowStartTimePicker(false);
                          }}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-gray-400">–</span>
                <div className="relative">
                  <div 
                    className="border border-gray-200 rounded-md p-1.5 text-sm w-24 cursor-pointer flex items-center justify-between"
                    onClick={() => setShowEndTimePicker(!showEndTimePicker)}
                  >
                    <input
                      type="text"
                      className="w-full bg-transparent border-none focus:outline-none"
                      value={endTimeInput}
                      onChange={handleEndTimeInputChange}
                      onBlur={handleEndTimeBlur}
                      onKeyDown={(e) => handleTimeKeyDown(e, false)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {showEndTimePicker && (
                    <div className="absolute z-50 mt-1 w-56 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg">
                      {getEndTimeOptions().slice(0, 20).map((option) => {
                        const isOneHour = option.label.includes('1 hr') && !option.label.includes('1.5') && !option.label.includes('11');
                        return (
                          <div 
                            key={`end-${option.time}`} 
                            className={`p-2.5 text-sm hover:bg-gray-100 cursor-pointer
                              ${newEventEndTime === option.time ? 'bg-blue-100' : ''}
                              ${isOneHour ? 'bg-blue-50' : ''}`}
                            onClick={() => {
                              setNewEventEndTime(option.time);
                              setShowEndTimePicker(false);
                            }}
                          >
                            {option.label}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Dropdown chọn lặp lại đã được thiết kế lại */}
            <div className="mb-4">
              <div className="relative">
                <button 
                  className="w-full text-left px-3 py-2 bg-gray-100 rounded-md text-sm flex justify-between items-center hover:bg-gray-200"
                  onClick={() => setShowRepeatOptions(!showRepeatOptions)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{getFormattedRepeatDisplay()}</span>
                    {repeatType !== 'none' && (
                      <span className="text-xs text-gray-500 mt-0.5">
                        {repeatEndType === 'never' ? 'Repeats forever' : 
                         repeatEndType === 'on' ? `Until ${repeatEndDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 
                         repeatEndType === 'after' ? `For ${repeatOccurrences} occurrences` : ''}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500 text-xs ml-2">
                    {repeatType === 'none' ? 'Không lặp lại' : ''}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showRepeatOptions && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div 
                      className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      onClick={() => handleRepeatTypeChange('none')}
                    >
                      <span>Does not repeat</span>
                      <span className="text-gray-500 text-xs">Không lặp lại</span>
                    </div>
                    <div 
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleRepeatTypeChange('daily')}
                    >
                      Daily
                    </div>
                    <div 
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleRepeatTypeChange('weekly')}
                    >
                      Weekly on {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate.getDay()]}
                    </div>
                    <div 
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleRepeatTypeChange('monthly')}
                    >
                      Monthly on the {getOrdinalNumber(Math.ceil(selectedDate.getDate() / 7))} {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate.getDay()]}
                    </div>
                    <div 
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleRepeatTypeChange('yearly')}
                    >
                      Annually on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </div>
                    <div 
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleRepeatTypeChange('weekday')}
                    >
                      Every weekday (Monday to Friday)
                    </div>
                    <div 
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => setShowCustomRepeatModal(true)}
                    >
                      Custom...
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Checkbox All day - di chuyển xuống dưới phần lặp lại */}
            <div className="flex items-center mb-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={handleAllDayToggle}
                  className="form-checkbox h-4 w-4 text-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">All day</span>
              </label>
            </div>
            
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <input
                type="text"
                placeholder="Add Guest"
                className="w-full border-0 py-1 focus:outline-none focus:ring-0 text-sm"
              />
            </div>
            
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <input
                type="text"
                placeholder="https://meet.google.com/abc"
                className="w-full border-0 py-1 focus:outline-none focus:ring-0 text-sm"
              />
            </div>
            
            <div className="flex items-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <input
                type="text"
                placeholder="Add description"
                className="w-full border-0 py-1 focus:outline-none focus:ring-0 text-sm"
              />
            </div>
            
            {/* Modal tùy chỉnh lặp lại */}
            {showCustomRepeatModal && (
              <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-6 w-[400px] max-w-[90vw]">
                  <h3 className="text-lg font-medium mb-4">Custom recurrence</h3>
                  
                  <div className="mb-4 flex items-center">
                    <span className="mr-2">Repeat every</span>
                    <div className="flex items-center border rounded w-16">
                      <input 
                        type="number" 
                        min="1" 
                        max="99"
                        value={customRepeatFrequency}
                        onChange={(e) => handleNumberChange(setCustomRepeatFrequency, parseInt(e.target.value), 1, 99)}
                        className="w-full px-2 py-1 focus:outline-none text-center"
                      />
                      <div className="flex flex-col border-l">
                        <button 
                          className="px-1 hover:bg-gray-100" 
                          onClick={() => handleNumberChange(setCustomRepeatFrequency, customRepeatFrequency + 1, 1, 99)}
                        >
                          ▲
                        </button>
                        <button 
                          className="px-1 hover:bg-gray-100 border-t" 
                          onClick={() => handleNumberChange(setCustomRepeatFrequency, customRepeatFrequency - 1, 1, 99)}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                    
                    <select 
                      value={customRepeatUnit}
                      onChange={(e) => setCustomRepeatUnit(e.target.value as any)}
                      className="ml-2 border rounded p-1"
                    >
                      <option value="day">day</option>
                      <option value="week">week</option>
                      <option value="month">month</option>
                      <option value="year">year</option>
                    </select>
                  </div>
                  
                  {customRepeatUnit === 'week' && (
                    <div className="mb-4">
                      <p className="mb-2">Repeat on</p>
                      <div className="flex space-x-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                          <button
                            key={index}
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              customRepeatDays.includes(index)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            onClick={() => handleRepeatDayToggle(index)}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <p className="mb-2">Ends</p>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={repeatEndType === 'never'}
                          onChange={() => setRepeatEndType('never')}
                          className="mr-2"
                        />
                        Never
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={repeatEndType === 'on'}
                          onChange={() => setRepeatEndType('on')}
                          className="mr-2"
                        />
                        On
                        <button 
                          className={`ml-2 px-3 py-1 rounded ${
                            repeatEndType === 'on' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 text-gray-400'
                          }`}
                          onClick={() => {
                            if (repeatEndType === 'on') {
                              // Show date picker
                            }
                          }}
                          disabled={repeatEndType !== 'on'}
                        >
                          {repeatEndDate 
                            ? repeatEndDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'Select date'}
                        </button>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={repeatEndType === 'after'}
                          onChange={() => setRepeatEndType('after')}
                          className="mr-2"
                        />
                        After
                        <div className={`ml-2 flex items-center border rounded w-16 ${repeatEndType !== 'after' ? 'opacity-50' : ''}`}>
                          <input 
                            type="number" 
                            min="1" 
                            max="999"
                            value={repeatOccurrences}
                            onChange={(e) => handleNumberChange(setRepeatOccurrences, parseInt(e.target.value), 1, 999)}
                            className="w-full px-2 py-1 focus:outline-none text-center"
                            disabled={repeatEndType !== 'after'}
                          />
                          <div className="flex flex-col border-l">
                            <button 
                              className="px-1 hover:bg-gray-100" 
                              onClick={() => handleNumberChange(setRepeatOccurrences, repeatOccurrences + 1, 1, 999)}
                              disabled={repeatEndType !== 'after'}
                            >
                              ▲
                            </button>
                            <button 
                              className="px-1 hover:bg-gray-100 border-t" 
                              onClick={() => handleNumberChange(setRepeatOccurrences, repeatOccurrences - 1, 1, 999)}
                              disabled={repeatEndType !== 'after'}
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                        <span className="ml-2">occurrences</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-6">
                    <button 
                      className="px-4 py-2 text-blue-500 hover:bg-gray-100 rounded"
                      onClick={() => setShowCustomRepeatModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={handleSaveCustomRepeat}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-400"></div>
                <div className="w-6 h-6 rounded-full bg-red-400"></div>
                <div className="w-6 h-6 rounded-full bg-yellow-400"></div>
                <div className="w-6 h-6 rounded-full bg-green-400"></div>
                <div className="w-6 h-6 rounded-full bg-purple-400"></div>
              </div>
              <button
                onClick={handleCreateNewEvent}
                className={`px-4 py-2 text-white rounded-md ${
                  isAllDay && !endDate 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
                disabled={isAllDay && !endDate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Event Modal */}
      {isModalOpen && (
      <CreateTaskEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskId={taskId}
        taskEvent={selectedEvent}
          onSuccess={() => {
            setIsModalOpen(false);
            refreshTaskEvents();
          }}
        />
      )}
      
      {/* Delete Event Modal */}
      {isDeleteModalOpen && eventToDelete && (
      <DeleteTaskEventModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        taskEvent={eventToDelete}
          onSuccess={() => {
            if (eventToDelete) {
              removeEvent(eventToDelete._id);
            }
            setIsDeleteModalOpen(false);
          }}
        removeEvent={removeEvent}
      />
      )}

      {/* Event Detail Modal */}
      {isDetailOpen && eventDetail && (
        <TaskEventDetail
          isOpen={isDetailOpen}
          event={eventDetail}
          onClose={() => setIsDetailOpen(false)}
          onEdit={() => handleEditEvent(eventDetail)}
          onDelete={() => handleDeleteEvent(eventDetail)}
        />
      )}
    </div>
  );
}; 