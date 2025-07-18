import React from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';

interface MiniCalendarProps {
  currentDate: Date;
  miniCalendarDate: Date;
  setMiniCalendarDate: React.Dispatch<React.SetStateAction<Date>>;
  handleDateClick: (date: Date) => void;
  setShowMiniCalendarPopup: React.Dispatch<React.SetStateAction<boolean>>;
  showMiniCalendarPopup: boolean;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  currentDate,
  miniCalendarDate,
  setMiniCalendarDate,
  handleDateClick,
  setShowMiniCalendarPopup,
  showMiniCalendarPopup
}) => {
  // Xử lý chuyển tháng
  const prevMonth = () => {
    setMiniCalendarDate(subMonths(miniCalendarDate, 1));
  };

  const nextMonth = () => {
    setMiniCalendarDate(addMonths(miniCalendarDate, 1));
  };

  // Tạo các ngày trong tháng
  const renderDays = () => {
    const monthStart = startOfMonth(miniCalendarDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'EEEEEE';
    const days = [];
    const weekDays = [];

    let formattedDate = startDate;
    
    // Tạo header với tên các ngày trong tuần
    for (let i = 0; i < 7; i++) {
      weekDays.push(
        <div className="w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-600" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    // Tạo các ô cho từng ngày
    let day = startDate;
    let formattedDays = [];
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const isToday = isSameDay(day, new Date());
        const isSelectedDate = isSameDay(day, currentDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        formattedDays.push(
          <div
            className={`w-8 h-8 flex items-center justify-center text-sm rounded-full cursor-pointer transition-all duration-200 mx-auto
              ${isCurrentMonth ? 'hover:bg-blue-100' : 'text-gray-400 hover:bg-gray-100'}
              ${isToday ? 'bg-blue-100 text-blue-800 font-medium' : ''}
              ${isSelectedDate ? 'bg-blue-600 text-white font-medium hover:bg-blue-700' : ''}
            `}
            key={day.toString()}
            onClick={() => handleDateClick(cloneDay)}
          >
            {format(day, 'd')}
          </div>
        );
        day = addDays(day, 1);
      }
    }

    // Tạo các hàng cho lịch
    let rows = [];
    let cells = [];

    // Thêm header
    rows.push(
      <div className="grid grid-cols-7 gap-1 mb-1" key="header">
        {weekDays}
      </div>
    );

    // Thêm các ngày
    formattedDays.forEach((day, i) => {
      if (i % 7 !== 0) {
        cells.push(day);
      } else {
        rows.push(
          <div className="grid grid-cols-7 gap-1 mb-1" key={i}>
            {cells}
          </div>
        );
        cells = [day];
      }
      if (i === formattedDays.length - 1) {
        rows.push(
          <div className="grid grid-cols-7 gap-1" key={i + 1}>
            {cells}
          </div>
        );
      }
    });

    return <div>{rows}</div>;
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-gray-800 font-bold">
          {format(miniCalendarDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {renderDays()}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setShowMiniCalendarPopup(false)}
          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}; 