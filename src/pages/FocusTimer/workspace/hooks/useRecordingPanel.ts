import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import recordingService, {
  RecordingRecord,
} from '../../../../services/recording.service';
import { SummaryOption } from '../SummarizeModal.component';
import { useAppTranslate } from '../../../../hooks/useAppTranslate';

export interface UseRecordingPanelParams {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roomName: string;
  roomId: string;
}

export interface UseRecordingPanelReturn {
  // Recording states
  isRecording: boolean;
  isLoading: boolean;
  recordings: RecordingRecord[];

  // Playback states
  currentPlayingId: string | null;
  isPlaying: boolean;
  currentAudioUrl: string | null;

  // Summarize states
  showSummarizeModal: boolean;
  selectedRecordingForSummarize: RecordingRecord | null;
  isSummarizing: boolean;
  showSummaryDisplay: boolean;
  summaryResult: {
    html: string;
    type: string;
    recordingTitle: string;
  } | null;

  // Title editing states
  editingTitleId: string | null;
  editingTitle: string;
  isSavingTitle: boolean;

  // Refs
  rootRef: React.RefObject<HTMLDivElement | null>;

  // Handlers
  handleStartRecording: () => Promise<void>;
  handleStopRecording: () => Promise<void>;
  fetchRecordings: () => Promise<void>;
  handleDownload: (recording: RecordingRecord) => Promise<void>;
  handlePlay: (recording: RecordingRecord) => Promise<void>;
  handleDelete: (recordingId: string) => void;
  handleStartEditTitle: (recording: RecordingRecord) => void;
  handleCancelEditTitle: () => void;
  handleSaveTitle: (recordingId: string) => Promise<void>;
  handleSummarize: (recording: RecordingRecord) => Promise<void>;
  handleConfirmSummarize: (
    option: SummaryOption,
    purpose: string
  ) => Promise<void>;
  setIsPlaying: (playing: boolean) => void;
  setCurrentPlayingId: (id: string | null) => void;
  setCurrentAudioUrl: (url: string | null) => void;
  setShowSummarizeModal: (show: boolean) => void;
  setSelectedRecordingForSummarize: (recording: RecordingRecord | null) => void;
  setShowSummaryDisplay: (show: boolean) => void;
  setSummaryResult: (result: any) => void;
  setEditingTitle: (title: string) => void;

  // Utilities
  formatShortDuration: (ms?: number | null) => string;
  parseHmsStringToMs: (hms?: string | null) => number | null;
}

