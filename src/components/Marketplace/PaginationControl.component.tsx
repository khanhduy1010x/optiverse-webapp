import React, { useState, useRef, useEffect } from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControl: React.FC<PaginationControlProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const { t } = useAppTranslate('marketplace');
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState(currentPage.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleGoToPage = () => {
    const pageNum = parseInt(inputValue);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setShowInput(false);
      setInputValue(pageNum.toString());
    } else {
      setInputValue(currentPage.toString());
      setShowInput(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ cho phép số
    const value = e.target.value.replace(/[^\d]/g, '');
    setInputValue(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setInputValue(currentPage.toString());
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (showInput) {
          setShowInput(false);
          setInputValue(currentPage.toString());
        }
      }
    };

    if (showInput) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showInput, currentPage]);

  // Auto-focus input when shown
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [showInput]);

  // Nếu ít hơn 5 trang, hiện trực tiếp các số trang
  if (totalPages < 5) {
    return (
      <div className="flex items-center justify-center gap-2" ref={containerRef}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`min-w-10 h-10 rounded-lg text-sm font-medium transition-all duration-300 ${
              pageNum === currentPage
                ? 'text-white shadow-md'
                : 'border border-gray-200 text-gray-700 hover:border-[#21B4CA] hover:bg-blue-50 hover:text-[#21B4CA] bg-white'
            }`}
            style={pageNum === currentPage ? { backgroundColor: '#21B4CA' } : {}}
          >
            {pageNum}
          </button>
        ))}
      </div>
    );
  }

  // Nếu >= 5 trang, dùng Previous/Next với dấu ...
  return (
    <div className="flex items-center justify-center gap-4" ref={containerRef}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 border border-gray-200 hover:border-[#21B4CA] hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white text-gray-700 hover:text-[#21B4CA] bg-white hover:shadow-sm"
      >
        ← {t('previous_page')}
      </button>

      {/* Page Display */}
      {!showInput ? (
        <div className="flex items-center gap-2 px-4 py-2 mx-2 rounded-lg hover:bg-gray-50 transition-colors">
          <span className="text-sm font-bold text-gray-900 min-w-6 text-center">{currentPage}</span>
          <button
            onClick={() => {
              setShowInput(true);
              setInputValue(currentPage.toString());
            }}
            className="text-gray-400 hover:text-blue-600 transition-colors px-1 cursor-pointer text-lg font-light"
            title="Click to go to specific page"
          >
            ...
          </button>
          <span className="text-sm font-medium text-gray-500 min-w-6 text-center">{totalPages}</span>
        </div>
      ) : (
        /* Input + Go Button */
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-300">
          <input
            ref={inputRef}
            type="number"
            min="1"
            max={totalPages}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={t('page_placeholder')}
            className="w-14 px-2 py-1 text-sm text-center rounded-md bg-white border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
          />
          <button
            onClick={handleGoToPage}
            className="px-4 py-1 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            {t('go_button')}
          </button>
        </div>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 border border-gray-200 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white text-gray-700 hover:text-blue-700 bg-white hover:shadow-sm"
      >
        {t('next_page')} →
      </button>

      <style>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default PaginationControl;
