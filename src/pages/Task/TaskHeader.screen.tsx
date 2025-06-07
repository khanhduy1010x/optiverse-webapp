import React from 'react';
import { GROUP_CLASSNAMES } from '../../styles';
import { Tag } from '../../types/task/response/tag.response';
import { TaskHeaderProps } from '../../types/task/props/component.props';


const TaskHeader: React.FC<TaskHeaderProps> = ({
    searchQuery,
    setSearchQuery,
    setShowPopup,
    showFilterMenu,
    setShowFilterMenu,
    showSortMenu,
    setShowSortMenu,
    filterTags,
    allTags,
    sortOrder,
    handleFilterByTags,
    handleSortChange,
    handleSearchChange,
    setShowTagManagement
}) => {
    return (
        <>
            <div className={GROUP_CLASSNAMES.headerContainer}>
                <div className={GROUP_CLASSNAMES.contentContainer + " py-0"}>
                    <div className={GROUP_CLASSNAMES.flexJustifyBetween + " h-16"}>
                        <h1 className="text-xl font-semibold text-gray-900">My Tasks</h1>
                        <div className={GROUP_CLASSNAMES.flexItemsCenter + " space-x-4"}>
                            <button
                                onClick={() => setShowTagManagement(true)}
                                className="text-gray-500 hover:text-gray-700 p-2"
                                title="Manage Tags"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={GROUP_CLASSNAMES.contentContainer}>
                <div className={GROUP_CLASSNAMES.flexJustifyBetween + " flex-wrap gap-4"}>
                    <div className="w-full md:w-auto flex-1 max-w-md">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className={GROUP_CLASSNAMES.searchInput}
                            />
                        </div>
                    </div>

                    <div className={GROUP_CLASSNAMES.flexItemsCenter + " space-x-3"}>
                        <button
                            onClick={() => setShowPopup(true)}
                            className={GROUP_CLASSNAMES.buttonAddTask}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add task
                        </button>

                        <div className="relative group">
                            <button
                                id="filter-button"
                                className={GROUP_CLASSNAMES.buttonFilter}
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                            >
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                <span className="mr-1">Filter</span>
                                {filterTags.length > 0 && (
                                    <span className={GROUP_CLASSNAMES.badgeCount}>
                                        {filterTags.length}
                                    </span>
                                )}
                            </button>

                            {/* Filter Menu with explicit show/hide */}
                            {showFilterMenu && (
                                <div
                                    id="filter-menu"
                                    className={GROUP_CLASSNAMES.dropdownMenu + " w-64"}
                                    style={{
                                        animation: 'fadeIn 0.2s ease-in-out'
                                    }}
                                >
                                    <div
                                        className={`${GROUP_CLASSNAMES.dropdownItem} ${filterTags.length === 0 ? 'text-red-600 font-medium' : 'text-gray-700'}`}
                                        onClick={() => {
                                            handleFilterByTags([]);
                                        }}
                                    >
                                        All Tasks
                                    </div>
                                    <div className={GROUP_CLASSNAMES.divider}></div>
                                    {allTags.length === 0 ? (
                                        <div className="px-4 py-2 text-sm text-gray-500">No tags available</div>
                                    ) : (
                                        <div className="max-h-60 overflow-y-auto">
                                            {allTags.map(tag => {
                                                const isSelected = filterTags.some(t => t._id === tag._id);
                                                return (
                                                    <div
                                                        key={tag._id}
                                                        className={`${GROUP_CLASSNAMES.dropdownItem} flex items-center justify-between ${isSelected ? 'bg-red-50' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Cập nhật danh sách tag được chọn
                                                            const updatedTags = isSelected
                                                                ? filterTags.filter(t => t._id !== tag._id)
                                                                : [...filterTags, tag];

                                                            // Thêm hiệu ứng nhấp nháy khi chọn tag
                                                            const element = e.currentTarget;
                                                            element.classList.add('bg-red-100');
                                                            setTimeout(() => {
                                                                element.classList.remove('bg-red-100');
                                                            }, 200);

                                                            // Cập nhật state và filter tasks
                                                            handleFilterByTags(updatedTags);
                                                        }}
                                                    >
                                                        <div className={GROUP_CLASSNAMES.flexItemsCenter}>
                                                            <span
                                                                className="w-3 h-3 rounded-full mr-2"
                                                                style={{ backgroundColor: tag.color }}
                                                            ></span>
                                                            <span className={isSelected ? 'font-medium text-red-600' : 'text-gray-700'}>
                                                                {tag.name}
                                                            </span>
                                                        </div>
                                                        {isSelected && (
                                                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {filterTags.length > 0 && (
                                        <div className="border-t border-gray-100 mt-1 pt-1 px-4 py-2">
                                            <button
                                                className="text-xs text-red-600 hover:text-red-800"
                                                onClick={() => {
                                                    handleFilterByTags([]);
                                                }}
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="relative group">
                            <button
                                id="sort-button"
                                className={GROUP_CLASSNAMES.buttonFilter}
                                onClick={() => setShowSortMenu(!showSortMenu)}
                            >
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                                Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                            </button>

                            {/* Sort Menu with explicit show/hide */}
                            {showSortMenu && (
                                <div
                                    id="sort-menu"
                                    className={GROUP_CLASSNAMES.dropdownMenu + " w-48"}
                                    style={{
                                        animation: 'fadeIn 0.2s ease-in-out'
                                    }}
                                >
                                    <div
                                        className={`${GROUP_CLASSNAMES.dropdownItem} ${sortOrder === 'newest' ? 'text-red-600 font-medium' : 'text-gray-700'}`}
                                        onClick={() => {
                                            handleSortChange('newest');
                                        }}
                                    >
                                        Newest First
                                    </div>
                                    <div
                                        className={`${GROUP_CLASSNAMES.dropdownItem} ${sortOrder === 'oldest' ? 'text-red-600 font-medium' : 'text-gray-700'}`}
                                        onClick={() => {
                                            handleSortChange('oldest');
                                        }}
                                    >
                                        Oldest First
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TaskHeader; 