export const useRecordingPanel = ({
  isOpen,
  onOpenChange,
  roomName,
  roomId,
}: UseRecordingPanelParams): UseRecordingPanelReturn => {
  const { t } = useAppTranslate('focus-room');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordings, setRecordings] = useState<RecordingRecord[]>([]);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [showSummarizeModal, setShowSummarizeModal] = useState(false);
  const [selectedRecordingForSummarize, setSelectedRecordingForSummarize] =
    useState<RecordingRecord | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummaryDisplay, setShowSummaryDisplay] = useState(false);
  const [summaryResult, setSummaryResult] = useState<{
    html: string;
    type: string;
    recordingTitle: string;
  } | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const handleStartRecording = async () => {
    try {
      setIsLoading(true);
      await recordingService.startRecording(roomId);
      setIsRecording(true);
      toast.success(t('recording.startSuccess'));
      console.log('🔴 Recording started for room:', roomName);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error('❌ Failed to start recording:', error);
      toast.error(errorMsg || t('recording.startFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsLoading(true);
      await recordingService.stopRecording(roomId);
      setIsRecording(false);
      toast.success(t('recording.stopSuccess'));
      console.log('⏹️ Recording stopped');

      // Fetch updated recordings
      await fetchRecordings();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error('❌ Failed to stop recording:', error);
      toast.error(errorMsg || t('recording.stopFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecordings = async () => {
    try {
      setIsLoading(true);
      const data = await recordingService.getRecordsByRoom(roomId);
      console.log('📋 Recording records:', data);
      setRecordings(
        (data || []).map((r: RecordingRecord) => ({
          ...r,
        }))
      );
    } catch (error) {
      console.error('❌ Failed to fetch recordings:', error);
      toast.error(t('recording.failedToFetch'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (recording: RecordingRecord) => {
    if (!recording) return;
    setIsLoading(true);
    try {
      const url = await recordingService.getSignedUrl(
        recording._id,
        'download'
      );
      if (!url) {
        toast.warning(t('recording.noDownloadUrl'));
        return;
      }

      // try to fetch the file as a blob and download via an object URL to avoid navigating away
      try {
        const resp = await fetch(url, { method: 'GET' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const blob = await resp.blob();

        // derive filename from gcp_url or URL
        let filename = recording.gcp_url || recording._id || 'recording';
        try {
          const parts = (recording.gcp_url || url).split('/');
          if (parts.length) filename = parts[parts.length - 1] || filename;
        } catch (e) {
          // ignore
        }

        const objectUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = decodeURIComponent(filename);
        document.body.appendChild(a);
        a.click();
        a.remove();
        // revoke after short delay
        setTimeout(() => window.URL.revokeObjectURL(objectUrl), 5000);
        toast.success(t('recording.downloadStarted'));
        return;
      } catch (err) {
        console.warn(
          '⚠️ Fetch-download failed, falling back to opening signed URL:',
          err
        );
        // fallback: open signed url in new tab (may navigate)
        window.open(url, '_blank');
        toast.success(t('recording.downloadStarted'));
        return;
      }
    } catch (err) {
      console.error('❌ Download error:', err);
      toast.error(t('recording.downloadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = async (recording: RecordingRecord) => {
    if (!recording) return;

    // toggle pause if same
    if (currentPlayingId === recording._id && isPlaying) {
      setIsPlaying(false);
      setCurrentPlayingId(null);
      setCurrentAudioUrl(null);
      return;
    }

    try {
      setIsLoading(true);
      const url = await recordingService.getSignedUrl(recording._id, 'stream');
      console.log('🎵 Stream URL obtained:', url.substring(0, 80) + '...');
      // create or reuse audio element
      setCurrentPlayingId(recording._id);
      setCurrentAudioUrl(url);
      setIsPlaying(true);
    } catch (err: any) {
      console.error('❌ Playback setup error:', err);
      toast.error(
        t('recording.playbackFailed') + ': ' + (err as Error).message
      );
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (recordingId: string) => {
    setRecordings(prev => prev.filter(r => r._id !== recordingId));
    toast.success('Recording deleted');
  };

  const handleStartEditTitle = (recording: RecordingRecord) => {
    setEditingTitleId(recording._id);
    setEditingTitle(recording.title || 'Untitled recording');
  };

  const handleCancelEditTitle = () => {
    setEditingTitleId(null);
    setEditingTitle('');
  };

  const handleSaveTitle = async (recordingId: string) => {
    if (!editingTitle.trim()) {
      toast.error(t('recording.titleCannotBeEmpty'));
      return;
    }

    setIsSavingTitle(true);
    try {
      const result = await recordingService.updateRecordingTitle(
        recordingId,
        editingTitle.trim()
      );

      // Update the local state
      setRecordings(prev =>
        prev.map(r =>
          r._id === recordingId ? { ...r, title: result.title } : r
        )
      );

      setEditingTitleId(null);
      setEditingTitle('');
      toast.success(t('recording.titleUpdated'));
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        t('recording.titleUpdateFailed');
      toast.error(errorMsg);
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleSummarize = async (recording: RecordingRecord) => {
    if (!recording) return;

    // If already summarized, show the existing summary directly
    if (recording.isSummarized && recording.summarizedContent) {
      const recordingTitle = recording.title || 'Untitled recording';

      setSummaryResult({
        html: recording.summarizedContent,
        type: 'Existing Summary',
        recordingTitle,
      });
      setShowSummaryDisplay(true);
      return;
    }

    // Otherwise, show the summarize modal to create a new summary
    setSelectedRecordingForSummarize(recording);
    setShowSummarizeModal(true);
  };

  const handleConfirmSummarize = async (
    option: SummaryOption,
    purpose: string
  ) => {
    if (!selectedRecordingForSummarize) return;

    setIsSummarizing(true);
    try {
      toast.info(t('recording.generatingSummary'));

      // Map SummaryOption to number (1-4)
      const typeMapping: Record<SummaryOption, number> = {
        standard: 1,
        executive: 2,
        discussion: 3,
        action: 4,
      };

      const summaryType = typeMapping[option] || 1;

      const summaryHtml = await recordingService.summarizeRecording(
        selectedRecordingForSummarize._id,
        summaryType,
        purpose
      );

      if (!summaryHtml || summaryHtml.trim() === '') {
        toast.warning(t('recording.noSummaryGenerated'));
        return;
      }

      // Close the summarize modal
      setShowSummarizeModal(false);
      setSelectedRecordingForSummarize(null);

      // Set up summary result and show display modal
      const typeTitles: Record<SummaryOption, string> = {
        standard: t('recording.standardSummary'),
        executive: t('recording.executiveBrief'),
        discussion: t('recording.discussionDigest'),
        action: t('recording.actionOrientedSummary'),
      };

      const recordingTitle =
        selectedRecordingForSummarize.title || t('recording.untitled');

      setSummaryResult({
        html: summaryHtml,
        type: typeTitles[option],
        recordingTitle,
      });
      setShowSummaryDisplay(true);

      toast.success(t('recording.summaryCompleted'));

      // Refresh recordings list to update the isSummarized status
      await fetchRecordings();
    } catch (err: any) {
      console.error('❌ Summarize error:', err);
      let errorMsg = t('recording.summaryFailed');

      if (err.response?.status === 429) {
        errorMsg = t('recording.tooManyRequests');
      } else if (err.response?.status === 403) {
        errorMsg = t('recording.noPermission');
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }

      toast.error(errorMsg);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onOpenChange]);

  // Initial fetch when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchRecordings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, roomId]);

  const formatShortDuration = (ms?: number | null) => {
    if (ms == null) return '';
    const totalSeconds = Math.floor(ms / 1000);
    if (totalSeconds <= 0) return '0s';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    let out = '';
    if (h > 0) out += `${h}h`;
    if (m > 0) out += `${m}m`;
    if (s > 0) out += `${s}s`;
    return out || '0s';
  };

  const parseHmsStringToMs = (hms?: string | null) => {
    if (!hms) return null;
    // expect formats like HH:MM:SS or H:MM:SS
    const parts = hms.split(':').map(p => Number(p));
    if (parts.some(n => Number.isNaN(n))) return null;
    let seconds = 0;
    if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
      seconds = parts[0];
    } else {
      return null;
    }
    return seconds * 1000;
  };

  return {
    // States
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

    // Handlers
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

    // Utilities
    formatShortDuration,
    parseHmsStringToMs,
  };
};
