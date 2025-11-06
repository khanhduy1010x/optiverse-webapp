import React, { useState } from 'react';
import Icon from '../../components/common/Icon/Icon.component';
import { useTranslation } from 'react-i18next';
import { ToolBarNoteProps } from '../../types/note/props/component.props';

// Add custom CSS for toolbar icons
const toolbarStyles = `
  .toolbar-note button svg {
    color: #1f2937 !important;
    fill: #1f2937 !important;
  }
  
  .toolbar-note button:hover svg {
    color: #374151 !important;
    fill: #374151 !important;
  }
  
  .toolbar-note button.active svg {
    color: #0891b2 !important;
    fill: #0891b2 !important;
  }
`;

const ToolBarNote: React.FC<ToolBarNoteProps> = ({ onAction, formatState }) => {
  const { t } = useTranslation();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);

  // Inject toolbar styles
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = toolbarStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const colors = [
    '#000000', '#e60000', '#ff9900', '#ffff00', '#008a00',
    '#0066cc', '#9933ff', '#ffffff', '#facccc', '#ffebcc',
    '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff', '#bbbbbb',
    '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0',
    '#c285ff', '#888888', '#a10000', '#b26b00', '#b2b200',
    '#006100', '#0047b2', '#6b24b2', '#444444', '#5c0000',
    '#663d00', '#666600', '#003700', '#002966', '#3d1466'
  ];

  const fonts = [
    'Sans Serif', 'Serif', 'Monospace', 'Helvetica',
    'Arial', 'Times New Roman', 'Courier New'
  ];

  const sizes = ['small', 'normal', 'large', 'huge'];

  return (
    <div className="toolbar-note flex items-center border-t border-gray-200 p-2 bg-white">
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onAction('bold')}
          className={`p-2 rounded ${formatState.bold ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title={t('note.format.bold')}
        >
          <Icon name="bold" />
        </button>
        <button
          onClick={() => onAction('italic')}
          className={`p-2 rounded ${formatState.italic ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title={t('note.format.italic')}
        >
          <Icon name="italic" />
        </button>
        <button
          onClick={() => onAction('underline')}
          className={`p-2 rounded ${formatState.underline ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title={t('note.format.underline')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
          </svg>
        </button>
        <button
          onClick={() => onAction('strike')}
          className={`p-2 rounded ${formatState.strike ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title={t('note.format.strike')}
        >
          <Icon name="strike" />
        </button>
        <div className="h-6 border-r border-gray-300 mx-1"></div>
        <button
          onClick={() => onAction('title')}
          className={`p-2 rounded ${formatState.header ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title={t('note.format.title')}
        >
          <Icon name="title" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowFontMenu(!showFontMenu)}
            className="p-2 rounded hover:bg-gray-100"
            title={t('note.format.font')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z" />
            </svg>
          </button>
          {showFontMenu && (
            <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-40">
              {fonts.map((font) => (
                <button
                  key={font}
                  className={`block w-full text-left px-4 py-2 text-sm ${formatState.font === font ? 'bg-[#e6f7f9]' : 'hover:bg-gray-100'}`}
                  onClick={() => {
                    onAction('font', font);
                    setShowFontMenu(false);
                  }}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSizeMenu(!showSizeMenu)}
            className="p-2 rounded hover:bg-gray-100"
            title={t('note.format.size')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z" />
            </svg>
          </button>
          {showSizeMenu && (
            <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-32">
              {sizes.map((size) => (
                <button
                  key={size}
                  className={`block w-full text-left px-4 py-2 text-sm ${formatState.size === size ? 'bg-[#e6f7f9]' : 'hover:bg-gray-100'}`}
                  onClick={() => {
                    onAction('size', size);
                    setShowSizeMenu(false);
                  }}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 border-r border-gray-300 mx-1"></div>

        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded hover:bg-gray-100"
            title={t('note.format.textColor')}
          >
            <div className="flex items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z" />
              </svg>
              {formatState.color && (
                <div
                  className="w-2 h-2 rounded-full ml-1"
                  style={{ backgroundColor: formatState.color }}
                ></div>
              )}
            </div>
          </button>
          {showColorPicker && (
            <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-2 w-36">
              <div className="grid grid-cols-6 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-5 h-5 rounded-sm ${color === '#ffffff' ? 'border border-gray-300' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onAction('color', color);
                      setShowColorPicker(false);
                    }}
                  ></button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
            className="p-2 rounded hover:bg-gray-100"
            title={t('note.format.highlight')}
          >
            <div className="flex items-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
              </svg>
              {formatState.background && (
                <div
                  className="w-2 h-2 rounded-full ml-1"
                  style={{ backgroundColor: formatState.background }}
                ></div>
              )}
            </div>
          </button>
          {showBackgroundPicker && (
            <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-2 w-36">
              <div className="grid grid-cols-6 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-5 h-5 rounded-sm ${color === '#ffffff' ? 'border border-gray-300' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onAction('background', color);
                      setShowBackgroundPicker(false);
                    }}
                  ></button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 border-r border-gray-300 mx-1"></div>

        <div className="relative">
          <button
            onClick={() => setShowAlignMenu(!showAlignMenu)}
            className="p-2 rounded hover:bg-gray-100"
            title={t('note.format.align')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z" />
            </svg>
          </button>
          {showAlignMenu && (
            <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <button
                className={`block w-full text-left px-4 py-2 text-sm ${formatState.align === '' || formatState.align === 'left' ? 'bg-[#e6f7f9]' : 'hover:bg-gray-100'}`}
                onClick={() => {
                  onAction('align', 'left');
                  setShowAlignMenu(false);
                }}
              >
                <div className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                    <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
                  </svg>
                  <span>Left</span>
                </div>
              </button>
              <button
                className={`block w-full text-left px-4 py-2 text-sm ${formatState.align === 'center' ? 'bg-[#e6f7f9]' : 'hover:bg-gray-100'}`}
                onClick={() => {
                  onAction('align', 'center');
                  setShowAlignMenu(false);
                }}
              >
                <div className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                    <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
                  </svg>
                  <span>Center</span>
                </div>
              </button>
              <button
                className={`block w-full text-left px-4 py-2 text-sm ${formatState.align === 'right' ? 'bg-[#e6f7f9]' : 'hover:bg-gray-100'}`}
                onClick={() => {
                  onAction('align', 'right');
                  setShowAlignMenu(false);
                }}
              >
                <div className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                    <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
                  </svg>
                  <span>Right</span>
                </div>
              </button>
              <button
                className={`block w-full text-left px-4 py-2 text-sm ${formatState.align === 'justify' ? 'bg-[#e6f7f9]' : 'hover:bg-gray-100'}`}
                onClick={() => {
                  onAction('align', 'justify');
                  setShowAlignMenu(false);
                }}
              >
                <div className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                    <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z" />
                  </svg>
                  <span>Justify</span>
                </div>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => onAction('list-dot')}
          className={`p-2 rounded ${formatState.list === 'bullet' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title={t('note.format.bulletList')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
          </svg>
        </button>
        <button
          onClick={() => onAction('list-number')}
          className={`p-2 rounded ${formatState.list === 'ordered' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title={t('note.format.numberedList')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
          </svg>
        </button>
        <button
          onClick={() => onAction('indent', '-1')}
          className="p-2 rounded hover:bg-gray-100"
          title={t('note.format.outdent')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z" />
          </svg>
        </button>
        <button
          onClick={() => onAction('indent', '+1')}
          className="p-2 rounded hover:bg-gray-100"
          title={t('note.format.indent')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zm0-6h10V7H11v2zm0 4h10v-2H11v2z" />
          </svg>
        </button>

        <div className="h-6 border-r border-gray-300 mx-1"></div>

        <button
          onClick={() => onAction('blockquote')}
          className={`p-2 rounded ${formatState.blockquote ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title={t('note.format.quote')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z" />
          </svg>
        </button>
        <button
          onClick={() => onAction('code-block')}
          className={`p-2 rounded ${formatState.codeBlock ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title={t('note.format.code')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
          </svg>
        </button>
        <button
          onClick={() => onAction('link')}
          className={`p-2 rounded ${formatState.link ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title={t('note.format.link')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
          </svg>
        </button>

        <div className="h-6 border-r border-gray-300 mx-1"></div>

        <button
          onClick={() => onAction('clear-format')}
          className="p-2 rounded hover:bg-gray-100"
          title={t('note.format.clear')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z" />
          </svg>
        </button>
      </div>

      <div className="ml-auto flex items-center space-x-1">
        <button
          onClick={() => onAction('undo')}
          className="p-2 rounded hover:bg-gray-100"
          title={t('note.format.undo')}
        >
          <Icon name="repeat" />
        </button>
        <button
          onClick={() => onAction('redo')}
          className="p-2 rounded hover:bg-gray-100"
          title={t('note.format.redo')}
        >
          <Icon name="repeat" />
        </button>
      </div>
    </div>
  );
};

export default ToolBarNote;