import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import flashcardService from '../../services/flashcard.service';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface ImportFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
  onSuccess?: () => void;
}

interface ParsedFlashcard {
  front: string;
  back: string;
}

interface ParsedData {
  deck: {
    title: string;
    description?: string;
  };
  flashcards: ParsedFlashcard[];
}

const ImportFlashcardModal: React.FC<ImportFlashcardModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}) => {
  const { t } = useAppTranslate('flashcard');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    validateAndSetFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    validateAndSetFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['application/json', 'text/csv', 'text/plain'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isValidExtension = ['json', 'csv'].includes(fileExtension || '');

    if (!validTypes.includes(file.type) && !isValidExtension) {
      toast.error(t('import.invalidFileType'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('import.fileTooLarge'));
      return;
    }

    setSelectedFile(file);
  };

  const parseCSV = async (file: File): Promise<ParsedData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter((line) => line.trim());

          if (lines.length < 2) {
            throw new Error(t('import.csvEmpty'));
          }

          // Skip header line
          const dataLines = lines.slice(1);
          const flashcards: ParsedFlashcard[] = [];

          dataLines.forEach((line, index) => {
            // Parse CSV line (handle quoted values)
            const regex = /(?:^|,)("(?:[^"]+|"")*"|[^,]*)/g;
            const values: string[] = [];
            let match;

            while ((match = regex.exec(line)) !== null) {
              if (match[1] !== undefined) {
                let value = match[1];
                // Remove quotes and unescape double quotes
                if (value.startsWith('"') && value.endsWith('"')) {
                  value = value.slice(1, -1).replace(/""/g, '"');
                }
                values.push(value);
              }
            }

            if (values.length >= 2 && values[0] && values[1]) {
              flashcards.push({
                front: values[0].trim(),
                back: values[1].trim(),
              });
            }
          });

          if (flashcards.length === 0) {
            throw new Error(t('import.noValidFlashcards'));
          }

          // Extract filename as deck title
          const deckTitle = file.name.replace(/\.(csv)$/i, '');

          resolve({
            deck: {
              title: deckTitle,
            },
            flashcards,
          });
        } catch (error: any) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error(t('import.fileReadError')));
      reader.readAsText(file);
    });
  };

  const parseJSON = async (file: File): Promise<ParsedData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = JSON.parse(text);

          // Validate structure
          if (!data.deck || !data.deck.title) {
            throw new Error(t('import.jsonInvalidStructure'));
          }

          if (!Array.isArray(data.flashcards) || data.flashcards.length === 0) {
            throw new Error(t('import.jsonNoFlashcards'));
          }

          // Validate flashcards
          const flashcards: ParsedFlashcard[] = [];
          data.flashcards.forEach((card: any, index: number) => {
            if (!card.front || !card.back) {
              throw new Error(t('import.jsonInvalidCard', { index: index + 1 }));
            }
            flashcards.push({
              front: card.front.trim(),
              back: card.back.trim(),
            });
          });

          resolve({
            deck: {
              title: data.deck.title,
              description: data.deck.description,
            },
            flashcards,
          });
        } catch (error: any) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error(t('import.fileReadError')));
      reader.readAsText(file);
    });
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.warning(t('import.selectFileWarning'));
      return;
    }

    setIsImporting(true);

    try {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      let parsedData: ParsedData;

      if (fileExtension === 'csv') {
        parsedData = await parseCSV(selectedFile);
      } else if (fileExtension === 'json') {
        parsedData = await parseJSON(selectedFile);
      } else {
        throw new Error(t('import.invalidFileType'));
      }

      // Create deck
      const newDeck = await flashcardService.createFlashcardDeck(
        parsedData.deck.title,
        workspaceId
      );
      console.log('Created deck:', newDeck);

      // Create flashcards
      let successCount = 0;
      for (const card of parsedData.flashcards) {
        try {
          console.log('Creating flashcard for deck:', newDeck.flashcardDeck._id);
          await flashcardService.createFlashcard({
            deck_id: newDeck.flashcardDeck._id,
            front: card.front,
            back: card.back,
          });
          successCount++;
        } catch (error) {
          console.error('Failed to create flashcard:', error);
        }
      }

      if (successCount === 0) {
        throw new Error(t('import.noCardsCreated'));
      }

      toast.success(
        t('import.success', {
          deck: parsedData.deck.title,
          count: successCount,
        })
      );

      if (onSuccess) {
        onSuccess();
      }

      onClose();
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || t('import.error'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleCancel}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('import.title')}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-lg transition-colors"
              disabled={isImporting}
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

          {/* File Upload Area */}
          <div className="mb-4">
            <input
              ref={fileInputRef}
              id="flashcard-file-input"
              type="file"
              accept=".csv,.json,application/json,text/csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="flashcard-file-input"
              className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                selectedFile
                  ? 'border-[#21b4ca] bg-[#21b4ca]/5'
                  : 'border-gray-300 hover:border-[#21b4ca] hover:bg-gray-50 dark:border-gray-600 dark:hover:border-[#21b4ca]'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="flex flex-col items-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`mb-3 ${selectedFile ? 'text-[#21b4ca]' : 'text-gray-400'}`}
                >
                  {selectedFile ? (
                    <path
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                      fill="currentColor"
                    />
                  ) : (
                    <path
                      d="M9 16V10H5L12 3L19 10H15V16H9ZM5 20V18H19V20H5Z"
                      fill="currentColor"
                    />
                  )}
                </svg>

                {selectedFile ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {(selectedFile.size / 1024).toFixed(2)} {t('import.kb')}
                    </p>
                    <p className="text-xs text-[#21b4ca]">
                      {t('import.changeFile')}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('import.selectFile')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('import.acceptedFormats')}
                    </p>
                  </div>
                )}
              </div>
            </label>
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
                  {t('import.noteTitle')}
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                  {t('import.note1')}<br />
                  {t('import.note2')}<br />
                  {t('import.note3')}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isImporting}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {t('import.cancel')}
            </button>
            <button
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              className="flex-1 px-4 py-2.5 bg-[#21b4ca] text-white rounded-lg hover:bg-[#1a9db0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {isImporting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('import.importing')}
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 16V10H5L12 3L19 10H15V16H9ZM5 20V18H19V20H5Z"
                      fill="currentColor"
                    />
                  </svg>
                  {t('import.import')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportFlashcardModal;
