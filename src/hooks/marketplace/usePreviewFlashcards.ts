import { useState, useCallback } from 'react';
import marketplaceService from '../../services/marketplace.service';

interface Flashcard {
  front: string;
  back: string;
  deck_id?: string;
  originalFlashcardId?: string;
}

interface PreviewFlashcardsResponse {
  flashcards: Flashcard[];
  totalFlashcards: number;
  previewCount: number;
}

export const usePreviewFlashcards = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [totalFlashcards, setTotalFlashcards] = useState(0);
  const [previewCount, setPreviewCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreviewFlashcards = useCallback(async (marketplaceItemId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await marketplaceService.getPreviewFlashcards(marketplaceItemId);

      if (response) {
        setFlashcards(response.flashcards || []);
        setTotalFlashcards(response.totalFlashcards || 0);
        setPreviewCount(response.previewCount || 0);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch preview flashcards';
      setError(errorMessage);
      console.error('Error fetching preview flashcards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setFlashcards([]);
    setTotalFlashcards(0);
    setPreviewCount(0);
    setError(null);
  }, []);

  return {
    flashcards,
    totalFlashcards,
    previewCount,
    loading,
    error,
    fetchPreviewFlashcards,
    reset,
  };
};
