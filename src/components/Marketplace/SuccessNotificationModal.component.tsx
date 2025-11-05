import React from 'react';
import Modal from 'react-modal';

interface SuccessNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
    title?: string;
}

const SuccessNotificationModal: React.FC<SuccessNotificationModalProps> = ({
    isOpen,
    onClose,
    message = 'Your purchase was successful!',
    title = 'Purchase Successful',
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[3000] outline-none"
            overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[3000]"
        >
            <div className="p-8">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-center text-gray-600 mb-8">
                    {message}
                </p>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                >
                    Got it!
                </button>
            </div>
        </Modal>
    );
};

export default SuccessNotificationModal;
