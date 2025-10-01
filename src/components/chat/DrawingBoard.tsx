import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  DrawingBoardProps, 
  DrawingStroke, 
  DrawingPoint, 
  DrawingSettings, 
  DrawingTool,
  DEFAULT_DRAWING_SETTINGS 
} from '../../types/chat/drawing.types';
import DrawingToolbar from './DrawingToolbar';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const DrawingBoard: React.FC<DrawingBoardProps> = ({
  isOpen,
  onClose,
  onSendDrawing,
  width = 800,
  height = 600
}) => {
  const { t } = useAppTranslate('chat');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const [settings, setSettings] = useState<DrawingSettings>(DEFAULT_DRAWING_SETTINGS);
  const [history, setHistory] = useState<DrawingStroke[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Get canvas context
  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  // Get mouse/touch position relative to canvas
  const getPointFromEvent = useCallback((event: MouseEvent | TouchEvent): DrawingPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  // Start drawing
  const startDrawing = useCallback((point: DrawingPoint) => {
    const newStroke: DrawingStroke = {
      id: Date.now().toString(),
      points: [point],
      color: settings.color,
      width: settings.width,
      tool: settings.tool,
      timestamp: Date.now()
    };

    setCurrentStroke(newStroke);
    setIsDrawing(true);
  }, [settings]);

  // Continue drawing
  const continueDrawing = useCallback((point: DrawingPoint) => {
    if (!isDrawing || !currentStroke) return;

    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, point]
    };

    setCurrentStroke(updatedStroke);
  }, [isDrawing, currentStroke]);

  // End drawing
  const endDrawing = useCallback(() => {
    if (!currentStroke) return;

    const newStrokes = [...strokes, currentStroke];
    setStrokes(newStrokes);
    setCurrentStroke(null);
    setIsDrawing(false);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newStrokes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [currentStroke, strokes, history, historyIndex]);

  // Draw stroke on canvas
  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    if (stroke.points.length < 2) return;

    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.tool === DrawingTool.ERASER) {
      ctx.globalCompositeOperation = 'destination-out';
    } else if (stroke.tool === DrawingTool.HIGHLIGHTER) {
      ctx.globalAlpha = 0.5;
    }

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }

    ctx.stroke();
    ctx.restore();
  }, []);

  // Redraw canvas
  const redrawCanvas = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw all strokes
    strokes.forEach(stroke => drawStroke(ctx, stroke));

    // Draw current stroke
    if (currentStroke) {
      drawStroke(ctx, currentStroke);
    }
  }, [strokes, currentStroke, getContext, drawStroke, width, height]);

  // Mouse event handlers
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    const point = getPointFromEvent(event.nativeEvent);
    startDrawing(point);
  }, [getPointFromEvent, startDrawing]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    if (!isDrawing) return;
    const point = getPointFromEvent(event.nativeEvent);
    continueDrawing(point);
  }, [isDrawing, getPointFromEvent, continueDrawing]);

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    endDrawing();
  }, [endDrawing]);

  // Touch event handlers
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    const point = getPointFromEvent(event.nativeEvent);
    startDrawing(point);
  }, [getPointFromEvent, startDrawing]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing) return;
    const point = getPointFromEvent(event.nativeEvent);
    continueDrawing(point);
  }, [isDrawing, getPointFromEvent, continueDrawing]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    endDrawing();
  }, [endDrawing]);

  // Toolbar actions
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setStrokes(history[newIndex]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setStrokes(history[newIndex]);
    }
  }, [historyIndex, history]);

  const handleClear = useCallback(() => {
    setStrokes([]);
    setCurrentStroke(null);
    setHistory([[]]);
    setHistoryIndex(0);
  }, []);

  const handleSettingsChange = useCallback((newSettings: Partial<DrawingSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Convert canvas to blob and send
  const handleSendDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas with white background
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Fill with white background
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the original canvas on top
    tempCtx.drawImage(canvas, 0, 0);

    // Convert to blob and send
    tempCanvas.toBlob((blob) => {
      if (blob) {
        onSendDrawing(blob);
        onClose();
      }
    }, 'image/png');
  }, [onSendDrawing, onClose]);

  // Redraw when strokes or current stroke changes
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Bảng vẽ</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <DrawingToolbar
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
        />

        {/* Canvas */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="block cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'none' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSendDrawing}
            disabled={strokes.length === 0}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Gửi hình vẽ
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingBoard;