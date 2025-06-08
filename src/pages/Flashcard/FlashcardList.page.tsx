import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlashcardDeckCard,
  Flashcard,
} from '../../components/common/Card.component';
import { Button, CircleButton } from '../../components/common/Button.component';
import Icon from '../../components/common/Icon/Icon.component';
import UpdateFlashcard from './UpdateFlashcard.screen';
import { useFlashcardList } from '../../hooks/flashcard/useFlashcardList.hook';

export default function FlashcardList() {
  const navigate = useNavigate();
  const {
    deck,
    selectedId,
    popupType,
    popupItem,
    toggleOptions,
    setPopupItem,
    setPopupType,
    handleDelete,
    closePopupAndRefresh,
  } = useFlashcardList();

  return (
    <div className="w-full max-w-2xl mx-auto p-4 pb-8 flex flex-col gap-4">
      <div className="w-full flex justify-between">
        <h1
          className="text-xl mb-6 text-blue-600 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          Back
        </h1>
        <h1
          className="text-xl mb-6 text-blue-600 cursor-pointer"
          onClick={() =>
            navigate(`/flashcard-deck/${deck._id}/learn`, {
              state: { title: deck.title },
            })
          }
        >
          Learn
        </h1>
      </div>

      <FlashcardDeckCard
        title={deck.title}
        lastReview={deck.lastReview}
        learningFlashcard={deck.learningCount}
        newFlashcard={deck.newCount}
        reviewingFlashcard={deck.reviewingCount}
      />

      <div className="flex-col flex gap-8">
        <h3 className="text-lg">Flashcards</h3>
        {deck.flashcards &&
          deck.flashcards.map(item => (
            <div key={item._id} className="relative">
              <Flashcard
                front={item.front}
                back={item.back}
                onClick={() => toggleOptions(item._id)}
              />
              {selectedId === item._id && (
                <div className="absolute right-4 top-4 z-10 bg-white border shadow-md rounded px-3 py-2 text-sm flex flex-col space-y-1">
                  <Button
                    leftComponent={<Icon name="brush" />}
                    onClick={() => {
                      setPopupType('edit');
                      setPopupItem(item);
                    }}
                  />
                  <Button
                    leftComponent={<Icon name="close" />}
                    onClick={() => {
                      setPopupType('delete');
                      setPopupItem(item);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-2 bg-gray-300"></div>

      <CircleButton
        name="add"
        onClick={() =>
          navigate(`/flashcard-deck/${deck._id}/add`, {
            state: { title: deck.title },
          })
        }
      />

      {popupType && popupItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div
            className={`bg-white p-6 rounded shadow-md relative ${popupType === 'edit' ? 'w-200' : 'w-80'}`}
          >
            <button
              onClick={() => {
                setPopupType(null);
                setPopupItem(null);
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✖
            </button>

            {popupType === 'edit' && (
              <>
                <h3 className="text-lg font-semibold mb-2">Update Flashcard</h3>
                <UpdateFlashcard
                  item={popupItem}
                  clear={closePopupAndRefresh}
                />
              </>
            )}

            {popupType === 'delete' && (
              <>
                <h3 className="text-lg font-semibold mb-4 text-red-600">
                  Delete this flashcard?
                </h3>
                <p className="text-sm mb-4">
                  Do you want to delete this flashcard?
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => handleDelete(popupItem)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    title="Delete"
                  />
                  <Button
                    onClick={() => {
                      setPopupType(null);
                      setPopupItem(null);
                    }}
                    className="bg-gray-200 px-3 py-1 rounded"
                    title="Cancel"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
