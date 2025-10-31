import React, { useEffect, useRef } from 'react';
import iro from '@jaames/iro';
import { useTheme } from '../../contexts/theme.context';
import COLORS from '../../constants/colors.constant';
import styles from './ColorPicker.module.css';

const ColorPicker: React.FC = () => {
  const { setPrimaryColor, primaryColor } = useTheme();
  const pickerRef = useRef<HTMLDivElement>(null);
  const iroInstance = useRef<any>(null);

  useEffect(() => {
    if (pickerRef.current && !iroInstance.current) {
      const picker = iro.ColorPicker(pickerRef.current, {
        width: 240,
        color: primaryColor,
        layout: [
          { component: iro.ui.Wheel },
          { component: iro.ui.Slider, options: { sliderType: 'value' } },
          { component: iro.ui.Slider, options: { sliderType: 'saturation' } },
          { component: iro.ui.Slider, options: { sliderType: 'hue' } },
        ],
      });

      picker.on('color:change', (color: any) => {
        setPrimaryColor(color.hexString);
      });

      iroInstance.current = picker;
    }
  }, [primaryColor, setPrimaryColor]);

  return (
    <div ref={pickerRef} className={styles.colorPickerContainer} />
  );
};

const presetColors = [
  COLORS.white900,
  COLORS.black500,
  COLORS.green500,
  COLORS.red500,
  COLORS.yellow500,
  COLORS.purple100
];

export const ColorSwatches: React.FC = () => {
  const { setPrimaryColor, primaryColor } = useTheme();

  return (
    <div className={styles.colorSwatchesContainer}>
      {presetColors.map(color => (
        <button
          key={color}
          onClick={() => setPrimaryColor(color)}
          title={`Select color ${color}`}
          className={`${styles.colorButton} ${primaryColor === color ? styles.active : ''}`}
          aria-label={`Select color ${color}`}
          data-color={color}
        />
      ))}
    </div>
  );
};

export default ColorPicker;
