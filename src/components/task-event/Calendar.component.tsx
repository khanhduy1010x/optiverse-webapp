import React, { useState, useEffect, useMemo } from 'react';
import { TaskEvent, RepeatType } from '../../types/task-events/task-events.types';
import { CalendarHeader } from './CalendarHeader.component';
import { CalendarSidebar } from './CalendarSidebar.component';
import { DayView } from './DayView.component';
import { WeekView } from './WeekView.component';
import { MonthView } from './MonthView.component';
import { CreateTaskEventModalForm } from './CreateTaskEventModal.component';
import { UpdateTaskEventModalForm } from './UpdateTaskEventModalForm.component';
import { CircleButton } from '../common/Button.component';
import { TaskOverdueNotifier } from './TaskOverdueNotifier.component';
import { TaskEventDetail } from './TaskEventDetail.component';
import { TimePickerDropdown } from './TimePickerDropdown.component';
import { EndTimePickerDropdown } from './EndTimePickerDropdown.component';
import taskService from '../../services/task.service';
import { useTaskEventOperations } from '../../hooks/task-events/useTaskEventOperations.hook';
import { MiniCalendar } from './MiniCalendar.component';
import { taskEventService } from '../../services/task-event.service';
import { useCalendarEventLayout } from '../../hooks/task-events/useCalendarEventLayout.hook';
import { CreateTaskEventRequest } from '../../types/task-events/request/create-task-event.request';
import { isRecurringEvent, isRecurringInstance } from '../../utils/recurring-event.utils';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { formatDateOnly, formatTimeOnly } from '../../utils/date.utils';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { GROUP_CLASSNAMES } from '../../styles';
import DeleteConfirmation from '../../pages/Task/DeleteConfirmation.screen';
import * as XLSX from 'xlsx';
import { EventExcelImportModal } from './EventExcelImportModal.component';
type ViewType = 'Day' | 'Week' | 'Month' | 'Year';

