import React, { useState, useRef, useEffect } from 'react';
import { ViewTypeDropdown } from './ViewTypeDropdown.component';
import { MiniCalendar } from './MiniCalendar.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { ImportDropdown } from '../common/ImportDropdown.component';

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
  onOpenEventImport?: () => void;
  onDownloadEventTemplate?: () => void;
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
  onOpenEventImport,
  onDownloadEventTemplate,
}) => {
  const { t } = useAppTranslate('task');
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
    <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-8 py-4 bg-gradient-to-r from-slate-600 via-slate-700 to-indigo-600 shadow-lg gap-4 md:gap-0 w-full max-w-full ">
      <div className="flex items-center gap-3 relative w-full md:w-auto">
        {/* Today Button */}
        <button
          onClick={handleToday}
          className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-lg font-semibold text-white hover:bg-white/25 border border-white/20 transition-all duration-200 flex items-center shadow-sm text-sm md:text-base hover:shadow-md hover:scale-105"
          title="Go to today"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {t('today')}
        </button>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevious}
          className="p-2 rounded-lg hover:bg-white/20 text-white transition-all duration-200 hover:shadow-md"
          aria-label={t('previous')}
          title={t('previous')}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={handleNext}
          className="p-2 rounded-lg hover:bg-white/20 text-white transition-all duration-200 hover:shadow-md"
          aria-label={t('next')}
          title={t('next')}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>

        {/* Date Display with Mini Calendar */}
        <div 
          ref={dateTextRef}
          onClick={toggleMiniCalendar}
          className="text-2xl md:text-3xl font-bold text-white ml-2 md:ml-4 cursor-pointer hover:bg-white/20 transition-colors flex items-center px-4 py-2 rounded-lg select-none hover:shadow-md"
          aria-label={t('change_date')}
          title={t('change_date')}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {getViewTitle()}
          <svg className="w-5 h-5 md:w-6 md:h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showMiniCalendarPopup ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
          </svg>
        </div>

        {/* Mini Calendar Popup */}
        {showMiniCalendarPopup && (
          <div ref={miniCalendarRef} className="absolute top-16 left-0 z-50 shadow-2xl rounded-xl animate-fadeIn">
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

      {/* Right Side - View Type & Actions */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {/* View Type Selector - Button Group */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
          {['Day', 'Week', 'Month'].map((view) => (
            <button
              key={view}
              onClick={() => setViewType(view as ViewType)}
              className={`px-3 md:px-4 py-2 rounded-md font-semibold text-sm md:text-base transition-all duration-200 ${
                viewType === view
                  ? 'bg-white/30 text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/15'
              }`}
              title={`${t(view.toLowerCase())} view`}
            >
              {t(view.toLowerCase())}
            </button>
          ))}
        </div>

        {/* Import */}
        <div className="flex items-center gap-2">
          <ImportDropdown
            onDownloadTemplate={onDownloadEventTemplate}
            onOpenImport={onOpenEventImport}
            type="event"
            className=""
          />
        </div>
      </div>
    </div>
  );
};