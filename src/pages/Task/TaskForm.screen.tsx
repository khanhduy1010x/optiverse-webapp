import React from 'react';
import { Task } from '../../types/task/response/task.response';
import { Tag } from '../../types/task/response/tag.response';
import { GROUP_CLASSNAMES } from '../../styles';
import { TaskFormProps } from '../../types/task/props/component.props';



const TaskForm: React.FC<TaskFormProps> = ({
    title,
    setTitle,
    description,
    setDescription,
    status,
    setStatus,
    priority,
    setPriority,
    selectedTask,
    setShowPopup,
    selectedTags,
    allTags,
    handleTagSelect,
    showNewTagForm,
    setShowNewTagForm,
    newTagName,
    setNewTagName,
    newTagColor,
    setNewTagColor,
    handleCreateNewTag,
    handleSaveTask
}) => {
    const resetTagForm = () => {
        setNewTagName('');
        setNewTagColor('#3B82F6');
        setTimeout(() => {
            setShowNewTagForm(false);
        }, 300);
    };

    return (
        <div className={GROUP_CLASSNAMES.taskModalOverlay}>
            <div className={GROUP_CLASSNAMES.taskModalContent}>
                {/* Task name */}
                <div className={GROUP_CLASSNAMES.taskDetailHeader}>
                    <input
                        className="w-full text-xl font-medium border-0 p-0 mb-2 focus:outline-none focus:ring-0 placeholder-gray-400"
                        type="text"
                        placeholder="Task name"
                        value={title}
                        onChange={(e) => {
                            console.log('Input onChange value:', e.target.value);
                            setTitle(e.target.value);
                        }}
                        onBlur={(e) => console.log('Input onBlur value:', e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Description */}
                <div className={GROUP_CLASSNAMES.taskDetailDescription}>
                    <textarea
                        className="w-full text-sm border-0 p-0 focus:outline-none focus:ring-0 placeholder-gray-400 resize-none"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className={GROUP_CLASSNAMES.taskDetailSection}>
                    {/* Task attributes */}
                    <div className="space-y-2">
                        {/* Status */}
                        <div className={GROUP_CLASSNAMES.flexItemsCenter + " py-2"}>
                            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <select
                                aria-label="Task status"
                                className="flex-grow border-0 bg-transparent focus:outline-none focus:ring-0 text-sm text-gray-700"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                            >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div className={GROUP_CLASSNAMES.flexItemsCenter + " py-2"}>
                            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                            </svg>
                            <select
                                aria-label="Task priority"
                                className="flex-grow border-0 bg-transparent focus:outline-none focus:ring-0 text-sm text-gray-700"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                            >
                                <option value="low">Low (P3)</option>
                                <option value="medium">Medium (P2)</option>
                                <option value="high">High (P1)</option>
                            </select>
                        </div>

                        {/* Tags */}
                        <div className={GROUP_CLASSNAMES.flexItemsCenter + " py-2"}>
                            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <div className="flex-grow">
                                <div className={GROUP_CLASSNAMES.tagContainer + " mb-2"}>
                                    {selectedTags.length === 0 ? (
                                        <span className="text-sm text-gray-400">No tags selected</span>
                                    ) : (
                                        selectedTags.map(tag => (
                                            <span
                                                key={tag._id}
                                                className={GROUP_CLASSNAMES.tagItem}
                                                style={{
                                                    backgroundColor: `${tag.color}15`,
                                                    color: tag.color
                                                }}
                                            >
                                                {tag.name}
                                                <button
                                                    type="button"
                                                    onClick={() => handleTagSelect(tag)}
                                                    className="ml-1 focus:outline-none"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </span>
                                        ))
                                    )}
                                </div>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewTagForm(!showNewTagForm)}
                                        className="text-xs text-blue-500 hover:text-blue-700 focus:outline-none"
                                    >
                                        + Add tags
                                    </button>

                                    {showNewTagForm && (
                                        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                                            {allTags.length === 0 ? (
                                                <div className="px-4 py-2 text-sm text-gray-500">No tags available</div>
                                            ) : (
                                                allTags.map(tag => {
                                                    const isSelected = selectedTags.some(t => t._id === tag._id);
                                                    return (
                                                        <div
                                                            key={tag._id}
                                                            className={`${GROUP_CLASSNAMES.dropdownItem} ${isSelected ? 'bg-gray-100' : ''}`}
                                                            onClick={() => handleTagSelect(tag)}
                                                        >
                                                            <div className={GROUP_CLASSNAMES.flexItemsCenter}>
                                                                <span
                                                                    className="w-3 h-3 rounded-full mr-2"
                                                                    style={{ backgroundColor: tag.color }}
                                                                ></span>
                                                                <span>{tag.name}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                            <div className={GROUP_CLASSNAMES.divider}></div>
                                            <div className="px-4 py-2">
                                                <div className={GROUP_CLASSNAMES.flexItemsCenter}>
                                                    <input
                                                        type="text"
                                                        placeholder="New tag name"
                                                        value={newTagName}
                                                        onChange={(e) => setNewTagName(e.target.value)}
                                                        className="flex-grow text-xs border-0 p-0 focus:outline-none focus:ring-0"
                                                    />
                                                    <input
                                                        type="color"
                                                        value={newTagColor}
                                                        onChange={(e) => setNewTagColor(e.target.value)}
                                                        className="w-5 h-5 p-0 border-0 rounded-full cursor-pointer"
                                                    />
                                                    <button
                                                        id="create-tag-button"
                                                        type="button"
                                                        onClick={() => handleCreateNewTag(newTagName, newTagColor, resetTagForm)}
                                                        disabled={!newTagName.trim()}
                                                        className="ml-2 text-xs text-blue-500 hover:text-blue-700 disabled:text-gray-300"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className={GROUP_CLASSNAMES.taskModalFooter}>
                    <button
                        type="button"
                        onClick={() => setShowPopup(false)}
                        className={GROUP_CLASSNAMES.buttonSecondary + " px-4 py-2 text-sm"}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            console.log('Button Save clicked with title:', title);

                            if (!title || !title.trim()) {
                                alert('Please enter a title first');
                                return;
                            }

                            handleSaveTask(title);
                        }}
                        disabled={!title.trim()}
                        className={GROUP_CLASSNAMES.buttonPrimary + " px-4 py-2 text-sm"}
                    >
                        {selectedTask ? 'Update Task' : 'Create Task'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskForm; 