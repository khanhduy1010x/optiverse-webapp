import React from 'react';

export default function FlashcardView() {
  return (
    <div className="w-full max-w-xl mx-auto p-4 border border-gray-100 rounded">
      {/* Title */}
      <h1 className="text-xl font-bold mb-4">400 English Words</h1>
      
      {/* Status buttons */}
      <div className="flex gap-2 mb-6">
        <button className="px-3 py-1 bg-gray-200 rounded text-sm">New</button>
        <button className="px-3 py-1 bg-gray-200 rounded text-sm">Learning</button>
        <button className="px-3 py-1 bg-gray-200 rounded text-sm">Reviewing</button>
      </div>
      
      {/* Front card */}
      <div className="mb-4">
        <div className="font-bold mb-1">Front</div>
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
      <div>
        <div className="font-bold mb-1">Back</div>
        <div className="border border-gray-300 p-4">
          <p className="text-sm">
            Nulla porttitor pulvinar lacus scelerisque dapibus. Fusce iaculis 
            augue lacinia justo ullamcorper sagittis. Aenean ac purus feugiat, 
            varius metus pulvinar, molestie magna.
          </p>
        </div>
      </div>
      
      {/* Bottom border */}
      <div className="border-t border-gray-300 mt-6"></div>
    </div>
  );
}