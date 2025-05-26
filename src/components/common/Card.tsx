import React from 'react';
import COLORS from '../../constants/colors';
import { formatElapsedTime } from '../../services/dateService';
import { FlashcardChips } from './Chip';
import Icon from './Icon/Icon';
import Text from './Text';
import { useTheme } from '../../contexts/ThemeContext';
import logo from '../../assets/app-icon/optiverse-logo.svg';

interface FlashcardCardProps {
  title: string;
  transparent?: boolean;
  lastReview: number;
  newFlashcard: number;
  learningFlashcard: number;
  reviewingFlashcard: number;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const FlashcardDeckCard: React.FC<FlashcardCardProps> = ({
  title,
  transparent,
  lastReview,
  newFlashcard,
  learningFlashcard,
  reviewingFlashcard,
  style,
  onClick,
}) => {
  const { theme } = useTheme();

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        backgroundColor: transparent ? 'transparent' : theme.background,
        padding: 8,
        borderRadius: 8,
        border: `0.5px solid ${COLORS.black200}`,
        cursor: 'pointer',
        ...style,
      }}
    >
      <img
        src={logo}
        alt="Deck Icon"
        style={{
          width: 90,
          height: 90,
          borderRadius: 8,
          border: `0.5px solid ${COLORS.black200}`,
          backgroundColor: COLORS.white900,
          objectFit: 'contain',
        }}
      />
      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 16,
            textTransform: 'capitalize',
          }}
        >
          {title}
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="clock" color={COLORS.black200} />
          <Text style={{ fontSize: 12, color: COLORS.black200 }}>
            Last review {formatElapsedTime(lastReview)} ago
          </Text>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <FlashcardChips
            newFlashcard={newFlashcard}
            learningFlashcard={learningFlashcard}
            reviewingFlashcard={reviewingFlashcard}
          />
        </div>
      </div>
    </div>
  );
};

interface FlashcardProps {
  front: string;
  back: string;
  transparent?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  front,
  back,
  transparent,
  style,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: transparent ? 'transparent' : '#f5f5f5',
        padding: 8,
        borderRadius: 8,
        border: `0.5px solid ${COLORS.black200}`,
        gap: 12,
        ...style,
      }}
    >
      <Text style={{ fontSize: 16 }}>{front}</Text>
      <div
        style={{
          height: 1,
          backgroundColor: COLORS.black200,
          margin: '12px 0',
          width: '50%',
          alignSelf: 'flex-start',
        }}
      />
      <Text style={{ fontSize: 16 }}>{back}</Text>
    </div>
  );
};
