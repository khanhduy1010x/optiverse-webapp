import React from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  onGoToPage?: (page: number) => void;
}

/**
 * Component hiển thị pagination với design đẹp và hiện đại
 */
const PaginationComponent: React.FC<PaginationComponentProps> = ({
  currentPage,
  totalPages,
  canGoNext,
  canGoPrev,
  startIndex,
  endIndex,
  totalItems,
  onNextPage,
  onPrevPage,
  onGoToPage,
}) => {
  const { t } = useAppTranslate();

  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers to display (show current, +/-2 pages)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-between px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Left: Info */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600 dark:text-gray-300 font-medium">
          {t('showing', { defaultValue: 'Showing' })}
        </span>
        <span className="font-semibold text-gray-900 dark:text-white">
          {startIndex + 1}-{endIndex}
        </span>
        <span className="text-gray-600 dark:text-gray-300">
          {t('of', { defaultValue: 'of' })} <span className="font-semibold">{totalItems}</span>
        </span>
      </div>

      {/* Middle: Page Navigation */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={onPrevPage}
          disabled={!canGoPrev}
          className={`p-2 rounded-lg transition-all duration-200 ${
            canGoPrev
              ? 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-blue-500 cursor-pointer shadow-sm hover:shadow-md'
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
          }`}
          title={t('previous_page', { defaultValue: 'Previous page' })}
          aria-label="Previous page"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 px-3">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="text-gray-400 dark:text-gray-500 px-1"
                >
                  …
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onGoToPage?.(page as number)}
                className={`
                  min-w-[36px] h-9 rounded-lg font-medium text-sm
                  transition-all duration-200 flex items-center justify-center
                  ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-md hover:shadow-lg hover:bg-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-blue-500 cursor-pointer'
                  }
                `}
                title={`Go to page ${page}`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={onNextPage}
          disabled={!canGoNext}
          className={`p-2 rounded-lg transition-all duration-200 ${
            canGoNext
              ? 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-blue-500 cursor-pointer shadow-sm hover:shadow-md'
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
          }`}
          title={t('next_page', { defaultValue: 'Next page' })}
          aria-label="Next page"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Right: Summary */}
      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        {currentPage} / {totalPages}
      </div>
    </div>
  );
};

export default PaginationComponent;
