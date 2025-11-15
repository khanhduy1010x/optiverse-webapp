import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportWithPost, ReportStatus, REPORT_REASON_LABELS } from '../../types/blog/report.types';
import { ReportService } from '../../services/blog';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const BlogReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAppTranslate('blog');
  const [reports, setReports] = useState<ReportWithPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<ReportStatus | 'all'>('all');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const reportsData = await ReportService.getAllReports();
        setReports(reportsData);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setError(t('errorLoadingReports'));
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await ReportService.getAllReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
      setError(t('errorOccurredLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, status: ReportStatus) => {
    try {
      await ReportService.updateReportStatus(reportId, status);
      // Cập nhật local state
      setReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, status, updatedAt: new Date().toISOString() }
            : report
        )
      );
    } catch (error) {
      console.error('Error updating report status:', error);
      setError(t('errorUpdatingStatus'));
    }
  };

  const handlePostClick = (postId: string) => {
    navigate(`/blog/post/${postId}`);
  };

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(report => report.status === filter);

  const formatDate = (date: string | number) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
    } catch (error) {
      return t('statusUnknown');
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case ReportStatus.REVIEWED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case ReportStatus.RESOLVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case ReportStatus.DISMISSED:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return t('statusPending');
      case ReportStatus.REVIEWED:
        return t('statusReviewed');
      case ReportStatus.RESOLVED:
        return t('statusResolved');
      case ReportStatus.DISMISSED:
        return t('statusDismissed');
      default:
        return t('statusUnknown');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gradient-to-r from-red-200 to-orange-200 rounded-2xl w-1/3 mb-8"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-white/80 rounded-2xl shadow-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-red-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title Section */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => navigate('/blog')}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  title="Back to Blog"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.082 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  {t('reportedPostsTitle')}
                </h1>
              </div>
              <p className="text-sm text-gray-600 ml-14">
                {t('reportedPostsDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats & Filters Bar */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <p className="text-gray-700 font-medium">
              {filteredReports.length > 0 ? (
                <>
                  {t('showingReports')} <span className="font-bold text-red-600">{filteredReports.length}</span> {filteredReports.length === 1 ? t('report_label') : t('reports_label')}
                  {filter !== 'all' && <span className="text-gray-500"> ({t('filtered')})</span>}
                </>
              ) : (
                t('noReports')
              )}
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-300 hover:bg-red-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {t('all')} ({reports.length})
              </span>
            </button>
            {Object.values(ReportStatus).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm ${
                  filter === status
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                {getStatusLabel(status)} ({reports.filter(r => r.status === status).length})
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl shadow-md">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('noReports')}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {filter === 'all' ? t('noReportsYet') : `${t('noReportsWithStatus')} "${getStatusLabel(filter as ReportStatus)}".`}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="px-8 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                }}
              >
                {t('viewAllReports')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl shadow-lg border border-red-100 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      {/* Post Info Card */}
                      <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1">
                            <button
                              onClick={() => report.post && handlePostClick(report.post.id)}
                              className="text-lg font-bold text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline text-left mb-2 line-clamp-2"
                            >
                              {report.post?.title || t('postNotExist')}
                            </button>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {t('authorLabel')}: <span className="font-medium">{report.post?.author?.displayName || report.post?.author?.name || report.post?.authorName || t('unknownAuthor')}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Report Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Reporter */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('reporter')}</p>
                          </div>
                          <p className="text-sm text-gray-900 font-semibold truncate">
                            {(() => {
                            // Ưu tiên thông tin từ reporter object
                            if (report.reporter?.displayName) {
                              return report.reporter.displayName;
                            }
                            if (report.reporter?.name) {
                              return report.reporter.name;
                            }
                            // Fallback về reporterName nếu có và không phải 'Anonymous'
                            if (report.reporterName && report.reporterName.trim() !== '' && report.reporterName !== 'Anonymous') {
                              return report.reporterName;
                            }
                            // Fallback về email username nếu có
                            if (report.reporterEmail && report.reporterEmail.includes('@')) {
                              return report.reporterEmail.split('@')[0];
                            }
                            // Cuối cùng dùng 6 ký tự cuối của reporterId
                            if (report.reporterId) {
                              return `User ${report.reporterId.slice(-6)}`;
                            }
                            return t('anonymous');
                          })()} 
                          </p>
                        </div>

                        {/* Reason */}
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.082 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('reason')}</p>
                          </div>
                          <p className="text-sm text-orange-700 font-semibold">
                            {REPORT_REASON_LABELS[report.reason]}
                          </p>
                        </div>

                        {/* Time */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('time')}</p>
                          </div>
                          <p className="text-sm text-green-700 font-semibold">
                            {formatDate(report.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      {report.description && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-sm font-bold text-gray-700">{t('detailedDescription')}</p>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                            <p className="text-sm text-purple-700 leading-relaxed">
                              {report.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end space-y-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-5 py-2.5 rounded-full text-sm font-bold shadow-lg ${getStatusColor(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                      </div>

                      {/* Status Update Buttons */}
                      {report.status === ReportStatus.PENDING && (
                        <div className="flex flex-col space-y-2 min-w-[160px]">
                          <button
                            onClick={() => handleStatusUpdate(report.id, ReportStatus.REVIEWED)}
                            className="px-4 py-2 text-sm font-semibold text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg"
                          >
                            ✓ {t('actionReviewed')}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(report.id, ReportStatus.RESOLVED)}
                            className="px-4 py-2 text-sm font-semibold text-green-700 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 border-2 border-green-200 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg"
                          >
                            ✓ {t('actionResolve')}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(report.id, ReportStatus.DISMISSED)}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 border-2 border-gray-200 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg"
                          >
                            ✕ {t('actionDismiss')}
                          </button>
                        </div>
                      )}

                      {report.status === ReportStatus.REVIEWED && (
                        <div className="flex flex-col space-y-2 min-w-[160px]">
                          <button
                            onClick={() => handleStatusUpdate(report.id, ReportStatus.RESOLVED)}
                            className="px-4 py-2 text-sm font-semibold text-green-700 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 border-2 border-green-200 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg"
                          >
                            ✓ {t('actionResolve')}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(report.id, ReportStatus.DISMISSED)}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 border-2 border-gray-200 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg"
                          >
                            ✕ {t('actionDismiss')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogReportsPage;