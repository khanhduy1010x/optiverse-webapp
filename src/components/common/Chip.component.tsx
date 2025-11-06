import React from 'react';
import COLORS from '../../constants/colors.constant';
import View from './View.component';
import Text from './Text.component';
import { useTranslation } from 'react-i18next';

interface ChipProps {
  title: string;
  textType?: 'regular' | 'bold';
  textSize?: number;
  bgColor?: string;
}

const Chip: React.FC<ChipProps> = ({ title, textType = 'bold', textSize = 12, bgColor }) => {
  const containerStyles: React.CSSProperties = {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: bgColor ? bgColor : COLORS.green700,
    borderRadius: 20,
    display: 'flex',
    flex: 1,
  };

  return (
    <View style={containerStyles}>
      <Text
        title={title}
        textType={textType}
        textSize={textSize}
        style={{ color: COLORS.white900 }}
        translate={true}
      />
    </View>
  );
};

interface FlashcardChipsProps {
  newFlashcard: number;
  learningFlashcard: number;
  reviewingFlashcard: number;
  className?: string;
  style?: React.CSSProperties;
}

const FlashcardChips: React.FC<FlashcardChipsProps> = ({
  newFlashcard,
  learningFlashcard,
  reviewingFlashcard,
  className = '',
  style,
}) => {
  const { t } = useTranslation();
  
  return (
    <View
      className={`transition-all duration-300 w-full flex gap-4 ${className}`}
      style={{ backgroundColor: 'transparent', ...style }}
    >
      <Chip title={`${newFlashcard} ${t('flashcard:new')}`} bgColor={COLORS.green700} />
      <Chip title={`${learningFlashcard} ${t('flashcard:learning')}`} bgColor={COLORS.red700} />
      <Chip
        title={`${reviewingFlashcard} ${t('flashcard:reviewing')}`}
        bgColor={COLORS.yellow700}
      />
    </View>
  );
};

export { Chip, FlashcardChips };
