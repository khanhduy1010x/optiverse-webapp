import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Flashcard, FlashcardDeckCard } from '../../components/common/Card';
import { Button, CircleButton } from '../../components/common/Button';
import { token } from '../../services/apitest';
import Icon from '../../components/common/Icon/Icon';
import UpdateFlashcard from './UpdateFlashcard.screen';
import {
  FlashcardDeck,
  Flashcard as FlashcardType,
} from '../../types/flashcard.types';

export default function FlashcardList() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [deck, setDeck] = useState<FlashcardDeck>({
    _id: '',
    title: 'Loading',
    lastReview: 0,
    learningCount: 0,
    newCount: 0,
    reviewingCount: 0,
    user_id: '',
  });
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [popupType, setPopupType] = useState<'edit' | 'delete' | null>(null);
  const [popupItem, setPopupItem] = useState<FlashcardType | null>(null);

  const toggleOptions = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const closePopupAndRefresh = async () => {
    await fetchData();
    setSelectedId(null);
    setPopupType(null);
    setPopupItem(null);
  };

  const fetchData = async () => {
    try {
      const response = await fetch(
        `http://localhost:81/productivity/flashcard-deck/${deckId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = (await response.json()).data;
      const deckData: FlashcardDeck = {
        _id: result._id,
        title: result.title,
        lastReview: result.lastReview,
        learningCount: result.learningCount,
        newCount: result.newCount,
        reviewingCount: result.reviewingCount,
        user_id: result.user_id,
      };
      setDeck(deckData);

      const flashcardsData: FlashcardType[] = result.flashcards;
      setFlashcards(flashcardsData);
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: FlashcardType) => {
    try {
      await fetch(`http://localhost:81/productivity/flashcard/${item._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      await closePopupAndRefresh();
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 pb-8 flex flex-col gap-4">
      <div className="w-full flex justify-between">
        <h1
          className="text-xl mb-6"
          style={{ cursor: 'pointer', color: 'blue' }}
          onClick={() => navigate(-1)}
        >
          Back{' '}
        </h1>
        <h1
          className="text-xl mb-6"
          style={{ cursor: 'pointer', color: 'blue' }}
          onClick={() =>
            navigate(`/flashcard-deck/${deck._id}/learn`, {
              state: {
                title: deck.title,
              },
            })
          }
        >
          Learn{' '}
        </h1>
      </div>

      {/* Deck Header */}
      <FlashcardDeckCard
        title={deck.title}
        lastReview={deck.lastReview}
        learningFlashcard={deck.learningCount}
        newFlashcard={deck.newCount}
        reviewingFlashcard={deck.reviewingCount}
      ></FlashcardDeckCard>

      {/* Cards section */}
      <div className="flex-col flex gap-8">
        <h3 className="text-lg">Flashcards</h3>

        {flashcards.map(item => (
          <div key={item._id} className="relative">
            <Flashcard
              front={item.front}
              back={item.back}
              onClick={() => toggleOptions(item._id)}
            ></Flashcard>
            {selectedId === item._id && (
              <div className="absolute right-4 top-4 z-10 bg-white border shadow-md rounded px-3 py-2 text-sm flex flex-col space-y-1">
                <Button
                  leftComponent={<Icon name="brush"></Icon>}
                  onClick={() => {
                    setPopupType('edit');
                    setPopupItem(item);
                  }}
                ></Button>
                <Button
                  leftComponent={<Icon name="close"></Icon>}
                  onClick={() => {
                    setPopupType('delete');
                    setPopupItem(item);
                  }}
                ></Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom border/shadow */}
      <div className="fixed bottom-0 left-0 right-0 h-2 bg-gray-300"></div>

      <CircleButton
        name="add"
        onClick={() =>
          navigate(`/flashcard-deck/${deck._id}/add`, {
            state: {
              title: deck.title,
            },
          })
        }
      ></CircleButton>

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
                ></UpdateFlashcard>
              </>
            )}

            {popupType === 'delete' && (
              <>
                <h3 className="text-lg font-semibold mb-4 text-red-600">
                  Delete this flashcard ?
                </h3>
                <p className="text-sm mb-4">
                  Do you want to delete this flashcard ?
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => handleDelete(popupItem)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    title="Delete"
                  ></Button>
                  <Button
                    onClick={() => {
                      setPopupType(null);
                      setPopupItem(null);
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
