import { useState, useEffect, useCallback } from 'react';
import { Achievement } from '../../types/achievement/achievement.types';
import { AchievementFormData } from '../../types/achievement/request/achievement.request';
import AchievementService from '../../services/achievement.service';

interface UseAchievementManagementReturn {
  // State
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
  fieldErrors: { [key: string]: string } | null;
  showForm: boolean;
  editingAchievement: Achievement | null;
  deleteConfirm: string | null;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  
  // Actions
  loadAchievements: () => Promise<void>;
  handleCreate: () => void;
  handleEdit: (achievement: Achievement) => void;
  handleDelete: (id: string) => Promise<void>;
  handleFormSubmit: (data: AchievementFormData) => Promise<void>;
  handleFormCancel: () => void;
  setDeleteConfirm: (id: string | null) => void;
  clearError: () => void;
  setCurrentPage: (page: number) => void;
}

export const useAchievementManagement = (): UseAchievementManagementReturn => {
  // State
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalItems = achievements.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Load achievements on mount
  useEffect(() => {
    loadAchievements();
  }, []);

  // Load achievements from API
  const loadAchievements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AchievementService.getAllAchievements();
      
      // Handle different response structures
      let achievementsData: Achievement[] = [];
      
      // Type guard to safely access response properties
      if (response && typeof response === 'object') {
        const responseData = response as any;
        
        if (Array.isArray(responseData.data)) {
          achievementsData = responseData.data;
        } else if (responseData.data && Array.isArray(responseData.data.data)) {
          achievementsData = responseData.data.data;
        } else if (responseData.data && responseData.data.achievements && Array.isArray(responseData.data.achievements)) {
          achievementsData = responseData.data.achievements;
        } else if (Array.isArray(responseData)) {
          achievementsData = responseData;
        }
      } else if (Array.isArray(response)) {
        achievementsData = response;
      }
      
      console.log('Final achievements data:', achievementsData);
      setAchievements(achievementsData);
    } catch (err) {
      console.error('Load achievements error:', err);
      setError('Failed to load achievements');
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle create new achievement
  const handleCreate = useCallback(() => {
    setEditingAchievement(null);
    setShowForm(true);
    setError(null);
  }, []);

  // Handle edit achievement
  const handleEdit = useCallback((achievement: Achievement) => {
    setEditingAchievement(achievement);
    setShowForm(true);
    setError(null);
  }, []);

  // Handle delete achievement
  const handleDelete = useCallback(async (id: string) => {
    try {
      setError(null);
      await AchievementService.deleteAchievement(id);
      await loadAchievements();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete achievement error:', err);
      setError('Unable to delete achievement');
    }
  }, [loadAchievements]);

  // Handle form submission
  const handleFormSubmit = useCallback(async (data: AchievementFormData) => {
    try {
      setError(null);
      setFieldErrors(null);
      if (editingAchievement && editingAchievement._id) {
        await AchievementService.updateAchievement(editingAchievement._id, data);
      } else {
        await AchievementService.createAchievement(data);
      }
      setShowForm(false);
      setEditingAchievement(null);
      await loadAchievements();
    } catch (err: any) {
      console.error('Submit achievement form error:', err);
      
      // Parse error response
      const errorResponse = err.response?.data;
      const errorCode = errorResponse?.code;
      const errorMessage = errorResponse?.message;
      
      // Handle duplicate title error (code 1113)
      if (errorCode === 1113 || errorMessage?.includes('already exists')) {
        setFieldErrors({
          title: 'Achievement title already exists'
        });
        setError(null);
      } else {
        // Generic error
        setError(errorMessage || 'Unable to save achievement');
        setFieldErrors(null);
      }
    }
  }, [editingAchievement, loadAchievements]);

  // Handle form cancellation
  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setEditingAchievement(null);
    setError(null);
    setFieldErrors(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Handle page change
  const handleSetCurrentPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  return {
    // State
    achievements,
    loading,
    error,
    fieldErrors,
    showForm,
    editingAchievement,
    deleteConfirm,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    
    // Actions
    loadAchievements,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleFormCancel,
    setDeleteConfirm,
    clearError,
    setCurrentPage: handleSetCurrentPage
  };
};