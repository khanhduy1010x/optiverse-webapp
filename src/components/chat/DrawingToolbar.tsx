import React from 'react';
import { 
  DrawingToolbarProps, 
  DrawingTool, 
  DRAWING_COLORS, 
  DRAWING_WIDTHS 
} from '../../types/chat/drawing.types';

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  settings,
  onSettingsChange,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo
}) => {
  const tools = [
    { 
      tool: DrawingTool.PEN, 
      icon: '✏️', 
      label: 'Bút',
      cursor: 'crosshair'
    },
    { 
      tool: DrawingTool.BRUSH, 
      icon: '🖌️', 
      label: 'Cọ vẽ',
      cursor: 'crosshair'
    },
    { 
      tool: DrawingTool.HIGHLIGHTER, 
      icon: '🖍️', 
      label: 'Bút dạ quang',
      cursor: 'crosshair'
    },
    { 
      tool: DrawingTool.ERASER, 
      icon: '🧽', 
      label: 'Tẩy',
      cursor: 'crosshair'
    }
  ];

  return (
    <div className="border-b bg-gray-50 p-3">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Drawing Tools */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Công cụ:</span>
          <div className="flex gap-1">
            {tools.map(({ tool, icon, label }) => (
              <button
                key={tool}
                onClick={() => onSettingsChange({ tool })}
                className={`p-2 rounded-lg border transition-colors ${
                  settings.tool === tool
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                title={label}
              >
                <span className="text-lg">{icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        {settings.tool !== DrawingTool.ERASER && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Màu:</span>
            <div className="flex gap-1">
              {DRAWING_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => onSettingsChange({ color })}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    settings.color === color
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              
              {/* Custom color picker */}
              <div className="relative">
                <input
                  type="color"
                  value={settings.color}
                  onChange={(e) => onSettingsChange({ color: e.target.value })}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer opacity-0 absolute inset-0"
                />
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500"
                  title="Chọn màu tùy chỉnh"
                >
                  <span className="text-white text-xs font-bold">+</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Brush Size */}
        {settings.tool !== DrawingTool.ERASER && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Kích thước:</span>
            <div className="flex gap-1">
              {DRAWING_WIDTHS.map(width => (
                <button
                  key={width}
                  onClick={() => onSettingsChange({ width })}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                    settings.width === width
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  title={`${width}px`}
                >
                  <div
                    className={`rounded-full ${
                      settings.width === width ? 'bg-white' : 'bg-gray-700'
                    }`}
                    style={{
                      width: Math.min(width * 2, 16),
                      height: Math.min(width * 2, 16)
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Eraser Size */}
        {settings.tool === DrawingTool.ERASER && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Kích thước tẩy:</span>
            <div className="flex gap-1">
              {[5, 10, 15, 20, 25, 30].map(width => (
                <button
                  key={width}
                  onClick={() => onSettingsChange({ width })}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                    settings.width === width
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  title={`${width}px`}
                >
                  <div
                    className={`rounded-full border ${
                      settings.width === width ? 'border-white' : 'border-gray-700'
                    }`}
                    style={{
                      width: Math.min(width / 2, 16),
                      height: Math.min(width / 2, 16)
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-8 bg-gray-300" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-lg border bg-white text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Hoàn tác"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-lg border bg-white text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Làm lại"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>

          <button
            onClick={onClear}
            className="p-2 rounded-lg border bg-red-500 text-white border-red-500 hover:bg-red-600 transition-colors"
            title="Xóa tất cả"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingToolbar;