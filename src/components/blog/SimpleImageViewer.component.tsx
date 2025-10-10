import React from 'react';

interface SimpleImageViewerProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

const SimpleImageViewer: React.FC<SimpleImageViewerProps> = ({
  imageUrl,
  isOpen,
  onClose,
}) => {
  console.log('SimpleImageViewer render:', { imageUrl, isOpen });
  
  if (!isOpen || !imageUrl) {
    console.log('SimpleImageViewer not rendering - isOpen:', isOpen, 'imageUrl:', imageUrl);
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative max-w-full max-h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full w-10 h-10 flex items-center justify-center z-10 transition-all duration-200"
          aria-label="Đóng"
        >
          <svg
            className="w-6 h-6"
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
        </button>
        
        <img
          src={imageUrl}
          alt="Hình ảnh phóng to"
          className="max-w-full max-h-full object-contain shadow-2xl"
          style={{ 
            maxHeight: 'calc(100vh - 2rem)',
            borderRadius: '0',
            objectFit: 'contain'
          }}
        />
      </div>
    </div>
  );
};

export default SimpleImageViewer;