import { useState, useEffect } from 'react';
import type { Task } from '../../types/task/response/task.response';

interface PaginationResult {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  paginatedItems: Task[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  itemsPerPage: number;
}

/**
 * Hook để quản lý phân trang
 * @param items - Danh sách items cần phân trang
 * @param itemsPerPage - Số items trên 1 trang (mặc định: 10)
 * @returns Pagination result object
 */
export const usePagination = (
  items: Task[],
  itemsPerPage: number = 10
): PaginationResult => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset về trang 1 khi items thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages || 1));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return {
    currentPage,
    totalPages: totalPages || 1,
    startIndex,
    endIndex: Math.min(endIndex, items.length),
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1,
    itemsPerPage,
  };
};
