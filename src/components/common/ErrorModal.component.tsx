import React, { useEffect } from 'react';
import Modal from 'react-modal';

interface ErrorModalProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
    autoCloseMs?: number;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
    isOpen,
    message,
    onClose,
    autoCloseMs = 3000,
}) => {
    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(() => {
            onClose();
        }, autoCloseMs);

        return () => clearTimeout(timer);
    }, [isOpen, onClose, autoCloseMs]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
            overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
        >
            <div className="p-6">
                {/* Header with Close Button */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        {/* Error Icon */}
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg
                                className="w-5 h-5 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Error</h2>
                    </div>
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl flex-shrink-0 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Message */}
                <p className="text-gray-600 mb-6 break-words">{message}</p>

                {/* Auto Close Indicator */}
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Auto closes in 3 seconds</p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ErrorModal;