interface CalendarProps {
  taskId: string;
  taskEvents: TaskEvent[];
  loading: boolean;
  error: string | null;
  addEvent: (event: TaskEvent) => void;
  removeEvent: (eventId: string, deleteOption?: 'all' | 'this') => void;
  updateEvent: (eventId: string, event: TaskEvent, updateOption?: 'all' | 'this') => void;
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
  const { t } = useAppTranslate('task');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('Week');
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TaskEvent | undefined>(undefined);
  const [task, setTask] = useState<any>(null);
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStartTime, setNewEventStartTime] = useState('00:00am');
  const [newEventEndTime, setNewEventEndTime] = useState('01:00am');
  const [startTimeInput, setStartTimeInput] = useState('00:00am');
  const [endTimeInput, setEndTimeInput] = useState('01:00am');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [eventDetail, setEventDetail] = useState<TaskEvent | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isRecurringDeleteOpen, setIsRecurringDeleteOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<TaskEvent | null>(null);
  const [showRepeatOptions, setShowRepeatOptions] = useState(false);
  
  // Thêm state cho chức năng All day
  const [isAllDay, setIsAllDay] = useState(false);
  const [eventEndDate, setEventEndDate] = useState<Date | null>(null);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
 
 // Event import modal state
 const [isEventImportOpen, setIsEventImportOpen] = useState(false);
 const openEventImport = () => setIsEventImportOpen(true);
 const closeEventImport = () => setIsEventImportOpen(false);
 
 // Download Event Template
 const eventTemplateHeaders = ['title','start_date','start_time','end_time','repeat','to_date','description'];
 const handleDownloadEventTemplate = () => {
  // Use raw snake_case keys for header row to ensure parser recognizes columns across locales
  const ws = XLSX.utils.aoa_to_sheet([
    eventTemplateHeaders
  ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('template_sheet_name'));
     XLSX.writeFile(wb, 'events_template.xlsx');
  };
  const [repeatType, setRepeatType] = useState<RepeatType>('none');
  const [customRepeatFrequency, setCustomRepeatFrequency] = useState(1);
  const [customRepeatUnit, setCustomRepeatUnit] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [customRepeatDays, setCustomRepeatDays] = useState<number[]>([]);
  const [repeatEndType, setRepeatEndType] = useState<'never' | 'on' | 'after'>('never');
  const [repeatEndDate, setRepeatEndDate] = useState<Date | null>(null);
  const [repeatOccurrences, setRepeatOccurrences] = useState(10);
  const [showCustomRepeatModal, setShowCustomRepeatModal] = useState(false);
  
  const [pendingUpdateData, setPendingUpdateData] = useState<TaskEvent | null>(null);
  
  // Tính toán khoảng thời gian hiển thị dựa trên loại view và ngày hiện tại
  const dateRange = useMemo(() => {
    try {
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      
      if (viewType === 'Day') {
        // Hiển thị một ngày
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      } else if (viewType === 'Week') {
        // Hiển thị một tuần, bắt đầu từ Chủ nhật
        const day = currentDate.getDay(); // 0 = Chủ nhật, 6 = Thứ 7
        startDate.setDate(currentDate.getDate() - day);
        startDate.setHours(0, 0, 0, 0);
        
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else if (viewType === 'Month') {
        // Hiển thị một tháng
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        
        endDate.setMonth(currentDate.getMonth() + 1);
        endDate.setDate(0); // Ngày cuối cùng của tháng hiện tại
        endDate.setHours(23, 59, 59, 999);
      } else if (viewType === 'Year') {
        // Hiển thị một năm
        const year = currentDate.getFullYear();
        startDate.setFullYear(year, 0, 1);
        startDate.setHours(0, 0, 0, 0);
        
        endDate.setFullYear(year, 11, 31);
        endDate.setHours(23, 59, 59, 999);
      }
      
      return { startDate, endDate };
    } catch (error) {
      console.error('Error in dateRange calculation:', error);
      // Trả về giá trị mặc định nếu có lỗi
      const today = new Date();
      const startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      return { startDate, endDate };
    }
  }, [currentDate, viewType]);
  
  // Sử dụng hook useCalendarEventLayout ở cấp cao nhất của component
  const layoutResult = useCalendarEventLayout({
    events: taskEvents || [],
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        viewType: viewType === 'Year' ? 'Month' : viewType // Sử dụng Month view cho Year view
      });
  
  // Sử dụng kết quả từ hook trong useMemo
  const eventsWithLayout = useMemo(() => {
    try {
      return layoutResult;
    } catch (error) {
      console.error('Error in eventsWithLayout calculation:', error);
      return [];
    }
  }, [layoutResult]);
  
  // Generate time options for dropdown
  const timeOptions = [
    '00:00am', '00:15am', '00:30am', '00:45am',
    '01:00am', '01:15am', '01:30am', '01:45am',
    '02:00am', '02:15am', '02:30am', '02:45am',
    '03:00am', '03:15am', '03:30am', '03:45am',
    '04:00am', '04:15am', '04:30am', '04:45am',
    '05:00am', '05:15am', '05:30am', '05:45am',
    '06:00am', '06:15am', '06:30am', '06:45am',
    '07:00am', '07:15am', '07:30am', '07:45am',
    '08:00am', '08:15am', '08:30am', '08:45am',
    '09:00am', '09:15am', '09:30am', '09:45am',
    '10:00am', '10:15am', '10:30am', '10:45am',
    '11:00am', '11:15am', '11:30am', '11:45am',
    '00:00pm', '00:15pm', '00:30pm', '00:45pm',
    '01:00pm', '01:15pm', '01:30pm', '01:45pm',
    '02:00pm', '02:15pm', '02:30pm', '02:45pm',
    '03:00pm', '03:15pm', '03:30pm', '03:45pm',
    '04:00pm', '04:15pm', '04:30pm', '04:45pm',
    '05:00pm', '05:15pm', '05:30pm', '05:45pm',
    '06:00pm', '06:15pm', '06:30pm', '06:45pm',
    '07:00pm', '07:15pm', '07:30pm', '07:45pm',
    '08:00pm', '08:15pm', '08:30pm', '08:45pm',
    '09:00pm', '09:15pm', '09:30pm', '09:45pm',
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
    try {
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
    } catch (error) {
      console.error('Error in handlePrevious:', error);
    }
  };

  const handleNext = () => {
    try {
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
    } catch (error) {
      console.error('Error in handleNext:', error);
    }
  };

  const handleToday = () => {
    try {
      const today = new Date();
      setCurrentDate(today);
      // Reset the selected date to today as well
      setSelectedDate(today);
      console.log('Calendar view set to today:', today);
    } catch (error) {
      console.error('Error in handleToday:', error);
    }
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
    
    // Special handling for 0:XX format (midnight and noon)
    if (hours === 0) {
      hours = isPM ? 12 : 0;
    } else if (isPM && hours < 12) {
      hours += 12;
    } else if (!isPM && hours === 12) {
      hours = 0;
    }
    
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
    setEventEndDate(null);
    
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
    setNewEventStartTime('09:00am');
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
      
      // setSelectedEvent(tempEvent as TaskEvent); // XÓA đoạn này
  };

  // Hàm mở modal thêm mới event khi nhấp vào một ô trong lịch
  const handleAddSchedule = (date?: Date, hour?: number) => {
    setSelectedEvent(undefined);
    setIsAddScheduleOpen(true);
    
    // Sử dụng ngày được chọn hoặc ngày hiện tại
    const selectedDateTime = date ? new Date(date) : new Date();
    
    // Nếu có giờ được chỉ định, cập nhật giờ cho ngày được chọn
    if (hour !== undefined) {
      selectedDateTime.setHours(hour, 0, 0, 0);
    }
    
    setSelectedDate(selectedDateTime);
    
    // Thiết lập ngày kết thúc mặc định là cùng ngày với ngày bắt đầu
    const defaultEndDate = new Date(selectedDateTime);
    setEventEndDate(defaultEndDate);
    
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
    
    // Định dạng thời gian bắt đầu dựa trên giờ được chọn
    const hours = selectedDateTime.getHours();
    const isPM = hours >= 12;
    const hour12 = hours % 12 || 12;
    const formattedHour = hour12.toString().padStart(2, '0');
    const formattedStartTime = `${formattedHour}:00${isPM ? 'pm' : 'am'}`;
    
    // Thiết lập thời gian kết thúc mặc định là 1 giờ sau thời gian bắt đầu
    const endHour = (hours + 1) % 24;
    const endIsPM = endHour >= 12;
    const endHour12 = endHour % 12 || 12;
    const formattedEndHour = endHour12.toString().padStart(2, '0');
    const formattedEndTime = `${formattedEndHour}:00${endIsPM ? 'pm' : 'am'}`;
    
    setNewEventStartTime(formattedStartTime);
    setNewEventEndTime(formattedEndTime);
    setNewEventTitle('');
    
    // Tạo đối tượng event tạm thời với các giá trị mặc định
    const tempEvent: Partial<TaskEvent> = {
      task_id: taskId,
      title: '',
      start_time: selectedDateTime,
      end_time: new Date(selectedDateTime.getTime() + 60 * 60 * 1000), // Mặc định kéo dài 1 giờ
      repeat_type: 'none'
    };
    
    setSelectedEvent(tempEvent as TaskEvent);
  };

  const handleEditEvent = (event: TaskEvent) => {
    // Close detail popup if it is open
    setIsDetailOpen(false);
    // Open edit modal directly; confirmation for recurring updates is handled inside UpdateTaskEventModalForm
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (event: TaskEvent) => {
    // Đóng chi tiết sự kiện nếu đang mở
    setIsDetailOpen(false);
    setEventToDelete(event);
    if (isRecurringEvent(event) || isRecurringInstance(event)) {
      setIsRecurringDeleteOpen(true);
    } else {
      setIsDeleteConfirmOpen(true);
    }
  };



  // Hàm mới để hiển thị chi tiết sự kiện
  const handleViewEventDetail = (event: TaskEvent) => {
    setEventDetail(event);
    setIsDetailOpen(true);
  };

  const getViewTitle = () => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        month: 'long',
        year: 'numeric'
      };
      
      if (viewType === 'Day') {
        options.day = 'numeric';
        return currentDate.toLocaleDateString('en-US', options);
      } else if (viewType === 'Week') {
        try {
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
        } catch (error) {
          console.error('Error generating week title:', error);
          return currentDate.toLocaleDateString('en-US', options);
        }
      } else if (viewType === 'Month') {
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      } else if (viewType === 'Year') {
        return currentDate.getFullYear().toString();
      }
      
      return '';
    } catch (error) {
      console.error('Error in getViewTitle:', error);
      return 'Calendar';
    }
  };

  // Toggle chức năng All day
  const handleAllDayToggle = () => {
    setIsAllDay(!isAllDay);
  };

  // Hàm xử lý khi chọn end date
  const handleEndDateSelection = (date: Date) => {
    setEventEndDate(date);
    setShowEndDatePicker(false);
  };

  // Format ngày kết thúc để hiển thị
  const formatEndDate = () => {
    if (!eventEndDate) return 'Select end date';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[eventEndDate.getDay()]}, ${months[eventEndDate.getMonth()]} ${eventEndDate.getDate()}`;
  };
  
  // Cập nhật renderCalendarView và các hàm liên quan...

  const renderCalendarView = () => {
    try {
      // Tạo một hàm rỗng để thay thế handleAddSchedule
      const emptyFunction = () => {};
      
      switch (viewType) {
        case 'Day':
          return (
            <DayView
              currentDate={currentDate}
              currentTime={currentTime}
              taskEvents={eventsWithLayout}
              handleAddEvent={emptyFunction} // Thay thế bằng hàm rỗng
              handleEditEvent={handleViewEventDetail}
            />
          );
        case 'Week':
          return (
            <WeekView
              currentDate={currentDate}
              currentTime={currentTime}
              taskEvents={eventsWithLayout}
              handleAddEvent={emptyFunction} // Thay thế bằng hàm rỗng
              handleEditEvent={handleViewEventDetail}
            />
          );
        case 'Month':
          return (
            <MonthView
              currentDate={currentDate}
              taskEvents={eventsWithLayout}
              handleAddEvent={emptyFunction} // Thay thế bằng hàm rỗng
              handleEditEvent={handleViewEventDetail}
            />
          );
        default:
          return (
            <WeekView
              currentDate={currentDate}
              currentTime={currentTime}
              taskEvents={eventsWithLayout}
              handleAddEvent={emptyFunction} // Thay thế bằng hàm rỗng
              handleEditEvent={handleViewEventDetail}
            />
          );
      }
    } catch (error) {
      console.error('Error rendering calendar view:', error);
      return <div className="text-center text-red-500 p-4">Error loading calendar view</div>;
    }
  };

  // Hàm xử lý thay đổi loại lặp lại
  const handleRepeatTypeChange = (type: RepeatType) => {
    setRepeatType(type);
    setShowRepeatOptions(false);
    
    // Reset repeat-related settings when changing type
    if (type === 'none') {
      setCustomRepeatDays([]);
      setRepeatEndType('never');
      setRepeatEndDate(null);
      setRepeatOccurrences(10);
      setCustomRepeatFrequency(1);
      setCustomRepeatUnit('week');
    } 
    // Set default values based on the selected repeat type
    else if (type === 'weekly') {
      // For weekly, set the current day of week
      setCustomRepeatDays([selectedDate.getDay()]);
      // Set default end type to never
      setRepeatEndType('never');
      setRepeatOccurrences(10);
    } 
    else if (type === 'daily' || type === 'monthly' || type === 'yearly') {
      // For other types, clear repeat days
      setCustomRepeatDays([]);
      // Set default end type to never
      setRepeatEndType('never');
      setRepeatOccurrences(10);
    }
    else if (type === 'custom') {
      // Nếu người dùng chọn Custom, mở modal tùy chỉnh
      setShowCustomRepeatModal(true);
      // Thiết lập giá trị mặc định cho custom repeat
      setCustomRepeatFrequency(1);
      setCustomRepeatUnit('week');
      setCustomRepeatDays([selectedDate.getDay()]);
      setRepeatEndType('never');
      setRepeatOccurrences(10);
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
        if (customRepeatDays && Array.isArray(customRepeatDays) && customRepeatDays.length > 0) {
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
      case 'custom':
        let text = '';
        if (customRepeatFrequency && customRepeatUnit) {
          text = `Every ${customRepeatFrequency} ${customRepeatUnit}${customRepeatFrequency > 1 ? 's' : ''}`;
          
          if (customRepeatUnit === 'week' && customRepeatDays && Array.isArray(customRepeatDays) && customRepeatDays.length > 0) {
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

  // Hàm xử lý khi lưu tự chỉnh lặp lại
  const handleSaveCustomRepeat = () => {
    // Thiết lập repeat_type là 'custom'
    setRepeatType('custom');
    
    // Đảm bảo có repeat_days nếu đang chọn tùy chỉnh theo tuần
    if (customRepeatUnit === 'week' && customRepeatDays && Array.isArray(customRepeatDays) && customRepeatDays.length === 0) {
      // Nếu chưa chọn ngày nào, mặc định chọn ngày hiện tại trong tuần
      setCustomRepeatDays([selectedDate.getDay()]);
    }
    
    // Đảm bảo có repeat_end_type
    if (!repeatEndType || repeatEndType === 'never') {
      setRepeatEndType('never');
    } else if (repeatEndType === 'on' && !repeatEndDate) {
      // Nếu chọn kết thúc vào một ngày cụ thể nhưng chưa chọn ngày
      // Thiết lập ngày kết thúc mặc định là 3 tháng sau ngày hiện tại
      const defaultEndDate = new Date(selectedDate);
      defaultEndDate.setMonth(defaultEndDate.getMonth() + 3);
      setRepeatEndDate(defaultEndDate);
    } else if (repeatEndType === 'after' && (!repeatOccurrences || repeatOccurrences < 1)) {
      // Nếu chọn kết thúc sau một số lần lặp lại nhưng chưa thiết lập số lần
      setRepeatOccurrences(10); // Mặc định 10 lần
    }
    
    // Log thông tin để debug
    console.log('Custom repeat settings:', {
      repeatType: 'custom',
      customRepeatFrequency,
      customRepeatUnit,
      customRepeatDays,
      repeatEndType,
      repeatEndDate,
      repeatOccurrences
    });
    
    // Đóng modal tùy chỉnh
    setShowCustomRepeatModal(false);
    // Đóng dropdown repeat options
    setShowRepeatOptions(false);
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
      
      // Xử lý tạo event - chỉ tạo 1 event gốc, virtual instances sẽ được tạo tự động
      // Parse time strings like "9:30am" to hours and minutes
      const [startHours, startMinutes] = parseTimeString(newEventStartTime);
      const [endHours, endMinutes] = parseTimeString(newEventEndTime);
      
      // Sử dụng selectedDate làm ngày bắt đầu
      const startTime = new Date(selectedDate);
      startTime.setHours(startHours, startMinutes);
      
      // Xử lý end time - luôn sử dụng cùng ngày với selectedDate cho single event
      // eventEndDate sẽ được sử dụng cho repeat_end_date thay vì end_time
      let endTime: Date;
      if (isAllDay) {
        // Nếu là all day, end time cũng là cùng ngày
        endTime = new Date(selectedDate);
        endTime.setHours(23, 59, 59, 999);
      } else {
        // Sử dụng cùng ngày với selectedDate cho end_time
        endTime = new Date(selectedDate);
        endTime.setHours(endHours, endMinutes);
      }
      
      // Chuẩn bị dữ liệu event gốc với đầy đủ thông tin recurring
      const newEventData: TaskEvent = {
        _id: '', // Sẽ được tạo bởi backend
        task_id: taskId,
        title: savedTitle,
        description: '',
        start_time: startTime,
        end_time: endTime,
        all_day: isAllDay,
        repeat_type: repeatType,
        repeat_interval: repeatType === 'custom' ? customRepeatFrequency : 1,
        repeat_days: (repeatType === 'weekly' || repeatType === 'custom') ? 
          (customRepeatDays.length > 0 ? customRepeatDays : [selectedDate.getDay()]) : 
          [],
        repeat_end_type: repeatEndType,
        repeat_end_date: repeatEndType === 'on' && (repeatEndDate || eventEndDate) ? (repeatEndDate || eventEndDate) || undefined : undefined,
        repeat_occurrences: repeatEndType === 'after' ? repeatOccurrences : undefined,
        location: '',
        guests: []
      };
      
      // Thêm thông tin chi tiết nếu là custom repeat
      if (repeatType === 'custom') {
        console.log('Creating custom recurring event with:');
        console.log('- Frequency:', customRepeatFrequency);
        console.log('- Unit:', customRepeatUnit);
        console.log('- Days:', customRepeatDays);
        console.log('- End type:', repeatEndType);
        console.log('- End date:', repeatEndDate);
        console.log('- Occurrences:', repeatOccurrences);
        
        // Đảm bảo có repeat_days nếu là custom với đơn vị tuần
        if (customRepeatUnit === 'week' && (!newEventData.repeat_days || newEventData.repeat_days.length === 0)) {
          newEventData.repeat_days = [selectedDate.getDay()];
        }
      }
      
      console.log('Creating single task event (original):', newEventData);
      
      // Sử dụng addEvent từ useTaskEventList để tạo event gốc
      // Virtual instances sẽ được tạo tự động bởi generateRecurringEvents
      try {
        await addEvent(newEventData);
        console.log('Event created successfully via addEvent');
      } catch (err: any) {
        console.error('Error creating event via addEvent:', err);
        toast.error(t('error_generic_with_message', { message: err?.message || t('error_server_generic') }));
      }

    } catch (error: any) {
      console.error('Error creating task event:', error);
      // Hiển thị thông báo lỗi cho người dùng
      toast.error(t('error_generic_with_message', { message: error?.message || t('error_server_generic') }));
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
      
      // Use 0 instead of 12 for midnight and noon
      hours = hours % 12;
      
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

  // Add these new functions to handle dropdown toggling:

  // Function to toggle date picker dropdown and close other dropdowns
  const toggleDatePicker = () => {
    setShowEndDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
    setShowRepeatOptions(false);
    setShowDatePicker(!showDatePicker);
  };

  // Function to toggle end date picker dropdown and close other dropdowns
  const toggleEndDatePicker = () => {
    setShowDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
    setShowRepeatOptions(false);
    setShowEndDatePicker(!showEndDatePicker);
  };

  // Function to toggle start time picker dropdown and close other dropdowns
  const toggleStartTimePicker = () => {
    setShowDatePicker(false);
    setShowEndDatePicker(false);
    setShowEndTimePicker(false);
    setShowRepeatOptions(false);
    setShowStartTimePicker(!showStartTimePicker);
  };

  // Function to toggle end time picker dropdown and close other dropdowns
  const toggleEndTimePicker = () => {
    setShowDatePicker(false);
    setShowEndDatePicker(false);
    setShowStartTimePicker(false);
    setShowRepeatOptions(false);
    setShowEndTimePicker(!showEndTimePicker);
  };

  // Function to toggle repeat options dropdown and close other dropdowns
  const toggleRepeatOptions = () => {
    setShowDatePicker(false);
    setShowEndDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
    setShowRepeatOptions(!showRepeatOptions);
  };

  // Thêm hàm wrapper để ép kiểu setEventEndDate về Dispatch<SetStateAction<Date>>
  const setEventEndDateAsDate: React.Dispatch<React.SetStateAction<Date>> = (value) => {
    // value can be Date or (prev: Date) => Date
    setEventEndDate((prev) => {
      if (typeof value === 'function') {
        // @ts-ignore
        return value(prev ?? new Date()) as Date; // fallback if prev is null
      }
      return value;
    });
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
         onOpenEventImport={openEventImport}
         onDownloadEventTemplate={handleDownloadEventTemplate}
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
      
      {/* Global FAB for Add Event */}
      <CircleButton
        name="add"
        aria-label={t('add_event')}
        title={t('add_event')}
        onClick={handleAddEvent}
      />
      
      {/* Add Schedule Sidebar */}
      {isAddScheduleOpen && (
        <CreateTaskEventModalForm
          isOpen={isAddScheduleOpen}
          onClose={() => setIsAddScheduleOpen(false)}
          taskId={taskId}
          onSuccess={() => {
            setIsAddScheduleOpen(false);
            refreshTaskEvents();
          }}
          addEvent={addEvent}
        />
      )}
      
      {/* Add Event Modal */}
      {isModalOpen && selectedEvent && (
        <UpdateTaskEventModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskId={taskId}
        taskEvent={selectedEvent}
        onSuccess={() => {
          setIsModalOpen(false);
          refreshTaskEvents();
        }}
        updateEvent={(eventId: string, event: TaskEvent, option: 'all' | 'this' = 'this') => {
          // Forward the option selected in UpdateTaskEventModalForm
          updateEvent(eventId, event, option);
        }}
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

      {/* Delete Confirmation for non-recurring event */}
      {isDeleteConfirmOpen && eventToDelete && !isRecurringEvent(eventToDelete) && !isRecurringInstance(eventToDelete) && (
        <DeleteConfirmation
          title={t('delete_task_title')}
          description={t('event_delete_confirm_with_datetime', {
            title: eventToDelete.title || t('no_title'),
            date: formatDateOnly(eventToDelete.start_time as any),
            time: formatTimeOnly(eventToDelete.start_time as any)
          })}
          onCancel={() => {
            setIsDeleteConfirmOpen(false);
            setEventToDelete(null);
          }}
          onConfirm={() => {
            if (eventToDelete?._id) {
              removeEvent(eventToDelete._id, 'this');
              refreshTaskEvents();
            }
            setIsDeleteConfirmOpen(false);
            setEventToDelete(null);
          }}
        />
      )}

      {/* Recurring Delete Confirmation with scope options */}
      {isRecurringDeleteOpen && eventToDelete && (
        <Modal
          isOpen={true}
          ariaHideApp={false}
          className={GROUP_CLASSNAMES.modalContainer}
          overlayClassName={GROUP_CLASSNAMES.modalOverlay}
        >
          <div className="p-6">
            <div className="flex flex-col items-center mb-5">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-red-600">
                  <path fillRule="evenodd" d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 6a1 1 0 112 0v6a1 1 0 11-2 0V8zm1 10a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">{t('event_delete_recurring_title')}</h3>
              <p className="text-sm text-gray-600 text-center mt-1">
                {t('event_delete_confirm_with_datetime', {
                  title: eventToDelete.title || t('no_title'),
                  date: formatDateOnly(eventToDelete.start_time as any),
                  time: formatTimeOnly(eventToDelete.start_time as any)
                })}
              </p>
            </div>

            <div className="flex flex-col gap-2 mb-5">
              <button
                type="button"
                onClick={() => {
                  if (eventToDelete?._id) {
                    removeEvent(eventToDelete._id, 'this');
                    refreshTaskEvents();
                  }
                  setIsRecurringDeleteOpen(false);
                  setEventToDelete(null);
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {t('event_delete_only_this')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (eventToDelete?._id) {
                    removeEvent(eventToDelete._id, 'all');
                    refreshTaskEvents();
                  }
                  setIsRecurringDeleteOpen(false);
                  setEventToDelete(null);
                }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t('event_delete_all_in_series')}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsRecurringDeleteOpen(false);
                  setEventToDelete(null);
                }}
                className={GROUP_CLASSNAMES.modalButtonCancel}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <EventExcelImportModal
        isOpen={isEventImportOpen}
        onClose={closeEventImport}
        taskId={taskId}
        onImported={() => refreshTaskEvents()}
      />
    </div>
  );
};