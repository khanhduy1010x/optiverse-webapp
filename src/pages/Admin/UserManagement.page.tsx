import React, { useState, useEffect, useRef } from 'react';
import { useUserManagement } from '../../hooks/admin/useUserManagement.hook';
import { useUserModal } from '../../hooks/admin/useUserModal.hook';
import { UserRole, UserStatus } from '../../types/admin/user.types';
import UserDetailModal from './UserDetailModal.component';
import Icon from '../../components/common/Icon/Icon.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const TableRowSkeleton = () => {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-3 bg-gray-200 rounded w-6"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200"></div>
          <div className="ml-4">
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-5 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-5 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
    </tr>
  );
};

const UserManagement: React.FC = () => {
  const { t } = useAppTranslate('admin');

  // Selection component
  const Selection = ({
    value,
    options,
    onChange,
    label,
  }: {
    value: string;
    options: { value: string; label: string }[];
    onChange: (v: string) => void;
    label?: string;
  }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
      <div className="relative w-full z-30" ref={ref}>
        {label && (
          <span className="block text-xs text-[#21b4ca] mb-1 absolute left-3 top-1/20 -translate-y-1/2 bg-white px-1">
            {label}
          </span>
        )}
        <button
          type="button"
          className="w-full h-10 border-2 rounded-xl px-3 py-2 text-left bg-white flex items-center justify-between focus:outline-none transition-colors duration-200 border-gray-200 focus:border-[#21b4ca]"
          onClick={() => setOpen(v => !v)}
        >
          <span
            className={
              selected ? 'text-gray-900 text-sm' : 'text-gray-400 text-sm'
            }
          >
            {selected ? selected.label : t('select_placeholder')}
          </span>
          <svg
            className={`w-5 h-5 ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>
        {open && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto animate-fade-in">
            {options.map(opt => (
              <div
                key={opt.value}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#a6e0e2] ${opt.value === value ? 'bg-[#e7f6f7] text-[#21b4ca]' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const {
    users,
    loading,
    error,
    page,
    totalPages,
    totalUsers,
    changePage,
    limit,
    changeLimit,
    handleSearch,
    handleRoleFilterChange,
    handleStatusFilterChange,
    roleFilter,
    statusFilter,
    fetchPaginatedUsers,
  } = useUserManagement();

  const modal = useUserModal(() => {
    fetchPaginatedUsers(page, limit, searchInput, roleFilter, statusFilter);
  });

  const [searchInput, setSearchInput] = useState<string>('');
  const [searchFocused, setSearchFocused] = useState<boolean>(false);

  const getScrollContainer = () => window.__adminScrollEl as HTMLElement | null;

  const handleViewDetails = (user: any) => {
    modal.openModal(user);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchInput);
  };

  const getPaginationArray = () => {
    const paginationArray = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        paginationArray.push(i);
      }
    } else {
      paginationArray.push(1);
      if (page > 3) {
        paginationArray.push('...');
      }
      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);
      for (let i = startPage; i <= endPage; i++) {
        paginationArray.push(i);
      }
      if (page < totalPages - 2) {
        paginationArray.push('...');
      }
      if (totalPages > 1) {
        paginationArray.push(totalPages);
      }
    }
    return paginationArray;
  };

  const renderSkeletonRows = () => {
    const skeletonCount = limit || 5;
    const skeletons = [];
    for (let i = 0; i < skeletonCount; i++) {
      skeletons.push(<TableRowSkeleton key={`skeleton-${i}`} />);
    }
    return skeletons;
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 ">
        <div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}

          <div className="bg-white shadow-md    border border-gray-100">
            {/* Search and Filters */}
            <div className="p-5 border-b border-gray-100  to-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex items-center justify-center">
                {/* Search Form */}
                <div className="relative">
                  <label
                    htmlFor="search-input"
                    className={`absolute select-none outline-none pointer-events-none duration-300 left-3 text-[12px] z-10 block bg-white  bg-transparent px-1
                                    ${searchFocused || searchInput ? 'text-[#21b4ca] -top-2' : 'text-gray-500 top-[38%] text-[14px] bg-white px-0'} 
                                    ${searchFocused || searchInput ? '' : '-translate-y-1/4'}`}
                  >
                    {t('search_placeholder')}
                  </label>
                  <div className="relative w-full h-10 border-2 rounded-xl transition-colors duration-200 border-gray-200 focus-within:border-[#21b4ca]">
                    <form onSubmit={handleSearchSubmit} className="h-full flex">
                      <input
                        id="search-input"
                        type="text"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        className="w-full h-full px-3 py-2 text-gray-900 placeholder-transparent bg-transparent border-none focus:outline-none"
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            handleSearchSubmit(e);
                          }
                        }}
                      />
                      <button
                        type="submit"
                        className="px-4 text-[#21b4ca] hover:text-[#1c9eb1] transition-colors duration-200 focus:outline-none"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Role Filter */}
                <div className="relative">
                  <Selection
                    value={roleFilter}
                    options={[
                      { value: 'all', label: t('all_roles') },
                      { value: UserRole.ADMIN, label: t('admin') },
                      { value: UserRole.USER, label: t('user') },
                    ]}
                    onChange={v =>
                      handleRoleFilterChange(v as UserRole | 'all')
                    }
                    label={t('role')}
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Selection
                    value={statusFilter}
                    options={[
                      { value: 'all', label: t('all_status') },
                      { value: UserStatus.ACTIVE, label: t('active') },
                      { value: UserStatus.SUSPENDED, label: t('suspended') },
                    ]}
                    onChange={v =>
                      handleStatusFilterChange(v as UserStatus | 'all')
                    }
                    label={t('status')}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 flex justify-between items-center bg-white">
              <div>
                {loading ? (
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                ) : (
                  <span className="text-sm text-gray-600">
                    {t('total_users')}{' '}
                    <span className="font-medium text-[#21b4ca]">
                      {totalUsers}
                    </span>
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">
                  {t('items_per_page')}
                </span>
                <select
                  className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#21b4ca] focus:border-transparent"
                  value={limit}
                  onChange={e => changeLimit(Number(e.target.value))}
                  disabled={loading}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            <table
              className="min-w-full divide-y border-t border-gray-200  divide-gray-200"
              style={{ position: 'relative' }}
            >
              <thead className="bg-white  z-10 border-b border-gray-200 ">
                <tr className="border-b border-gray-200 ">
                  <th
                    style={{ position: 'sticky', top: -1, zIndex: 10 }}
                    className="px-6 border-b border-gray-200  py-3 text-left text-xs font-medium text-[#21b4ca] uppercase tracking-wider bg-white"
                  >
                    {t('number_symbol')}
                  </th>
                  <th
                    style={{ position: 'sticky', top: -1, zIndex: 10 }}
                    className="px-6 border-b border-gray-200 py-3 text-left text-xs font-medium text-[#21b4ca] uppercase tracking-wider bg-white"
                  >
                    {t('user_header')}
                  </th>
                  <th
                    style={{ position: 'sticky', top: -1, zIndex: 10 }}
                    className="px-6 border-b border-gray-200 py-3 text-left text-xs font-medium text-[#21b4ca] uppercase tracking-wider bg-white"
                  >
                    {t('email_header')}
                  </th>
                  <th
                    style={{ position: 'sticky', top: -1, zIndex: 10 }}
                    className="px-6 border-b border-gray-200 py-3 text-left text-xs font-medium text-[#21b4ca] uppercase tracking-wider bg-white"
                  >
                    {t('role_header')}
                  </th>
                  <th
                    style={{ position: 'sticky', top: -1, zIndex: 10 }}
                    className="px-6 border-b border-gray-200 py-3 text-left text-xs font-medium text-[#21b4ca] uppercase tracking-wider bg-white"
                  >
                    {t('status_header')}
                  </th>
                  <th
                    style={{ position: 'sticky', top: -1, zIndex: 10 }}
                    className="px-6 border-b border-gray-200 py-3 text-left text-xs font-medium text-[#21b4ca] uppercase tracking-wider bg-white"
                  >
                    {t('actions_header')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  renderSkeletonRows()
                ) : (
                  <>
                    {users.map((user, index) => (
                      <tr
                        key={user._id}
                        className="hover:bg-[#21b4ca]/5 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.avatar_url ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover ring-2 ring-[#21b4ca]/20"
                                  src={user.avatar_url}
                                  alt={user.full_name || t('user_avatar')}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-[#21b4ca]/10 flex items-center justify-center ring-2 ring-[#21b4ca]/20">
                                  <span className="text-lg font-medium text-[#21b4ca]">
                                    {(user.full_name || user.email)
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.full_name || t('not_updated')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span
                            className={`px-2 py-1 inline-flex text-xs  w-[80px] text-center leading-5 justify-center items-center  font-semibold rounded-full ${user.role === 'admin' ? 'bg-[#21b4ca]/20 text-[#21b4ca]' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {user.role === 'admin' ? t('admin') : t('user')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 inline-flex text-xs w-[80px] text-center leading-5 justify-center items-center font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {user.status === 'active'
                              ? t('active')
                              : t('suspended')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="px-3 py-1 text-white cursor-pointer transition-colors duration-150  flex items-center gap-1"
                          >
                            <Icon name="detail" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          {t('no_user_data')}
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>

            {/* Pagination with skeleton for loading state */}
            {(totalPages > 1 || loading) && (
              <div className="px-6 py-4 h-[70px] flex items-center justify-between border-t border-gray-200">
                <div>
                  {loading ? (
                    <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                  ) : (
                    <p className="text-sm text-gray-700">
                      {t('showing')}{' '}
                      <span className="font-medium text-[#21b4ca]">
                        {(page - 1) * limit + 1}
                      </span>{' '}
                      {t('to')}{' '}
                      <span className="font-medium text-[#21b4ca]">
                        {Math.min(page * limit, totalUsers)}
                      </span>{' '}
                      {t('of')}{' '}
                      <span className="font-medium text-[#21b4ca]">
                        {totalUsers}
                      </span>{' '}
                      {t('results')}
                    </p>
                  )}
                </div>
                <div>
                  {loading ? (
                    <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
                  ) : (
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => changePage(page - 1)}
                        disabled={page === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          page === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-[#21b4ca] hover:bg-[#21b4ca]/5 transition-colors duration-150'
                        }`}
                      >
                        <span className="sr-only">{t('previous')}</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {getPaginationArray().map((pageNum, index) =>
                        pageNum === '...' ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={`page-${pageNum}`}
                            onClick={() => changePage(Number(pageNum))}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-150 ${
                              page === pageNum
                                ? 'z-10 bg-[#21b4ca]/10 border-[#21b4ca] text-[#21b4ca]'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-[#21b4ca]/5'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => changePage(page + 1)}
                        disabled={page === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          page === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-[#21b4ca] hover:bg-[#21b4ca]/5 transition-colors duration-150'
                        }`}
                      >
                        <span className="sr-only">{t('next')}</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <UserDetailModal modal={modal} />
    </>
  );
};

export default UserManagement;
