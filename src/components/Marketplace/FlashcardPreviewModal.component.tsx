import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

interface Flashcard {
  front: string;
  back: string;
  deck_id?: string;
  originalFlashcardId?: string;
}

interface FlashcardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards: Flashcard[];
  totalFlashcards: number;
  previewCount: number;
  itemTitle: string;
  loading?: boolean;
}

const FlashcardPreviewModal: React.FC<FlashcardPreviewModalProps> = ({
  isOpen,
  onClose,
  flashcards,
  totalFlashcards,
  previewCount,
  itemTitle,
  loading = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const currentFlashcard = flashcards[currentIndex];

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] max-w-[95vw] max-h-[80vh] overflow-hidden bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{itemTitle}</h2>
          <p className="text-xs text-gray-500 mt-1">
            Preview: {previewCount} of {totalFlashcards} flashcards 
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl flex-shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading flashcards...</p>
          </div>
        ) : flashcards.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No flashcards available for preview</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Flashcard Display */}
            <div
              className="perspective h-80 cursor-pointer transition-transform duration-300"
              onClick={() => setIsFlipped(!isFlipped)}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              <div
                className={`w-full h-full rounded-xl p-6 flex flex-col justify-center items-center text-center border-2 transition-all ${
                  isFlipped
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300'
                    : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300'
                }`}
                style={{
                  backfaceVisibility: 'hidden',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                <div className="mb-2 text-xs font-medium text-gray-600">
                  {isFlipped ? 'Back' : 'Front'}
                </div>
                <p className="text-lg font-medium text-gray-800 break-words max-h-56 overflow-auto">
                  {isFlipped ? currentFlashcard.back : currentFlashcard.front}
                </p>
                <div className="mt-4 text-xs text-gray-500">Click to flip</div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {currentIndex + 1} / {flashcards.length}
              </span>
              <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 justify-between">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === flashcards.length - 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 text-center">
              Showing ({previewCount}) of total {totalFlashcards} flashcards
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default FlashcardPreviewModal;
