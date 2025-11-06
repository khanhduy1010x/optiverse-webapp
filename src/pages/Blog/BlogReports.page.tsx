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
        setError('Không thể tải danh sách báo cáo');
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
      setError('Có lỗi xảy ra khi tải danh sách tố cáo');
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
      setError('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const handlePostClick = (postId: string) => {
    navigate(`/blog/post/${postId}`);
  };

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(report => report.status === filter);

  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
    } catch (error) {
      return 'Không xác định';
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
        return 'Chờ xử lý';
      case ReportStatus.REVIEWED:
        return 'Đã xem';
      case ReportStatus.RESOLVED:
        return 'Đã giải quyết';
      case ReportStatus.DISMISSED:
        return 'Đã bỏ qua';
      default:
        return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate('/blog')}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                </svg>
                Blog
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">Bài viết bị tố cáo</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bài viết bị tố cáo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý các báo cáo tố cáo từ người dùng
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
              }`}
            >
              Tất cả ({reports.length})
            </button>
            {Object.values(ReportStatus).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 ${
                  filter === status
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
                }`}
              >
                {getStatusLabel(status)} ({reports.filter(r => r.status === status).length})
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Không có báo cáo nào
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' ? 'Chưa có báo cáo tố cáo nào.' : `Không có báo cáo nào với trạng thái "${getStatusLabel(filter as ReportStatus)}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Post Info */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-blue-500">
                      <button
                        onClick={() => handlePostClick(report.post.id)}
                        className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-all duration-200 ease-in-out hover:underline"
                      >
                        {report.post.title}
                      </button>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Tác giả: {report.post?.author?.displayName || report.post?.author?.name || report.post?.authorName || 'Không xác định'}
                      </p>
                    </div>

                    {/* Report Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center mb-2">
                          <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Người tố cáo</p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
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
                            return 'Ẩn danh';
                          })()} 
                        </p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                        <div className="flex items-center mb-2">
                          <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lý do</p>
                        </div>
                        <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                          {REPORT_REASON_LABELS[report.reason]}
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="flex items-center mb-2">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Thời gian</p>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                          {formatDate(report.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {report.description && (
                      <div className="mb-6">
                        <div className="flex items-center mb-3">
                          <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mô tả chi tiết</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                          <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                            {report.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status and Actions */}
                  <div className="ml-6 flex flex-col items-end space-y-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md ${getStatusColor(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                    </div>

                    {/* Status Update Buttons */}
                    {report.status === ReportStatus.PENDING && (
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleStatusUpdate(report.id, ReportStatus.REVIEWED)}
                          className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-md"
                        >
                          Đánh dấu đã xem
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(report.id, ReportStatus.RESOLVED)}
                          className="px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded hover:bg-green-100 dark:hover:bg-green-900/40 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-md"
                        >
                          Đã giải quyết
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(report.id, ReportStatus.DISMISSED)}
                          className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 rounded hover:bg-gray-100 dark:hover:bg-gray-900/40 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-md"
                        >
                          Bỏ qua
                        </button>
                      </div>
                    )}

                    {report.status === ReportStatus.REVIEWED && (
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleStatusUpdate(report.id, ReportStatus.RESOLVED)}
                          className="px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded hover:bg-green-100 dark:hover:bg-green-900/40 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-md"
                        >
                          Đã giải quyết
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(report.id, ReportStatus.DISMISSED)}
                          className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 rounded hover:bg-gray-100 dark:hover:bg-gray-900/40 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-md"
                        >
                          Bỏ qua
                        </button>
                      </div>
                    )}
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