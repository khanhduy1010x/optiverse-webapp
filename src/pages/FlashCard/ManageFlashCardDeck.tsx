import React from 'react';

export default function ManageFlashCardDeck() {
  return (
    <div className="flex flex-col w-full max-w-md mx-auto p-4">
      <h1 className="text-lg font-bold mb-4">Manage flashcard decks</h1>
      
      {/* First Deck */}
      <div className="mb-3 border border-gray-300 rounded">
        <div className="flex border-b border-gray-200">
          <div className="w-20 h-20 flex items-center justify-center bg-gray-100">
            <div className="w-12 h-12 border-2 border-gray-400 rotate-45 transform"></div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="font-medium">400 English Words</span>
          </div>
        </div>
        <div className="flex bg-gray-100 p-2 gap-2">
          <button className="bg-gray-200 px-3 py-1 text-sm rounded">New</button>
          <button className="bg-gray-200 px-3 py-1 text-sm rounded">Learning</button>
          <button className="bg-gray-200 px-3 py-1 text-sm rounded">Reviewing</button>
        </div>
      </div>
      
      {/* Second Deck */}
      <div className="mb-3 border border-gray-300 rounded">
        <div className="flex border-b border-gray-200">
          <div className="w-20 h-20 flex items-center justify-center bg-gray-100">
            <div className="w-12 h-12 border-2 border-gray-400 rotate-45 transform"></div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="font-medium">400 English Words</span>
          </div>
        </div>
        <div className="flex bg-gray-100 p-2 gap-2">
          <button className="bg-gray-200 px-3 py-1 text-sm rounded">New</button>
          <button className="bg-gray-200 px-3 py-1 text-sm rounded">Learning</button>
          <button className="bg-gray-200 px-3 py-1 text-sm rounded">Reviewing</button>
        </div>
      </div>
      
      {/* Third Deck */}
      <div className="mb-3 border border-gray-300 rounded">
        <div className="flex border-b border-gray-200">
          <div className="w-20 h-20 flex items-center justify-center bg-gray-100">
            <div className="w-12 h-12 border-2 border-gray-400 rotate-45 transform"></div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="font-medium">400 English Words</span>
          </div>
        </div>
        <div className="flex bg-gray-100 p-2 gap-2">
          <button className="bg-gray-200 px-3 py-1 text-sm rounded">New</button>
          <button className="bg-gray-200 px-3 py-1 text-sm rounded">Learning</button>
          <button className="bg-gray-200 px-3 py-1 text-sm rounded">Reviewing</button>
        </div>
      </div>
    </div>
  );
}