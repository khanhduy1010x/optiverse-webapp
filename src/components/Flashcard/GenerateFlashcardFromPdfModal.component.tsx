import React, { useState, useRef } from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { toast } from 'react-toastify';
import flashcardService from '../../services/flashcard.service';

interface GenerateFlashcardFromPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
  onSuccess?: () => void;
}

const GenerateFlashcardFromPdfModal: React.FC<GenerateFlashcardFromPdfModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}) => {
  const { t } = useAppTranslate('flashcard');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deckTitle, setDeckTitle] = useState('');
  const [description, setDescription] = useState('');
  const [numFlashcards, setNumFlashcards] = useState(10);
  const [format, setFormat] = useState<'qa' | 'vocabulary' | 'true_false' | 'fill_blank'>('qa');

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
    if (file.type !== 'application/pdf') {
      toast.error(t('pdf.invalidFileType'));
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error(t('pdf.fileTooLarge'));
      return;
    }

    setSelectedFile(file);
    // Auto-fill deck title from filename if not already set
    if (!deckTitle) {
      setDeckTitle(file.name.replace(/\.pdf$/i, ''));
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast.warning(t('pdf.selectFileWarning'));
      return;
    }

    if (!deckTitle.trim()) {
      toast.warning(t('pdf.deckTitleWarning'));
      return;
    }

    if (numFlashcards < 1 || numFlashcards > 100) {
      toast.warning(t('pdf.invalidNumFlashcards'));
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('deckTitle', deckTitle);
      formData.append('description', description);
      formData.append('numFlashcards', numFlashcards.toString());
      formData.append('format', format);
      if (workspaceId) {
        formData.append('workspace_id', workspaceId);
      }

      const result = await flashcardService.generateFlashcardsFromPdf(formData);

      toast.success(
        t('pdf.success', {
          deck: deckTitle,
          count: result.flashcardsCreated,
        })
      );

      if (onSuccess) {
        onSuccess();
      }

      handleCancel();
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast.error(error.message || t('pdf.error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setDeckTitle('');
    setDescription('');
    setNumFlashcards(10);
    setFormat('qa');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleCancel}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('pdf.title')}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-lg transition-colors"
              disabled={isGenerating}
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
              id="pdf-file-input"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="pdf-file-input"
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
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
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
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} {t('pdf.mb')}
                    </p>
                    <p className="text-xs text-[#21b4ca]">{t('pdf.changeFile')}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('pdf.selectFile')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('pdf.acceptedFormats')}
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 mb-4">
            {/* Deck Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('pdf.deckTitle')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                placeholder={t('pdf.deckTitlePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#21b4ca]"
                disabled={isGenerating}
              />
            </div>

            {/* Description */}
            {/* 
              <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('pdf.description')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('pdf.descriptionPlaceholder')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#21b4ca]"
                disabled={isGenerating}
              />
              
            */}

            {/* Number of Flashcards */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('pdf.numFlashcards')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={numFlashcards}
                  onChange={(e) => setNumFlashcards(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#21b4ca]"
                  disabled={isGenerating}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  (1-100)
                </span>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('pdf.format')}
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'qa' | 'vocabulary' | 'true_false' | 'fill_blank')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#21b4ca]"
                disabled={isGenerating}
              >
                <option value="qa">{t('pdf.formatQa')}</option>
                <option value="vocabulary">{t('pdf.formatVocabulary')}</option>
                <option value="true_false">{t('pdf.formatTrueFalse')}</option>
                <option value="fill_blank">{t('pdf.formatFillBlank')}</option>
              </select>
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
                  {t('pdf.noteTitle')}
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                  {t('pdf.note1')}<br />
                  {t('pdf.note2')}<br />
                  {t('pdf.note3')}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isGenerating}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {t('pdf.cancel')}
            </button>
            <button
              onClick={handleGenerate}
              disabled={!selectedFile || !deckTitle.trim() || isGenerating}
              className="flex-1 px-4 py-2.5 bg-[#21b4ca] text-white rounded-lg hover:bg-[#1a9db0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t('pdf.generating')}
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                      fill="currentColor"
                    />
                  </svg>
                  {t('pdf.generate')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateFlashcardFromPdfModal;
