export default function AddFlashcard() {
  return (
    <div className="w-full h-full bg-white p-8 rounded-xl shadow-sm">
      <h1 className="text-3xl font-bold mb-6">Add Flashcard</h1>

      {/* Deck Info */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Deck</label>
        <div className="bg-gray-100 p-3 rounded-md text-gray-700">
          400 English Words
        </div>
      </div>

      {/* Front Side */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Front</label>
        <textarea
          className="w-full p-3 border rounded-md"
          placeholder="Enter the front side content..."
        />
      </div>

      {/* Back Side */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-1">Back</label>
        <textarea
          className="w-full p-3 border rounded-md"
          placeholder="Enter the back side content..."
        />
      </div>

      <button className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition">
        Add Flashcard
      </button>
    </div>
  );
}
