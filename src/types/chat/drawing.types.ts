export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  points: DrawingPoint[];
  color: string;
  width: number;
  tool: DrawingTool;
  timestamp: number;
}

export enum DrawingTool {
  PEN = 'pen',
  BRUSH = 'brush',
  ERASER = 'eraser',
  HIGHLIGHTER = 'highlighter'
}

export interface DrawingSettings {
  tool: DrawingTool;
  color: string;
  width: number;
  opacity: number;
}

export interface DrawingBoardState {
  strokes: DrawingStroke[];
  currentStroke: DrawingStroke | null;
  settings: DrawingSettings;
  canvasSize: {
    width: number;
    height: number;
  };
  isDrawing: boolean;
  history: DrawingStroke[][];
  historyIndex: number;
}

export interface DrawingBoardProps {
  isOpen: boolean;
  onClose: () => void;
  onSendDrawing: (imageBlob: Blob) => void;
  width?: number;
  height?: number;
}

export interface DrawingToolbarProps {
  settings: DrawingSettings;
  onSettingsChange: (settings: Partial<DrawingSettings>) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export interface DrawingCanvasProps {
  width: number;
  height: number;
  strokes: DrawingStroke[];
  currentStroke: DrawingStroke | null;
  settings: DrawingSettings;
  onStartDrawing: (point: DrawingPoint) => void;
  onContinueDrawing: (point: DrawingPoint) => void;
  onEndDrawing: () => void;
}

export const DEFAULT_DRAWING_SETTINGS: DrawingSettings = {
  tool: DrawingTool.PEN,
  color: '#000000',
  width: 3,
  opacity: 1
};

export const DRAWING_COLORS = [
  '#000000', // Black
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFC0CB', // Pink
  '#A52A2A', // Brown
  '#808080', // Gray
];

export const DRAWING_WIDTHS = [1, 2, 3, 5, 8, 12, 16, 20];