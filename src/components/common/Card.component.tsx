import React from 'react';
import COLORS from '../../constants/colors.constant';
import { formatElapsedTime, getElapsedTimeForI18n } from '../../utils/date.utils';
import { FlashcardChips } from './Chip.component';
import Icon from './Icon/Icon.component';
import Text from './Text.component';
import { useTheme } from '../../contexts/theme.context';
import logo from '../../assets/app-icon/optiverse.logo.svg';
import { GROUP_CLASSNAMES } from '../../styles';
import {
  CardInteractionProps,
  useCardInteractions,
} from '../../hooks/useCardInteraction.hook';
import { useTranslation } from 'react-i18next';

interface FlashcardCardProps extends CardInteractionProps {
  title: string;
  transparent?: boolean;
  lastReview: number;
  newFlashcard: number;
  learningFlashcard: number;
  reviewingFlashcard: number;
  style?: React.CSSProperties;
  creatorName?: string;
  showCreator?: boolean;
}

export const FlashcardDeckCard: React.FC<FlashcardCardProps> = ({
  title,
  transparent,
  lastReview,
  showCreator,
  creatorName,
  newFlashcard,
  learningFlashcard,
  reviewingFlashcard,
  style,
  onClick,
  onLongPress,
  onContextMenu,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { handleMouseDown, handleMouseUp, handleContextMenu } =
    useCardInteractions({ onClick, onLongPress, onContextMenu });
  
  const elapsedTime = getElapsedTimeForI18n(lastReview);

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'transparent',
        padding: 8,
        borderRadius: 8,
        border: `0.5px solid ${COLORS.black200}`,
        cursor: 'pointer',
        ...style,
      }}
      className={GROUP_CLASSNAMES.selectNone}
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
        {showCreator && creatorName && (
          <Text style={{ fontSize: 11, color: COLORS.black300, fontStyle: 'italic' }}>
            {t('flashcard:created_by')} {creatorName}
          </Text>
        )}
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 16,
            textTransform: 'capitalize',
          }}
          className={GROUP_CLASSNAMES.selectText}
        >
          {title}
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="clock" color={COLORS.black200} />
          <Text style={{ fontSize: 12, color: COLORS.black200 }}>
            {t('flashcard:last_review')} {elapsedTime.value > 0 ? `${elapsedTime.value} ${t(elapsedTime.key)}` : t(elapsedTime.key)} {elapsedTime.value > 0 && t('flashcard:ago')}
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

interface FlashcardProps extends CardInteractionProps {
  front: string;
  back: string;
  transparent?: boolean;
  style?: React.CSSProperties;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  front,
  back,
  transparent,
  style,
  onClick,
  onLongPress,
  onContextMenu,
}) => {
  const { handleMouseDown, handleMouseUp, handleContextMenu } =
    useCardInteractions({ onClick, onLongPress, onContextMenu });

  return (
    <div
      style={{
        minHeight: '100px',
        ...style,
      }}
      className="w-full flex flex-row gap-4 justify-between"
    >
      <div
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        style={{
          backgroundColor: 'transparent',
          padding: 8,
          borderRadius: 8,
          border: `0.5px solid ${COLORS.black200}`,
          ...style,
        }}
        className="w-1/2 break-words min-w-0"
      >
        <Text style={{ fontSize: 16 }}>{front}</Text>
      </div>
      <div
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        style={{
          backgroundColor: 'transparent',
          padding: 8,
          borderRadius: 8,
          border: `0.5px solid ${COLORS.black200}`,
          ...style,
        }}
        className="w-1/2 break-words min-w-0"
      >
        <Text style={{ fontSize: 16 }}>{back}</Text>
      </div>
    </div>
  );
};
