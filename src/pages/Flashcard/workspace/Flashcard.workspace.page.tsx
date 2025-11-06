import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FlashcardDeckCard } from '../../../components/common/Card.component';
import { Button, CircleButton } from '../../../components/common/Button.component';
import UpdateFlashcardDeck from '../UpdateFlashcardDeck.screen';
import AddFlashcardDeck from '../AddFlashcardDeck.screen';
import flashcardService from '../../../services/flashcard.service';
import { FlashcardDeckResponse, flashcardDeckMock } from '../../../types/flashcard/response/flashcard.response';
import { SearchInputField } from '../../../components/common/Input.component';
import { useAppTranslate } from '../../../hooks/useAppTranslate';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import FlashcardWorkspaceSidebar from './FlashcardWorkspaceSidebar';

const FlashcardWorkspacePage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { t } = useAppTranslate('flashcard');
  
  const { control, handleSubmit } = useForm();

  const [decks, setDecks] = useState<FlashcardDeckResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [popupType, setPopupType] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [popupItem, setPopupItem] = useState<FlashcardDeckResponse | null>(null);

  useEffect(() => {
    if (workspaceId) {
      fetchDecks();
    }
  }, [workspaceId]);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const data = await flashcardService.getFlashcardDeckListByWorkspace(workspaceId!);
      setDecks(data);
    } catch (error) {
      console.error('Error fetching decks:', error);
      toast.error('Failed to load flashcard decks');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (data.search && data.search.trim()) {
      const filtered = decks.filter((deck) =>
        deck.title.toLowerCase().includes(data.search.toLowerCase())
      );
      setDecks(filtered);
    } else {
      await fetchDecks();
    }
  };

  const refresh = async () => {
    await fetchDecks();
  };

  const toggleOptions = (id: string) => {
    setSelectedId(selectedId === id ? null : id);
  };

  const openPopup = (type: 'add' | 'edit' | 'delete', item: FlashcardDeckResponse) => {
    setPopupType(type);
    setPopupItem(item);
    setSelectedId(null);
  };

  const closePopup = () => {
    setPopupType(null);
    setPopupItem(null);
  };

  const closePopupAndRefresh = async () => {
    closePopup();
    await fetchDecks();
  };

  const handleDelete = async (item: FlashcardDeckResponse) => {
    try {
      await flashcardService.deleteFlashcardDeck(item._id);
      toast.success(t('delete_success'));
      closePopupAndRefresh();
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast.error(t('delete_error'));
    }
  };

  return (
    <div className="flex h-full">
      <FlashcardWorkspaceSidebar currentSelected="flashcard-deck" workspaceId={workspaceId!} />
      <div className="flex-1 transition-all duration-300 ease-in-out h-full w-full overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('workspace_flashcard_decks')}
            </h1>
          </div>

          <div className="mb-8 flex flex-row gap-4">
            <form onSubmit={handleSubmit(onSubmit)} className="flex-11/12">
              <SearchInputField
                name="search"
                control={control}
                placeholder={t('enter_title_placeholder')}
              />
            </form>

            <Button
              title={t('refresh')}
              className="flex-1/12"
              inverted
              onClick={refresh}
            />
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
                    onClick={() => navigate(`/workspace/${workspaceId}/flashcard-deck/${item._id}`)}
                    onLongPress={() => toggleOptions(item._id)}
                    onContextMenu={() => toggleOptions(item._id)}
                    showCreator={true}
                    creatorName={item.creator?.full_name || item.creator?.username || item.creator?.email}
                  />
                  {selectedId === item._id && (
                    <div className="absolute right-4 top-4 z-10 bg-white border shadow-md rounded px-3 py-2 text-sm flex flex-col space-y-1">
                      <Button
                        leftIcon='brush'
                        onClick={() => openPopup('edit', item)}
                        style={{ justifyContent: 'center' }}
                        displayRight={false}
                        inverted
                      />
                      <Button
                        leftIcon='delete'
                        onClick={() => {
                          openPopup('delete', item);
                        }}
                        style={{ justifyContent: 'center' }}
                        displayRight={false}
                        inverted
                      />
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
          />

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
                      workspaceId={workspaceId}
                    />
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
                    />
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
                      />
                      <Button
                        onClick={() => {
                          closePopup();
                        }}
                        className="bg-gray-200 px-3 py-1 rounded"
                        title={t('cancel')}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardWorkspacePage;

