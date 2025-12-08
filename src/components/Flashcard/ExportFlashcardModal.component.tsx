import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FlashcardDeckResponse, FlashcardResponse } from '../../types/flashcard/response/flashcard.response';

interface ExportFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: FlashcardDeckResponse | null;
  flashcards: FlashcardResponse[];
}

type ExportFormat = 'csv' | 'json';

const ExportFlashcardModal: React.FC<ExportFlashcardModalProps> = ({
  isOpen,
  onClose,
  deck,
  flashcards,
}) => {
  const { t } = useTranslation('flashcard');
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    if (!deck) return '';

    // CSV Header
    let csv = 'Front,Back\n';

    // Add flashcards
    flashcards.forEach((card) => {
      const front = `"${card.front.replace(/"/g, '""')}"`;
      const back = `"${card.back.replace(/"/g, '""')}"`;
      csv += `${front},${back}\n`;
    });

    return csv;
  };

  const exportToJSON = () => {
    if (!deck) return '';

    const data = {
      deck: {
        title: deck.title,
        description: deck.description || '',
      },
      flashcards: flashcards.map((card) => ({
        front: card.front,
        back: card.back,
      })),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    return JSON.stringify(data, null, 2);
  };

  const handleExport = async () => {
    if (!deck) {
      toast.error(t('export.noDeckSelected'));
      return;
    }

    if (flashcards.length === 0) {
      toast.warning(t('export.noFlashcards'));
      return;
    }

    setIsExporting(true);

    try {
      let content = '';
      let filename = '';
      let mimeType = '';

      if (format === 'csv') {
        content = exportToCSV();
        filename = `${deck.title.replace(/[^a-z0-9]/gi, '_')}_flashcards.csv`;
        mimeType = 'text/csv;charset=utf-8;';
      } else {
        content = exportToJSON();
        filename = `${deck.title.replace(/[^a-z0-9]/gi, '_')}_flashcards.json`;
        mimeType = 'application/json;charset=utf-8;';
      }

      // Create download link
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t('export.success', { count: flashcards.length }));
      onClose();
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(t('export.error'));
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen || !deck) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('export.title')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-lg transition-colors"
              disabled={isExporting}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Deck Info */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {deck.title}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('export.flashcardCount', { count: flashcards.length })}
            </p>
          </div>

          {/* Format Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('export.format')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('csv')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  format === 'csv'
                    ? 'border-[#21b4ca] bg-[#21b4ca]/5'
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                }`}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">CSV</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('export.csvDesc')}
                </div>
              </button>
              <button
                onClick={() => setFormat('json')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  format === 'json'
                    ? 'border-[#21b4ca] bg-[#21b4ca]/5'
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                }`}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">JSON</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('export.jsonDesc')}
                </div>
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                  fill="currentColor"
                />
              </svg>
              <div className="flex-1">
                <p className="text-xs text-blue-900 dark:text-blue-100 font-medium mb-1">
                  {t('export.noteTitle')}
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                  {t('export.note1')}<br />
                  {t('export.note2')}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {t('export.cancel')}
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 px-4 py-2.5 bg-[#21b4ca] text-white rounded-lg hover:bg-[#1a9db0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('export.exporting')}
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"
                      fill="currentColor"
                    />
                  </svg>
                  {t('export.export')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportFlashcardModal;
