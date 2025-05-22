import React from 'react';
import COLORS from '../../constants/colors';
import { TEXT } from '../../constants/typography';
import View from './View';
import Text from './Text';
interface ChipProps {
  title: string;
  fontType?: keyof typeof TEXT;
  bgColor?: string;
}

const Chip: React.FC<ChipProps> = ({ title, fontType = 'bold12', bgColor }) => {
  const containerStyles: React.CSSProperties = {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: bgColor ? bgColor : COLORS.green700,
    borderRadius: 20,
  };

  return (
    <View style={containerStyles}>
      <Text
        title={title}
        textStyle={fontType}
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
  const containerStyles: React.CSSProperties = {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  };

  return (
    <View
      className={`transition-all duration-300 ${className}`}
      style={{ ...containerStyles, ...style }}
    >
      <Chip title={`${newFlashcard} New`} bgColor={COLORS.green700} />
      <Chip title={`${learningFlashcard} Learning`} bgColor={COLORS.red700} />
      <Chip title={`${reviewingFlashcard} Reviewing`} bgColor={COLORS.yellow700} />
    </View>
  );
};

export { Chip, FlashcardChips };