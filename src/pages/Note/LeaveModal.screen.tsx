import React from 'react';
import Modal from 'react-modal';
import { LeaveModalProps } from '../../types/note/props/component.props';

const LeaveModal: React.FC<LeaveModalProps> = ({
    isOpen,
    onClose,
    itemToLeave,
    onConfirm,
    loading = false,
}) => {
    const [localLoading, setLocalLoading] = React.useState(false);

    const handleConfirm = async () => {
        setLocalLoading(true);
        try {
            await onConfirm();
        } finally {
            setLocalLoading(false);
        }
    };

    const isButtonLoading = loading || localLoading;
    const itemType = itemToLeave?.item.type === 'folder' ? 'folder' : 'note';
    const itemName = itemToLeave?.item.type === 'folder'
        ? itemToLeave.item.name
        : itemToLeave?.item.title;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[360px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
            overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
        >
            <div className="">
                <div className="text-center mb-6 px-6 pt-6">
                    <div className="flex justify-center mb-4">
                        <div className="bg-red-100 rounded-full p-4">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                                    stroke="#EF4444"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Leave {itemType}</h3>
                    <p className="text-gray-600">
                        Are you sure you want to leave this {itemType} "<span className="font-medium">
                            {itemName}
                        </span>"? You will lose access to {itemType === 'folder' ? 'it and all its contents' : 'it'}.
                    </p>
                </div>
                <div className="space-y-3 px-6 pb-6">
                    <button
                        onClick={handleConfirm}
                        disabled={isButtonLoading}
                        className="w-full px-4 py-3 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:bg-red-300"
                    >
                        {isButtonLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <span>Leave</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isButtonLoading}
                        className="w-full px-4 py-3 bg-gray-200 cursor-pointer hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </div>
            <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
        </Modal>
    );
};

export default LeaveModal; 