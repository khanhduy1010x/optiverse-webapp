import React, { useEffect, useState } from 'react';
import { FlashcardDeckCard } from '../../components/common/Card';
import { useNavigate } from 'react-router-dom';
import { token } from '../../services/apitest';
import { Button, CircleButton } from '../../components/common/Button';
import Icon from '../../components/common/Icon/Icon';
import UpdateFlashcardDeck from './UpdateFlashcardDeck';
import AddFlashcardDeck from './AddFlashcardDeck';

interface Deck {
  _id: string;
  title: string;
  lastReview: number;
  learningCount: number;
  newCount: number;
  reviewingCount: number;
}

export default function FlashcardDeckList() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [popupType, setPopupType] = useState<'edit' | 'delete' | 'add' | null>(
    null
  );
  const [popupItem, setPopupItem] = useState<Deck | null>(null);

  const toggleOptions = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const closePopupAndRefresh = async () => {
    await fetchData();
    setSelectedId(null);
    setPopupType(null);
    setPopupItem(null);
  };

  const handleDelete = async (item: Deck) => {
    try {
      await fetch(
        `http://localhost:81/productivity/flashcard-deck/${item._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      await closePopupAndRefresh();
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(
        `http://localhost:81/productivity/flashcard-deck/all`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result: Deck[] = (await response.json()).data;
      console.log(result);
      setDecks(result);
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
              ></FlashcardDeckCard>
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
      )}

      <CircleButton
        name="add"
        onClick={() => {
          setPopupType('add');
          setPopupItem({
            _id: '',
            lastReview: 0,
            learningCount: 0,
            newCount: 0,
            reviewingCount: 0,
            title: '',
          });
        }}
      ></CircleButton>

      {popupType && popupItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div
            className={`bg-white p-6 rounded shadow-md relative ${popupType === 'delete' ? 'w-80' : 'w-200'}`}
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

            {popupType === 'add' && (
              <>
                <h3 className="text-lg font-semibold mb-2">Create deck</h3>
                <AddFlashcardDeck
                  item={popupItem}
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
