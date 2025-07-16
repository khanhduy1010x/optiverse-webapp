import React, { useState, useRef, useEffect } from 'react';
import { ViewTypeDropdown } from './ViewTypeDropdown.component';
import { MiniCalendar } from './MiniCalendar.component';

type ViewType = 'Day' | 'Week' | 'Month' | 'Year';

interface CalendarHeaderProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  viewType: ViewType;
  setViewType: (type: ViewType) => void;
  getViewTitle: () => string;
  handlePrevious: () => void;
  handleNext: () => void;
  handleToday: () => void;
  handleAddEvent: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  setCurrentDate,
  viewType,
  setViewType,
  getViewTitle,
  handlePrevious,
  handleNext,
  handleToday,
  handleAddEvent
}) => {
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date(currentDate));
  const [showMiniCalendarPopup, setShowMiniCalendarPopup] = useState(false);
  const [showViewTypeDropdown, setShowViewTypeDropdown] = useState(false);
  const miniCalendarRef = useRef<HTMLDivElement>(null);
  const dateTextRef = useRef<HTMLDivElement>(null);

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setShowMiniCalendarPopup(false);
  };

  // Handle clicks outside the mini calendar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        miniCalendarRef.current && 
        !miniCalendarRef.current.contains(event.target as Node) &&
        dateTextRef.current &&
        !dateTextRef.current.contains(event.target as Node)
      ) {
        setShowMiniCalendarPopup(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMiniCalendar = () => {
    setShowMiniCalendarPopup(!showMiniCalendarPopup);
    setMiniCalendarDate(new Date(currentDate)); // Reset mini calendar to current view date
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white rounded-t-2xl shadow-sm border-b">
      <div className="flex items-center gap-2 relative">
        <button
          onClick={handleToday}
          className="px-4 py-2 bg-blue-50 rounded-full font-semibold text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Today
        </button>
        <button
          onClick={handlePrevious}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={handleNext}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
        <div 
          ref={dateTextRef}
          onClick={toggleMiniCalendar}
          className="text-2xl font-bold text-gray-800 ml-4 cursor-pointer hover:text-blue-600 transition-colors flex items-center px-3 py-1 rounded-lg hover:bg-gray-100"
        >
          <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {getViewTitle()}
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showMiniCalendarPopup ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
          </svg>
        </div>
        
        {/* Mini Calendar Popup */}
        {showMiniCalendarPopup && (
          <div ref={miniCalendarRef} className="absolute top-14 left-0 z-50">
            <MiniCalendar
              currentDate={currentDate}
              miniCalendarDate={miniCalendarDate}
              setMiniCalendarDate={setMiniCalendarDate}
              handleDateClick={handleDateClick}
              setShowMiniCalendarPopup={setShowMiniCalendarPopup}
              showMiniCalendarPopup={showMiniCalendarPopup}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <select
          value={viewType}
          onChange={e => setViewType(e.target.value as any)}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold focus:outline-none"
        >
          <option value="Day">Day</option>
          <option value="Week">Week</option>
          <option value="Month">Month</option>
        </select>
        <button
          onClick={handleAddEvent}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 shadow"
        >
          + Add event
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35" /></svg>
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" /></svg>
        </button>
      </div>
    </div>
  );
}; 