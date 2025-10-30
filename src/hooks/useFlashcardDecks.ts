import { useState, useEffect } from 'react';
import flashcardService from '../services/flashcard.service';

interface FlashcardDeck {
    _id: string;
    title: string;
    description?: string;
}

interface UseFlashcardDecksResult {
    decks: FlashcardDeck[];
    loading: boolean;
    error: string | null;
}

export const useFlashcardDecks = (): UseFlashcardDecksResult => {
    const [decks, setDecks] = useState<FlashcardDeck[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDecks = async () => {
            try {
                setLoading(true);
                const response = await flashcardService.getFlashcardDeckList();
                if (response && Array.isArray(response)) {
                    setDecks(response);
                }
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách bộ flashcard');
                console.error('Error fetching decks:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDecks();
    }, []);

    return {
        decks,
        loading,
        error,
    };
};
