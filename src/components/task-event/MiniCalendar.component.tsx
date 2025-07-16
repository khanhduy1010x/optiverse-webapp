import React, { useRef } from 'react';

interface MiniCalendarProps {
  currentDate: Date;
  miniCalendarDate: Date;
  setMiniCalendarDate: (date: Date) => void;
  handleDateClick: (date: Date) => void;
  setShowMiniCalendarPopup: (show: boolean) => void;
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
  const miniCalendarRef = useRef<HTMLDivElement>(null);

  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the first day of the week containing the first day of the month
    const start = new Date(firstDay);
    start.setDate(start.getDate() - start.getDay());
    
    // Get the last day of the week containing the last day of the month
    const end = new Date(lastDay);
    const daysToAdd = 6 - end.getDay();
    end.setDate(end.getDate() + daysToAdd);
    
    const days = [];
    let current = new Date(start);
    
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    const newDate = new Date(miniCalendarDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setMiniCalendarDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(miniCalendarDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setMiniCalendarDate(newDate);
  };

  const handlePrevYear = () => {
    const newDate = new Date(miniCalendarDate);
    newDate.setFullYear(newDate.getFullYear() - 1);
    setMiniCalendarDate(newDate);
  };

  const handleNextYear = () => {
    const newDate = new Date(miniCalendarDate);
    newDate.setFullYear(newDate.getFullYear() + 1);
    setMiniCalendarDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setMiniCalendarDate(today);
    handleDateClick(today);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isSameMonth = (date: Date) => {
    return date.getMonth() === miniCalendarDate.getMonth();
  };

  const isSelectedDate = (date: Date) => {
    return date.getDate() === currentDate.getDate() && 
           date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear();
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleString('default', { month: 'long' });
  };

  const formatYear = (date: Date) => {
    return date.getFullYear().toString();
  };

  const daysInMonth = getDaysInMonth(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth());

  return (
    <div 
      ref={miniCalendarRef}
      className="bg-white rounded-lg shadow-xl p-4 w-72 border border-gray-200"
    >
      {/* Year selector */}
      <div className="flex justify-between items-center mb-2">
        <button 
          onClick={handlePrevYear}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-sm font-bold">{formatYear(miniCalendarDate)}</div>
        <button 
          onClick={handleNextYear}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Month selector */}
      <div className="flex justify-between items-center mb-3">
        <button 
          onClick={handlePrevMonth}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-sm font-medium">{formatMonth(miniCalendarDate)}</div>
        <button 
          onClick={handleNextMonth}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="py-1">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, index) => (
          <button
            key={index}
            onClick={() => {
              handleDateClick(date);
            }}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs
              ${isToday(date) ? 'ring-2 ring-blue-500 font-bold' : ''}
              ${isSelectedDate(date) ? 'bg-blue-500 text-white hover:bg-blue-600' : 
                !isSameMonth(date) ? 'text-gray-400' : 'hover:bg-gray-100'}
              transition-colors
            `}
          >
            {date.getDate()}
          </button>
        ))}
      </div>

      {/* Today button */}
      <div className="mt-3 flex justify-center">
        <button
          onClick={handleToday}
          className="px-4 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 border border-gray-200 transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  );
}; 