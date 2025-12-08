import { FlashcardDeckCard } from '../../components/common/Card.component';
import { useNavigate } from 'react-router-dom';
import { Button, CircleButton } from '../../components/common/Button.component';
import Icon from '../../components/common/Icon/Icon.component';
import UpdateFlashcardDeck from './UpdateFlashcardDeck.screen';
import AddFlashcardDeck from './AddFlashcardDeck.screen';
import { useFlashcardDeckList } from '../../hooks/flashcard/useFlashcardDeckList.hook';
import { flashcardDeckMock } from '../../types/flashcard/response/flashcard.response';
import { SearchInputField } from '../../components/common/Input.component';
import FlashcardSidebar from './FlashcardSidebar';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { useState } from 'react';
import ImportFlashcardModal from '../../components/Flashcard/ImportFlashcardModal.component';
import GenerateFlashcardFromPdfModal from '../../components/Flashcard/GenerateFlashcardFromPdfModal.component';

export default function FlashcardDeckList() {
  const navigate = useNavigate();
  const {
    t,
    onSubmit,
    control,
    handleSubmit,
    refresh,
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

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);



  return (
    <div className="flex h-full">
      <FlashcardSidebar currentSelected="flashcard-deck" />
      <div className="flex-1 transition-all duration-300 ease-in-out h-full w-full overflow-auto ">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('flashcard_decks')}
            </h1>
          </div>

          <div className="mb-8 flex flex-row gap-4">
            <form onSubmit={handleSubmit(onSubmit)} className="flex-9/12">
              <SearchInputField
                name="search"
                control={control}
                placeholder={t('enter_title_placeholder')}
              ></SearchInputField>
            </form>

            <Button
              title={t('refresh')}
              className="flex-1/12"
              inverted
              onClick={refresh}
            ></Button>
            
            <Button
              title={t('import_button')}
              leftIcon="download"
              className="flex-1/12"
              inverted
              onClick={() => setImportModalOpen(true)}
            ></Button>

            <Button
              title={t('pdf.title')}
              leftIcon="file"
              className="flex-4/12"
              inverted
              onClick={() => setPdfModalOpen(true)}
            ></Button>
          </div>

          {loading ? (
            <p className="text-gray-500">{t('loading_decks')}</p>
          ) : decks.length === 0 ? (
            <p className="text-gray-500">{t('no_flashcard_decks_found')}</p>
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
                        leftIcon='brush'
                        onClick={() => openPopup('edit', item)}
                        style={{ justifyContent: 'center' }}
                        displayRight={false}
                        inverted
                      ></Button>
                      <Button
                        leftIcon='delete'
                        onClick={() => {
                          openPopup('delete', item);
                        }}
                        style={{ justifyContent: 'center' }}
                        displayRight={false}
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
                    <h3 className="text-lg font-semibold mb-2">
                      {t('create_deck')}
                    </h3>
                    <AddFlashcardDeck
                      clear={closePopupAndRefresh}
                    ></AddFlashcardDeck>
                  </>
                )}

                {popupType === 'edit' && (
                  <>
                    <h3 className="text-lg font-semibold mb-2">
                      {t('update_deck')}
                    </h3>
                    <UpdateFlashcardDeck
                      item={popupItem}
                      clear={closePopupAndRefresh}
                    ></UpdateFlashcardDeck>
                  </>
                )}

                {popupType === 'delete' && (
                  <>
                    <h3 className="text-lg font-semibold mb-4 text-red-600">
                      {t('delete_this_deck')}
                    </h3>
                    <p className="text-sm mb-4">{t('confirm_delete_deck')}</p>
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => handleDelete(popupItem)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                        title={t('delete')}
                      ></Button>
                      <Button
                        onClick={() => {
                          closePopup();
                        }}
                        className="bg-gray-200 px-3 py-1 rounded"
                        title={t('cancel')}
                      ></Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <ImportFlashcardModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onSuccess={() => {
            setImportModalOpen(false);
            refresh();
          }}
        />

        <GenerateFlashcardFromPdfModal
          isOpen={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          onSuccess={() => {
            setPdfModalOpen(false);
            refresh();
          }}
        />
      </div>
    </div>
  );
}
