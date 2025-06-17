import React from 'react';
import { GROUP_CLASSNAMES } from '../../styles';
import Modal from 'react-modal';
import { CreateTaskFormProps } from '../../types/task/props/component.props';

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    setShowPopup,
    selectedTags,
    allTags,
    handleTagSelect,
    showNewTagForm,
    setShowNewTagForm,
    handleSaveTask
}) => {
    return (
        <Modal isOpen={true}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
            overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
        >            <div className={GROUP_CLASSNAMES.taskModalContent}>
                {/* Task name */}
                <div className={GROUP_CLASSNAMES.taskDetailHeader}>
                    <input
                        className="w-full text-xl font-medium border-0 p-0 mb-2 focus:outline-none focus:ring-0 placeholder-gray-400"
                        type="text"
                        placeholder="Task name"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
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
                                                key={tag._id || `temp-${tag.name}-${Math.random().toString(36).substr(2, 9)}`}
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
                                                    aria-label="Remove tag"
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
                                        + Select tags
                                    </button>

                                    {showNewTagForm && (
                                        <div className="fixed top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-64 bg-white rounded-md shadow-xl z-50 max-h-96 overflow-y-auto border border-gray-200">
                                            <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                                <span className="font-medium">Select Tags</span>
                                                <button
                                                    onClick={() => setShowNewTagForm(false)}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {allTags.length === 0 ? (
                                                <div className="px-4 py-3 text-sm text-gray-500">No tags available. Please create tags in the tag management section.</div>
                                            ) : (
                                                <div className="py-2">
                                                    {allTags.map(tag => {
                                                        const isSelected = selectedTags.some(t =>
                                                            (t._id && tag._id && t._id === tag._id) ||
                                                            (t.name && tag.name && t.name === tag.name)
                                                        );
                                                        return (
                                                            <div
                                                                key={tag._id || `temp-${tag.name}-${Math.random().toString(36).substr(2, 9)}`}
                                                                className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${isSelected ? 'bg-gray-100' : ''}`}
                                                                onClick={() => handleTagSelect(tag)}
                                                            >
                                                                <div className={GROUP_CLASSNAMES.flexItemsCenter}>
                                                                    <span
                                                                        className="w-4 h-4 rounded-full mr-2"
                                                                        style={{ backgroundColor: tag.color }}
                                                                    ></span>
                                                                    <span>{tag.name}</span>
                                                                    {isSelected && (
                                                                        <svg className="w-4 h-4 ml-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
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
                            if (!title || !title.trim()) {
                                alert('Please enter a title first');
                                return;
                            }

                            handleSaveTask(title);
                        }}
                        disabled={!title.trim()}
                        className={GROUP_CLASSNAMES.buttonPrimary + " px-4 py-2 text-sm"}
                    >
                        Create Task
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CreateTaskForm; 