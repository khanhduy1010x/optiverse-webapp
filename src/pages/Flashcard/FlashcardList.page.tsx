import {
  FlashcardDeckCard,
  Flashcard,
} from '../../components/common/Card.component';
import { Button, CircleButton } from '../../components/common/Button.component';
import Icon from '../../components/common/Icon/Icon.component';
import UpdateFlashcard from './UpdateFlashcard.screen';
import { useFlashcardList } from '../../hooks/flashcard/useFlashcardList.hook';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { useState } from 'react';
import ExportFlashcardModal from '../../components/Flashcard/ExportFlashcardModal.component';

export default function FlashcardList() {
  const { t } = useAppTranslate('flashcard');
  const {
    navigate,
    deck,
    popupType,
    popupItem,
    setPopupItem,
    setPopupType,
    handleDelete,
    closePopupAndRefresh,
  } = useFlashcardList();

  const [exportModalOpen, setExportModalOpen] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 pb-8 flex flex-col gap-4">
      <div className="w-full flex justify-between items-center mb-6">
        <Button
          title={''}
          leftIcon="back"
          textSize={15}
          onClick={() => navigate(-1)}
          style={{ borderColor: 'transparent' }}
        ></Button>
        <Button
          title={t('export_button')}
          leftIcon="download"
          textSize={15}
          inverted
          onClick={() => setExportModalOpen(true)}
        ></Button>
      </div>

      <div className="w-full flex flex-row gap-4 justify-between">
        <FlashcardDeckCard
          title={deck.title}
          lastReview={deck.lastReview}
          learningFlashcard={deck.learningCount}
          newFlashcard={deck.newCount}
          reviewingFlashcard={deck.reviewingCount}
          style={{
            width: '75%',
          }}
        />
        <div className="w-1/4 flex flex-col flex-wrap gap-4">
          <Button
            title={t('spaced_repetition')}
            textSize={14}
            inverted
            onClick={() =>
              navigate(`/flashcard-deck/${deck._id}/learn`, {
                state: { title: deck.title, mode: 'space-repetition' },
              })
            }
          ></Button>
          <Button
            title={t('unlimited_study')}
            textSize={14}
            inverted
            onClick={() =>
              navigate(`/flashcard-deck/${deck._id}/learn`, {
                state: { title: deck.title, mode: 'unlimited' },
              })
            }
          ></Button>
        </div>
      </div>

      <div className="flex-col flex gap-8">
        <h3 className="text-lg">{t('flashcards')}</h3>
        {deck.flashcards &&
          deck.flashcards.map((item, index) => (
            <div key={item._id} className="relative">
              <div
                className="absolute right-full top-0 bottom-0 mr-4 z-10 rounded px-3 py-2 text-sm flex flex-col space-y-1
                items-center justify-center 
              "
              >
                {index + 1}
              </div>
              <Flashcard front={item.front} back={item.back} />
              <div
                className="absolute left-full bottom-0 ml-2 z-10-md rounded px-3 text-sm flex flex-col items-center justify-center space-y-1
                h-full"
              >
                <Button
                  leftIcon='brush'
                  onClick={() => {
                    setPopupType('edit');
                    setPopupItem(item);
                  }}
                  style={{
                    justifyContent: 'center',
                    borderColor: 'transparent',
                  }}
                  displayRight={false}
                />
                <Button
                  leftIcon='delete'
                  onClick={() => {
                    setPopupType('delete');
                    setPopupItem(item);
                  }}
                  style={{
                    justifyContent: 'center',
                    borderColor: 'transparent',
                  }}
                  displayRight={false}
                />
              </div>
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
                <h3 className="text-lg font-semibold mb-2">
                  {t('update_flashcard')}
                </h3>
                <UpdateFlashcard
                  item={popupItem}
                  clear={closePopupAndRefresh}
                />
              </>
            )}

            {popupType === 'delete' && (
              <>
                <h3 className="text-lg font-semibold mb-4 text-red-600">
                  {t('delete_this_flashcard')}
                </h3>
                <p className="text-sm mb-4">{t('confirm_delete_flashcard')}</p>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      setPopupType(null);
                      setPopupItem(null);
                    }}
                    className="bg-gray-200 px-3 py-1 rounded"
                    title={t('cancel')}
                    style={{
                      borderColor: 'transparent',
                    }}
                  />
                  <Button
                    onClick={() => handleDelete(popupItem)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    title={t('delete')}
                    inverted
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <ExportFlashcardModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        deck={deck}
        flashcards={deck.flashcards || []}
      />
    </div>
  );
}
