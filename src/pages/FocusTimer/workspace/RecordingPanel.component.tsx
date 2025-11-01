import React from 'react';
import Icon from '../../../components/common/Icon/Icon.component';
import recordingService, { RecordingRecord } from '../../../services/recording.service';
import SummarizeModal from './SummarizeModal.component';
import SummaryDisplayModal from './SummaryDisplayModal.component';
import SimpleAudioPlayer from './SimpleAudioPlayer.component';
import { useRecordingPanel } from './hooks/useRecordingPanel';
import { useAppTranslate } from '../../../hooks/useAppTranslate';

interface RecordingPanelProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    roomName: string;
    roomId: string;
    isAdmin?: boolean;
    isManager?: boolean;
    width?: number; // percentage
    isResizing?: boolean;
}

const RecordingPanel: React.FC<RecordingPanelProps> = ({
    isOpen,
    onOpenChange,
    roomName,
    roomId,
    isAdmin = false,
    isManager = false,
    width = 45,
    isResizing = false
}) => {
    const {
        isRecording,
        isLoading,
        recordings,
        currentPlayingId,
        isPlaying,
        currentAudioUrl,
        showSummarizeModal,
        selectedRecordingForSummarize,
        isSummarizing,
        showSummaryDisplay,
        summaryResult,
        editingTitleId,
        editingTitle,
        isSavingTitle,
        rootRef,
        handleStartRecording,
        handleStopRecording,
        fetchRecordings,
        handleDownload,
        handlePlay,
        handleDelete,
        handleStartEditTitle,
        handleCancelEditTitle,
        handleSaveTitle,
        handleSummarize,
        handleConfirmSummarize,
        setIsPlaying,
        setCurrentPlayingId,
        setCurrentAudioUrl,
        setShowSummarizeModal,
        setSelectedRecordingForSummarize,
        setShowSummaryDisplay,
        setSummaryResult,
        setEditingTitle,
        formatShortDuration,
        parseHmsStringToMs
    } = useRecordingPanel({
        isOpen,
        onOpenChange,
        roomName,
        roomId
    });

    const { t } = useAppTranslate('focus-room');

    if (!isOpen) return null;
    if (!isAdmin && !isManager) return null;

    return (
        <div
            className={`${isOpen
                ? 'flex flex-col rounded-xl overflow-hidden max-h-[calc(100%-1rem)] '
                : 'fixed bottom-36 left-4 w-12 h-12 rounded-full shadow-lg'
                }`}
            style={{
                backgroundColor: '#272727',
                width: isOpen ? `${width}%` : 'auto',
                height: isOpen ? '100%' : 'auto',
                borderRadius: isOpen ? '8px' : '50%',
                margin: isOpen ? '8px 8px 8px 0' : '0',
                marginBottom: isOpen ? '2rem' : '0',
                zIndex: 1001,
                transition: isResizing ? 'none' : 'all 0.2s ease-out'
            }}
        >

            <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b backdrop-blur-xl" style={{
                    borderColor: '#404040',
                    background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                }}>
                    <div>
                        <h3 className="text-base font-semibold text-white tracking-tight">{t('recording.title')}</h3>
                        <p className="text-xs text-gray-500 mt-1">{t('recording.subtitle')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchRecordings()}
                            className="text-xs flex text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
                            title={t('recording.refresh')}
                            disabled={isLoading}
                        >
                            {t('recording.refresh')}
                        </button>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-2 rounded-lg hover:bg-white/5 transition-all duration-200 text-gray-400 hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Recording Controls */}
                    <div className="px-6 py-4 border-b" style={{ borderColor: '#404040' }}>
                        <h4 className="text-sm font-semibold text-gray-300 mb-3">{t('recording.controls')}</h4>
                        <div className="flex gap-1.5">
                            {!isRecording ? (
                                <button
                                    onClick={handleStartRecording}
                                    disabled={isLoading}
                                    className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 hover:opacity-90 disabled:opacity-50 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm"
                                    style={{ backgroundColor: '#EF5350' }}
                                >
                                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                    <span className="hidden sm:inline">{isLoading ? t('recording.starting') : t('recording.startRecording')}</span>
                                    <span className="sm:hidden">{isLoading ? t('recording.start') : t('recording.recShort')}</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleStopRecording}
                                    disabled={isLoading}
                                    className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 hover:opacity-90 disabled:opacity-50 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm"
                                    style={{ backgroundColor: '#555' }}
                                >
                                    <span className="w-2 h-2 bg-white rounded-sm"></span>
                                    <span className="hidden sm:inline">{isLoading ? t('recording.stopping') : t('recording.stopRecording')}</span>
                                    <span className="sm:hidden">{isLoading ? t('recording.stop') : t('recording.stopShort')}</span>
                                </button>
                            )}
                        </div>
                        {isRecording && (
                            <p className="text-xs font-medium mt-1 animate-pulse flex items-center gap-1" style={{ color: '#EF5350' }}>
                                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#EF5350' }}></div>
                                <span className="hidden sm:inline">{t('recording.inProgress')}</span>
                                <span className="sm:hidden">{t('recording.inProgressShort')}</span>
                            </p>
                        )}
                    </div>

                    {/* Recordings List */}
                    <div className="px-6 py-4">
                        <h4 className="text-sm font-semibold text-gray-300 mb-3">{t('recording.list')}</h4>

                        {recordings.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Icon name="record" size={48} className="mx-auto mb-4 opacity-20" />
                                <p>{t('recording.noRecordings')}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recordings.map((recording) => {
                                    const started = recording.started_at ? new Date(recording.started_at) : null;
                                    const ended = recording.ended_at ? new Date(recording.ended_at) : null;
                                    const startTime = started ? started.toTimeString().split(' ')[0] : '';
                                    const endTimeRaw = ended ? ended.toTimeString().split(' ')[0] : '';
                                    const endTime = endTimeRaw ? endTimeRaw.split(':')[0] + 'h' : '';
                                    const dateStr = started ? started.toLocaleDateString('vi-VN') : '';
                                    const total =
                                        (recording.durationMs != null && recording.durationMs >= 0)
                                            ? formatShortDuration(recording.durationMs)
                                            : (recording.duration ? formatShortDuration(parseHmsStringToMs(recording.duration)) : '');
                                    const displayTitle = recording.title || t('recording.untitled'); return (
                                        <div
                                            key={recording._id}
                                            className="flex flex-col p-3 sm:p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg"
                                            style={{
                                                background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                                                borderColor: '#404040',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                                            }}
                                        >
                                            <div className="flex relative items-start sm:items-center justify-between gap-1.5 sm:gap-0 flex-col sm:flex-row">
                                                <div className="flex items-center gap-1.5 flex-1 min-w-0 w-full sm:w-auto">
                                                    <div className="w-8 sm:w-10 h-5.5 sm:h-6.5 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        <img src={'/record_bg.png'} alt={displayTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1 flex-wrap">
                                                            {editingTitleId === recording._id ? (
                                                                <div className="flex items-center gap-0.5 sm:gap-1 flex-1 w-full sm:w-auto">
                                                                    <input
                                                                        type="text"
                                                                        value={editingTitle}
                                                                        onChange={(e) => setEditingTitle(e.target.value)}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                handleSaveTitle(recording._id);
                                                                            } else if (e.key === 'Escape') {
                                                                                handleCancelEditTitle();
                                                                            }
                                                                        }}
                                                                        className="flex-1 px-1.5 py-0.5 text-xs sm:text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        autoFocus
                                                                        disabled={isSavingTitle}
                                                                    />
                                                                    <button
                                                                        onClick={() => handleSaveTitle(recording._id)}
                                                                        disabled={isSavingTitle || !editingTitle.trim()}
                                                                        className="px-1.5 py-0.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded transition-colors flex-shrink-0"
                                                                        title={t('recording.save')}
                                                                    >
                                                                        {isSavingTitle ? '...' : '✓'}
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancelEditTitle}
                                                                        disabled={isSavingTitle}
                                                                        className="px-1.5 py-0.5 text-xs bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded transition-colors flex-shrink-0"
                                                                        title={t('recording.cancel')}
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <p
                                                                    className="text-xs sm:text-sm font-semibold text-white truncate cursor-pointer hover:text-blue-300 transition-colors"
                                                                    onClick={() => handleStartEditTitle(recording)}
                                                                    title={t('recording.clickToEdit')}
                                                                >
                                                                    {displayTitle}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className='flex flex-col gap-1 sm:gap-1.5 mt-1'>
                                                            <div className="text-xs text-gray-300">
                                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                                    <span className="px-2 py-1 rounded-md bg-white/5 font-medium">
                                                                        {total || '0s'}
                                                                    </span>

                                                                    <span className="font-bold">
                                                                        {dateStr}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                {recording.isSummarized && (
                                                                    <div className="inline-block px-2 py-0.5 rounded-full border border-emerald-500/50 text-xs font-medium bg-emerald-500/10 text-emerald-400">
                                                                        ✓ {t('recording.summarized')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 ml-0 sm:ml-2 w-full sm:w-auto justify-end">
                                                    <button
                                                        onClick={async () => {
                                                            if (currentPlayingId === recording._id) {
                                                                // Close player
                                                                setCurrentPlayingId(null);
                                                                setCurrentAudioUrl(null);
                                                                setIsPlaying(false);
                                                            } else {
                                                                // Open player and fetch URL
                                                                try {
                                                                    const url = await recordingService.getSignedUrl(recording._id, 'stream');
                                                                    setCurrentPlayingId(recording._id);
                                                                    setCurrentAudioUrl(url);
                                                                } catch (err: any) {
                                                                    console.error('Error:', err);
                                                                }
                                                            }
                                                        }}
                                                        className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full transition-all duration-300 ${currentPlayingId === recording._id ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                                        title={currentPlayingId === recording._id ? t('recording.hidePlayer') : t('recording.showPlayer')}
                                                    >
                                                        {currentPlayingId === recording._id ? (
                                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path d="M16.6582 9.28638C18.098 10.1862 18.8178 10.6361 19.0647 11.2122C19.2803 11.7152 19.2803 12.2847 19.0647 12.7878C18.8178 13.3638 18.098 13.8137 16.6582 14.7136L9.896 18.94C8.29805 19.9387 7.49907 20.4381 6.83973 20.385C6.26501 20.3388 5.73818 20.0469 5.3944 19.584C5 19.053 5 18.1108 5 16.2264V7.77357C5 5.88919 5 4.94701 5.3944 4.41598C5.73818 3.9531 6.26501 3.66111 6.83973 3.6149C7.49907 3.5619 8.29805 4.06126 9.896 5.05998L16.6582 9.28638Z" stroke="white" stroke-width="2" stroke-linejoin="round" />
                                                            </svg>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => handleDownload(recording)}
                                                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                                                        title={t('recording.download')}
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() => handleSummarize(recording)}
                                                        className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-white/10 ${recording.isSummarized
                                                            ? 'text-emerald-400'
                                                            : 'text-gray-400 hover:text-blue-400'
                                                            }`}
                                                        title={recording.isSummarized ? t('recording.viewSummary') : t('recording.summarize')}
                                                    >
                                                        {recording.isSummarized ? (
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(recording._id)}
                                                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-gray-400 hover:text-red-400 rounded-full transition-all duration-300 hover:bg-white/10"
                                                        title={t('recording.delete')}
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Simple Audio Player - Full Width */}
                                            {currentPlayingId === recording._id && currentAudioUrl && (
                                                <div className="w-full mt-2 pt-2 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                                    <SimpleAudioPlayer
                                                        audioUrl={currentAudioUrl}
                                                        isPlaying={isPlaying}
                                                        onPlayStateChange={(playing: boolean) => setIsPlaying(playing)}
                                                        containerHeight="60px"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Summarize Modal */}
                <SummarizeModal
                    isOpen={showSummarizeModal}
                    onClose={() => {
                        setShowSummarizeModal(false);
                        setSelectedRecordingForSummarize(null);
                    }}
                    onConfirm={handleConfirmSummarize}
                    recordingTitle={selectedRecordingForSummarize?.title || t('recording.untitled')}
                    isLoading={isSummarizing}
                />

                {/* Summary Display Modal */}
                <SummaryDisplayModal
                    isOpen={showSummaryDisplay}
                    onClose={() => {
                        setShowSummaryDisplay(false);
                        setSummaryResult(null);
                    }}
                    summaryHtml={summaryResult?.html || ''}
                    summaryType={summaryResult?.type || 'Summary'}
                    recordingTitle={summaryResult?.recordingTitle || 'Recording'}
                />
            </>

        </div>
    );
};

export default RecordingPanel;
