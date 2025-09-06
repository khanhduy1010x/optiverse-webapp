import React from 'react';
import { GROUP_CLASSNAMES } from '../../styles';
import { DeleteConfirmationProps } from '../../types/task/props/component.props';
import Modal from 'react-modal';
import { useAppTranslate } from '../../hooks/useAppTranslate';


const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
    title,
    description,
    onCancel,
    onConfirm
}) => {
    const { t } = useAppTranslate('task');
    return (
        <Modal isOpen={true}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
            overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
        >             <div className={GROUP_CLASSNAMES.deleteConfirmModal}>
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
                        {t('cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={GROUP_CLASSNAMES.deleteConfirmDeleteButton}
                    >
                        {t('delete')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteConfirmation; 