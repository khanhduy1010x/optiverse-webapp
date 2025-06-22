import COLORS from '../../constants/colors.constant';
import {
  DeckDueItem,
  ReviewStatistics,
} from '../../types/flashcard/props/component.props';

export const reviewStatisticData: ReviewStatistics = {
  totalDeckCount: 5,
  totalFlashcardCount: 245,
  totalReviewSessionCount: 210,
  dueTodayCount: 37,
  averageEaseFactor: 2.58,
  averageQuality: 2.15,
  newCount: 48,
  learningCount: 102,
  reviewingCount: 95,
};

export const deckDueItemsData: DeckDueItem[] = [
  {
    deckTitle: 'English Vocabulary',
    dueTodayCount: 12,
  },
  {
    deckTitle: 'IELTS Listening',
    dueTodayCount: 5,
  },
  {
    deckTitle: 'History',
    dueTodayCount: 9,
  },
  {
    deckTitle: 'Science & Tech',
    dueTodayCount: 6,
  },
  {
    deckTitle: 'Japanese N5',
    dueTodayCount: 5,
  },
];

export const PIE_COLORS = [
  COLORS.yellow500,    // New
  COLORS.green500,     // Learning
  COLORS.purple100,    // Reviewing
];

export const StatItem: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col items-center p-3 border rounded-lg">
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);
