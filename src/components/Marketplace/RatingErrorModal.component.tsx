import React from 'react';

interface RatingErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  autoCloseMs?: number;
}

export const RatingErrorModal: React.FC<RatingErrorModalProps> = ({
  isOpen,
  message,
  onClose,
  autoCloseMs = 3000,
}) => {
  React.useEffect(() => {
    if (isOpen && autoCloseMs > 0) {
      const timer = setTimeout(onClose, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseMs, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-[3000]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[3001]">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-auto">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h2.586a1 1 0 00.707-.293l2.414-2.414a1 1 0 00-1.414-1.414L13.172 2H11a2 2 0 00-2 2v2m0 0H7a2 2 0 00-2 2v2m0 0v6a2 2 0 002 2h10a2 2 0 002-2v-6m0 0V9a2 2 0 00-2-2h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 001.414 1.414L10.828 10H13a2 2 0 012-2"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-center text-lg font-semibold text-gray-900 mb-3">
            Error
          </h3>

          {/* Message */}
          <p className="text-center text-sm text-gray-600 mb-6">
            {message}
          </p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};
