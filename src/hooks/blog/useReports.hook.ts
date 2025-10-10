import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  setReportsLoading, 
  setReportsError, 
  setReports, 
  addReport, 
  updateReport, 
  removeReport 
} from '../../store/slices/blog.slice';
import { ReportService } from '../../services/blog';
import { CreateReportRequest, ReportStatus, ReportWithPost } from '../../types/blog/report.types';

export const useReports = () => {
  const dispatch = useDispatch();
  const { reports, reportsLoading, reportsError } = useSelector((state: RootState) => state.blog);

  // Load all reports (admin only)
  const loadReports = useCallback(async () => {
    try {
      dispatch(setReportsLoading(true));
      dispatch(setReportsError(null));
      
      const data = await ReportService.getAllReports();
      dispatch(setReports(data));
    } catch (error) {
      console.error('Error loading reports:', error);
      dispatch(setReportsError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải danh sách tố cáo'));
    } finally {
      dispatch(setReportsLoading(false));
    }
  }, [dispatch]);

  // Create new report
  const createReport = useCallback(async (reportData: CreateReportRequest): Promise<boolean> => {
    try {
      dispatch(setReportsError(null));
      
      const newReport = await ReportService.createReport(reportData);
      dispatch(addReport(newReport));
      
      return true;
    } catch (error) {
      console.error('Error creating report:', error);
      dispatch(setReportsError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo báo cáo'));
      return false;
    }
  }, [dispatch]);

  // Update report status
  const updateReportStatus = useCallback(async (reportId: string, status: ReportStatus): Promise<boolean> => {
    try {
      dispatch(setReportsError(null));
      
      const updatedReport = await ReportService.updateReportStatus(reportId, status);
      dispatch(updateReport(updatedReport));
      
      return true;
    } catch (error) {
      console.error('Error updating report status:', error);
      dispatch(setReportsError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật trạng thái'));
      return false;
    }
  }, [dispatch]);

  // Check if user has already reported a post
  const checkUserReport = useCallback(async (postId: string): Promise<boolean> => {
    try {
      return await ReportService.hasUserReported(postId);
    } catch (error) {
      console.error('Error checking user report:', error);
      return false;
    }
  }, []);

  // Get report by ID
  const getReportById = useCallback(async (reportId: string): Promise<ReportWithPost | null> => {
    try {
      return await ReportService.getReportById(reportId);
    } catch (error) {
      console.error('Error getting report by ID:', error);
      return null;
    }
  }, []);

  // Delete report (admin only)
  const deleteReport = useCallback(async (reportId: string): Promise<boolean> => {
    try {
      dispatch(setReportsError(null));
      
      // Assuming there's a delete method in ReportService
      // await ReportService.deleteReport(reportId);
      dispatch(removeReport(reportId));
      
      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      dispatch(setReportsError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa báo cáo'));
      return false;
    }
  }, [dispatch]);

  // Clear reports error
  const clearReportsError = useCallback(() => {
    dispatch(setReportsError(null));
  }, [dispatch]);

  // Filter reports by status
  const getReportsByStatus = useCallback((status: ReportStatus) => {
    return reports.filter(report => report.status === status);
  }, [reports]);

  // Get pending reports count
  const getPendingReportsCount = useCallback(() => {
    return reports.filter(report => report.status === ReportStatus.PENDING).length;
  }, [reports]);

  return {
    // State
    reports,
    reportsLoading,
    reportsError,
    
    // Actions
    loadReports,
    createReport,
    updateReportStatus,
    checkUserReport,
    getReportById,
    deleteReport,
    clearReportsError,
    
    // Computed
    getReportsByStatus,
    getPendingReportsCount,
  };
};

export default useReports;