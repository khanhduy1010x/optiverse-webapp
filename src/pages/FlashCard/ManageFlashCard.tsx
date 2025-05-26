export default function FlashcardList() {
  return (
    <div className="w-full h-full bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Flashcard list</h1>
        <button className="text-gray-500 text-xl">⋮</button>
      </div>

      {/* Deck Info */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-sm text-gray-500">
          Deck
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold">400 English Words</div>
          <div className="text-sm text-gray-500">Last review 30 days ago</div>
          <div className="flex gap-2 mt-2">
            <span className="bg-red-700 text-white text-xs px-2 py-1 rounded-full">50 New</span>
            <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full">20 Learning</span>
            <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">10 Reviewing</span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {[1, 2].map((_, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
            <p className="text-gray-800 font-medium mb-1 truncate">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut neque diam, malesuada nec leo...
            </p>
            <p className="text-gray-700 text-sm truncate">
              Aenean quis sodales velit. Etiam dolor nisi, dictum nec vulputate nec, semper nec lectus...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
