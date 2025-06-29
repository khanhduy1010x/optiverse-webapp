import React from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function ViewFocusTimeListModal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
      ></div>
      <div className="relative z-50 bg-white p-6 rounded-xl shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
