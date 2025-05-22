import React from 'react';

export default function AddFlashCard() {
  return (
    <div className="w-full min-h-screen p-4 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-lg p-6 border-2 border-blue-500">
        <h1 className="text-xl font-bold mb-3">Add flashcard</h1>
        
        <div className="mb-4">
          <div className="flex">
            <span className="font-medium w-24">Decks:</span>
            <span className="font-bold">400 English Words</span>
          </div>
        </div>
        
        {/* Front card */}
        <div className="mb-4">
          <div className="font-medium mb-2">Front</div>
          <div className="border border-gray-300 p-4">
            <p className="text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. In urna orci, 
              fermentum sit amet lorem dignissim, semper congue justo. Etiam 
              lacinia tellus vitae ex bibendum, non efficitur metus viverra. Vivamus ac 
              odio eu lorem lacinia tristique sed vel tortor. Sed risus purus, ornare ut 
              fermentum vitae, consectetur eu lorem.
            </p>
          </div>
        </div>
        
        {/* Back card */}
        <div className="mb-6">
          <div className="font-medium mb-2">Back</div>
          <div className="border border-gray-300 p-4">
            <p className="text-sm">
              Nulla porttitor pulvinar lacus scelerisque dapibus. Fusce iaculis 
              augue lacinia justo ullamcorper sagittis. Aenean ac purus feugiat, 
              varius metus pulvinar, molestie magna.
            </p>
          </div>
        </div>
        
        {/* Show Answer button */}
        <div className="flex justify-center">
          <button className="px-5 py-2 border border-gray-300 rounded-full hover:bg-gray-100">
            Show Answer
          </button>
        </div>
      </div>
    </div>
  );
}