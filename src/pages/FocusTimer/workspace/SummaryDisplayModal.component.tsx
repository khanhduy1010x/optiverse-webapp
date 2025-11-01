import React from 'react';
import './SummaryDisplayModal.css';
import { useAppTranslate } from '../../../hooks/useAppTranslate';

interface SummaryDisplayModalProps {
    isOpen: boolean;
    onClose: () => void;
    summaryHtml: string;
    recordingTitle?: string;
    summaryType?: string;
}

const SummaryDisplayModal: React.FC<SummaryDisplayModalProps> = ({
    isOpen,
    onClose,
    summaryHtml,
    recordingTitle = 'Recording',
    summaryType = 'Summary'
}) => {
    const { t } = useAppTranslate('focus-room');
    if (!isOpen) return null;

    const handleCopyToClipboard = async () => {
        try {
            // Convert HTML to plain text for clipboard
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = summaryHtml;
            const plainText = tempDiv.textContent || tempDiv.innerText || '';
            await navigator.clipboard.writeText(plainText);

            // Show success feedback
            const button = document.getElementById('copy-summary-btn');
            if (button) {
                const originalText = button.textContent;
                button.textContent = t('notes.copied');
                button.classList.add('bg-green-600');
                setTimeout(() => {
                    button.textContent = originalText;
                    button.classList.remove('bg-green-600');
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };


    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1001]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[1002] flex items-center justify-center p-4">
                <div
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-black dark:text-white">{summaryType}</h2>
                                <p className="text-sm text-neutral-600 dark:text-neutral-300">{recordingTitle}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                id="copy-summary-btn"
                                onClick={handleCopyToClipboard}
                                className="px-3 py-1.5 text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                            >
                                {t('notes.copyText')}
                            </button>
                            {/* <button
                                onClick={handleDownloadAsHtml}
                                className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                Download HTML
                            </button> */}
                            <button
                                onClick={onClose}
                                className="p-2 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-auto">
                        <div className="p-6">
                            {/* Summary Content */}
                            <div
                                className="summary-content max-w-none"
                                dangerouslySetInnerHTML={{ __html: summaryHtml }}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-neutral-200 dark:border-neutral-800 px-6 py-4 bg-neutral-50 dark:bg-neutral-900/50">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {t('notes.generatedOn')} {new Date().toLocaleString()}
                            </p>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                                {t('notes.close')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SummaryDisplayModal;