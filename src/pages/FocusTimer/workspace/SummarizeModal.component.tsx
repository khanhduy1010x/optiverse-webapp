import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Icon from '../../../components/common/Icon/Icon.component';
import { useAppTranslate } from '../../../hooks/useAppTranslate';

export type SummaryOption = 'standard' | 'executive' | 'discussion' | 'action';

interface SummarizeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (option: SummaryOption, purpose: string) => Promise<void>;
    recordingTitle?: string;
    isLoading?: boolean;
}

interface SummaryOptionConfig {
    id: SummaryOption;
    title: string;
    description: string;
    prompt: string;
}

const summaryOptions: SummaryOptionConfig[] = [
    {
        id: 'standard',
        title: 'Standard Summary (Default)',
        description: 'Neutral summary with full objectives, content, decisions, and action items.',
        prompt: 'Summarize clearly by sections (Objectives, Key Points, Decisions, Action Items).'
    },
    {
        id: 'executive',
        title: 'Executive Brief',
        description: 'Very concise, focused on insights and management-level decisions.',
        prompt: 'Summarize in 5 bullets focusing on key takeaways and decisions.'
    },
    {
        id: 'discussion',
        title: 'Discussion Digest',
        description: 'Organized by speaker, covering what was discussed and conclusions.',
        prompt: 'Summarize by speaker and main discussion flow.'
    },
    {
        id: 'action',
        title: 'Action-Oriented',
        description: '100% focused on tasks needed, responsible persons, and deadlines.',
        prompt: 'List all tasks and responsible persons with deadlines.'
    }
];

const SummarizeModal: React.FC<SummarizeModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    recordingTitle = 'Recording',
    isLoading = false
}) => {
    const { t } = useAppTranslate('focus-room');
    const [selectedOption, setSelectedOption] = useState<SummaryOption>('standard');
    const [purpose, setPurpose] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (isSubmitting || isLoading) return;

        try {
            setIsSubmitting(true);
            await onConfirm(selectedOption, purpose);
            handleClose();
        } catch (error) {
            console.error('Error during summarization:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting && !isLoading) {
            setPurpose('');
            setSelectedOption('standard');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-white/10 backdrop-blur-xl z-[1001]"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[1002] flex items-center justify-center p-4 md:p-8">
                <div
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                        <div className="flex items-center gap-3">

                            <div>
                                <h2 className="text-lg font-semibold text-black dark:text-white">{t('notes.summarizeRecording')}</h2>
                                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">{recordingTitle}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting || isLoading}
                            className="p-2 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 rounded-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-auto p-5 md:p-6 space-y-5 md:space-y-6">
                        {/* Summary Options */}
                        <div>
                            <h3 className="text-xs font-semibold text-black dark:text-white mb-3 uppercase tracking-widest">
                                {t('notes.summaryType')}
                            </h3>
                            <div className="grid grid-cols-2 gap-2 md:gap-3">
                                {summaryOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSelectedOption(option.id)}
                                        disabled={isSubmitting || isLoading}
                                        className={`w-full h-full text-left p-3 md:p-4 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${selectedOption === option.id
                                            ? 'bg-neutral-100 dark:bg-neutral-800 border border-neutral-900 dark:border-neutral-200 text-black dark:text-white'
                                            : 'bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-black dark:text-white'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm md:text-[0.95rem] leading-tight">
                                                    {option.title}
                                                </h4>
                                                <p className="text-xs md:text-[0.8rem] mt-1.5 text-neutral-600 dark:text-neutral-300 leading-snug">
                                                    {option.description}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Purpose Input */}
                        <div>
                            <label className="text-xs font-semibold text-black dark:text-white mb-2 block uppercase tracking-widest">
                                {t('notes.meetingPurpose')} <span className="font-normal text-neutral-700 dark:text-neutral-300">({t('notes.optional')})</span>
                            </label>
                            <textarea
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                placeholder={t('notes.purposePlaceholder')}
                                disabled={isSubmitting || isLoading}
                                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white placeholder-neutral-500 dark:placeholder-neutral-500 focus:border-neutral-900 dark:focus:border-neutral-200 focus:ring-0 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm"
                                rows={3}
                            />
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2">
                                {t('notes.contextHelps')}
                            </p>
                        </div>

                        {/* Tip Box */}
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                            <div className="flex gap-3">
                                <div className="text-sm flex-shrink-0">✨</div>
                                <div>
                                    <p className="text-xs font-semibold text-black dark:text-white">
                                        {t('notes.proTip')}
                                    </p>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-snug">
                                        {t('notes.proTipText')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-2.5 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting || isLoading}
                            className="flex-1 px-4 py-2.5 rounded-lg font-medium text-black dark:text-white bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {t('notes.cancel')}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isSubmitting || isLoading}
                            className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            {isSubmitting || isLoading ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    <span>{t('notes.generating')}</span>
                                </>
                            ) : (
                                <>
                                    <span>{t('notes.generate')}</span>

                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SummarizeModal;
