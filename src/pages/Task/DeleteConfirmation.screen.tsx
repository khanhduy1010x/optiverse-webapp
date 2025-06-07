import React from 'react';
import { GROUP_CLASSNAMES } from '../../styles';
import { DeleteConfirmationProps } from '../../types/task/props/component.props';



const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
    title,
    description,
    onCancel,
    onConfirm
}) => {
    return (
        <div className={GROUP_CLASSNAMES.taskModalOverlay}>
            <div className={GROUP_CLASSNAMES.deleteConfirmModal}>
                <div className="flex items-center justify-center mb-4">
                    <div className={GROUP_CLASSNAMES.deleteConfirmIcon}>
                        <svg className={GROUP_CLASSNAMES.deleteConfirmIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                </div>
                <h3 className={GROUP_CLASSNAMES.deleteConfirmTitle}>{title}</h3>
                <p className={GROUP_CLASSNAMES.deleteConfirmDescription}>
                    {description}
                </p>
                <div className={GROUP_CLASSNAMES.deleteConfirmButtons}>
                    <button
                        onClick={onCancel}
                        className={GROUP_CLASSNAMES.deleteConfirmCancelButton}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={GROUP_CLASSNAMES.deleteConfirmDeleteButton}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmation; 