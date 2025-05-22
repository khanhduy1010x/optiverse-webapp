import React from 'react';

export default function ManageFlashCards() {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 pb-8">
      <h1 className="text-2xl font-bold mb-6">Manage flashcards</h1>
      
      {/* Deck Header */}
      <div className="border border-gray-300 rounded mb-4">
        <div className="flex border-b border-gray-300">
          <div className="w-24 h-24 bg-gray-200 flex items-center justify-center">
            <div className="w-16 h-16">
              {/* X shape */}
              <div className="relative w-full h-full">
                <div className="absolute w-full h-0.5 bg-gray-500 top-1/2 left-0 transform -translate-y-1/2 rotate-45"></div>
                <div className="absolute w-full h-0.5 bg-gray-500 top-1/2 left-0 transform -translate-y-1/2 -rotate-45"></div>
              </div>
            </div>
          </div>
          <div className="flex-1 p-4 flex items-center justify-center">
            <h2 className="font-bold text-xl">400 English Words</h2>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 p-3 bg-gray-50">
          <button className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300">New</button>
          <button className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300">Learning</button>
          <button className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300">Reviewing</button>
        </div>
      </div>
      
      {/* Cards section */}
      <div className="mt-6">
        <h3 className="text-lg mb-4">cards</h3>
        
        {/* Card 1 */}
        <div className="border border-gray-300 mb-4 p-4">
          <p className="text-gray-800">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut neque diam, malesuada nec leo eget, facilisis suscipit velit. Cras mattis, orci id laoreet fermentum, erat massa finibus orci, eget volutpat neque nibh sit amet ante.
          </p>
        </div>
        
        {/* Card 2 */}
        <div className="border border-gray-300 mb-4 p-4">
          <p className="text-gray-800">
            Aenean quis sodales velit. Etiam dolor nisi, dictum nec vulputate nec, semper nec lectus. Maecenas et neque id nisi eleifend gravida. Aenean quis elit sed sapien convallis tempus. In hac habitasse platea dictumst.
          </p>
        </div>
      </div>
      
      {/* Bottom border/shadow */}
      <div className="fixed bottom-0 left-0 right-0 h-2 bg-gray-300"></div>
    </div>
  );
}