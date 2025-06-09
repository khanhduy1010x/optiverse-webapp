import { FlashcardDeckCard } from '../../components/common/Card.component';
import { useNavigate } from 'react-router-dom';
import { Button, CircleButton } from '../../components/common/Button.component';
import Icon from '../../components/common/Icon/Icon.component';
import UpdateFlashcardDeck from './UpdateFlashcardDeck.screen';
import AddFlashcardDeck from './AddFlashcardDeck.screen';
import { useFlashcardDeckList } from '../../hooks/flashcard/useFlashcardDeckList.hook';
import { flashcardDeckMock } from '../../types/flashcard/response/flashcard.response';

export default function FlashcardDeckList() {
  const navigate = useNavigate();
  const {
    decks,
    loading,
    selectedId,
    popupType,
    popupItem,
    toggleOptions,
    openPopup,
    closePopup,
    handleDelete,
    closePopupAndRefresh,
  } = useFlashcardDeckList();

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Flashcard decks</h1>
        <button
          type="button"
          title="More options"
          className="text-gray-600 hover:text-black focus:outline-none"
        >
          <svg width="24" height="24" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading decks...</p>
      ) : decks.length === 0 ? (
        <p className="text-gray-500">No flashcard decks found.</p>
      ) : (
        <div className="space-y-4">
          {decks.map(item => (
            <div key={item._id} className="relative">
              <FlashcardDeckCard
                title={item.title}
                lastReview={item.lastReview}
                learningFlashcard={item.learningCount}
                newFlashcard={item.newCount}
                reviewingFlashcard={item.reviewingCount}
                onClick={() => navigate(`/flashcard-deck/${item._id}`)}
                onLongPress={() => toggleOptions(item._id)}
                onContextMenu={() => toggleOptions(item._id)}
              ></FlashcardDeckCard>
              {selectedId === item._id && (
                <div className="absolute right-4 top-4 z-10 bg-white border shadow-md rounded px-3 py-2 text-sm flex flex-col space-y-1">
                  <Button
                    leftComponent={<Icon name="brush" inverted></Icon>}
                    onClick={() => openPopup('edit', item)}
                    style={{ justifyContent: 'center' }}
                    rightStyle={{ display: 'none' }}
                    inverted
                  ></Button>
                  <Button
                    leftComponent={<Icon name="delete" inverted></Icon>}
                    onClick={() => {
                      openPopup('delete', item);
                    }}
                    style={{ justifyContent: 'center' }}
                    rightStyle={{ display: 'none' }}
                    inverted
                  ></Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <CircleButton
        name="add"
        onClick={() => {
          openPopup('add', flashcardDeckMock);
        }}
      ></CircleButton>

      {popupType && popupItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div
            className={`bg-white p-6 rounded shadow-md relative ${popupType === 'delete' ? 'w-80' : 'w-200'}`}
          >
            <button
              onClick={() => {
                closePopup();
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✖
            </button>

            {popupType === 'add' && (
              <>
                <h3 className="text-lg font-semibold mb-2">Create deck</h3>
                <AddFlashcardDeck
                  clear={closePopupAndRefresh}
                ></AddFlashcardDeck>
              </>
            )}

            {popupType === 'edit' && (
              <>
                <h3 className="text-lg font-semibold mb-2">Update deck</h3>
                <UpdateFlashcardDeck
                  item={popupItem}
                  clear={closePopupAndRefresh}
                ></UpdateFlashcardDeck>
              </>
            )}

            {popupType === 'delete' && (
              <>
                <h3 className="text-lg font-semibold mb-4 text-red-600">
                  Delete this deck ?
                </h3>
                <p className="text-sm mb-4">
                  Do you want to delete this deck ?
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => handleDelete(popupItem)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    title="Delete"
                  ></Button>
                  <Button
                    onClick={() => {
                      closePopup();
                    }}
                    className="bg-gray-200 px-3 py-1 rounded"
                    title="Cancel"
                  ></Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
