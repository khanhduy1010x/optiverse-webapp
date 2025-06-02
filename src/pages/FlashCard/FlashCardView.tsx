import React from 'react';

export default function FlashcardView() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8 bg-gray-100">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">400 English Words</h1>

      {/* Status tags */}
      <div className="flex gap-4 mb-6">
        <span className="px-4 py-1 text-sm font-semibold text-white bg-red-700 rounded-full">50 New</span>
        <span className="px-4 py-1 text-sm font-semibold text-white bg-green-700 rounded-full">20 Learning</span>
        <span className="px-4 py-1 text-sm font-semibold text-black bg-yellow-600 rounded-full">10 Reviewing</span>
      </div>

      {/* Flashcard Front */}
      <div className="w-full max-w-lg mb-6">
        <div className="text-sm font-semibold text-gray-600 mb-1">Front</div>
        <div className="bg-white rounded-md border border-gray-300 p-4 shadow-sm">
          <p className="text-sm text-gray-800 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. In urna orci, fermentum sit amet lorem dignissim,
            semper congue justo.
          </p>
        </div>
      </div>

      {/* Flashcard Back */}
      <div className="w-full max-w-lg mb-6">
        <div className="text-sm font-semibold text-gray-600 mb-1">Back</div>
        <div className="bg-white rounded-md border border-gray-300 p-4 shadow-sm">
          <p className="text-sm text-gray-800 leading-relaxed">
            Nulla porttitor pulvinar lacus scelerisque dapibus. Fusce iaculis augue lacinia justo ullamcorper sagittis.
          </p>
        </div>
      </div>

      {/* Show Answer Button (tùy chọn nếu muốn toggle) */}
      <button className="w-full max-w-lg bg-black text-white py-3 rounded-md text-base font-semibold hover:bg-gray-800 transition">
        Show Answer
      </button>
    </div>
  );
}
