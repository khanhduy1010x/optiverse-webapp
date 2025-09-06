import { useEffect, useState } from 'react';
import achievementService from '../../services/achievement.service';
import { Achievement, ConditionTypeEnum, AchievementType } from '../../types/achievement/achievement.type';
import { validateAchievement } from '../../utils/achievement.util';
import { achievementTypeService } from '../../services/achievementType.service';
import { useAppTranslate } from '../../hooks/useAppTranslate';

export function useAdminAchievements() {
  const { t } = useAppTranslate('achievement');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementTypes, setAchievementTypes] = useState<AchievementType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Create modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createConditionType, setCreateConditionType] = useState<ConditionTypeEnum>(ConditionTypeEnum.TASKS_COMPLETED);
  const [createConditionValue, setCreateConditionValue] = useState<number>(1);
  const [createLoading, setCreateLoading] = useState(false);
  const [createValidationError, setCreateValidationError] = useState<string | null>(null);

  const [editIconFile, setEditIconFile] = useState<File | null>(null);
  const [createIconFile, setCreateIconFile] = useState<File | null>(null);

  useEffect(() => {
    fetchAchievements();
    fetchAchievementTypes();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await achievementService.getAllAchievements?.();
      setAchievements(response || []);
    } catch (err: any) {
      setError(t('failed_to_fetch_achievements'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievementTypes = async () => {
    try {
      const response = await achievementTypeService.getAchievementTypes();
      setAchievementTypes(response || []);
    } catch (err: any) {
      console.error('Failed to fetch achievement types', err);
    }
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingId(achievement._id);
    setEditTitle(achievement.title);
    setEditDescription(achievement.description ?? '');
    setValidationError(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setValidationError(null);
  };

  const handleSave = async () => {
    if (!editingId) return;
    const validation = validateAchievement({ title: editTitle, description: editDescription });
    if (!validation.valid) {
      setValidationError(validation.error || null);
      return;
    }
    
    // Check for duplicate title
    const duplicateTitleAchievement = achievements.find(
      (a) => a.title.toLowerCase() === editTitle.toLowerCase() && a._id !== editingId
    );
    if (duplicateTitleAchievement) {
      setValidationError(t('duplicate_title', { title: editTitle }));
      return;
    }
    
    setSaving(true);
    try {
      let data: any;
      
      // Find the current achievement to check if it has an existing image
      // No need to use this variable since we're just keeping the existing image
      
      if (editIconFile) {
        // If a new file is uploaded, use FormData
        const formData = new FormData();
        formData.append('title', editTitle);
        formData.append('description', editDescription);
        formData.append('file', editIconFile);
        data = formData;
      } else {
        // If no new file is uploaded, just update text fields and keep existing image
        data = { 
          title: editTitle, 
          description: editDescription,
          // Don't modify the icon_url/badge_image fields
          keepExistingImage: true
        };
      }
      
      await achievementService.updateAchievement?.(editingId, data);
      await fetchAchievements();
      setEditingId(null);
      setEditIconFile(null);
    } catch (err: any) {
      console.error('Update achievement error:', err);
      if (err.message?.includes('EAI_AGAIN') || err.code === 'EAI_AGAIN') {
        setError(t('network_error_upload'));
      } else if (err.response?.data?.message) {
        // Ensure we're passing a string to setValidationError
        setValidationError(String(err.response.data.message));
      } else if (err.response?.status === 400 && err.response?.data?.error?.includes('duplicate key')) {
        setValidationError(t('duplicate_title', { title: editTitle }));
      } else if (err.response?.data?.code === 11000 || (err.response?.data?.error && err.response?.data?.error.includes('E11000'))) {
        setValidationError(t('duplicate_title', { title: editTitle }));
      } else {
        setValidationError(t('failed_to_update'));
      }
    } finally {
      setSaving(false);
    }
  };

  // Create logic
  const openCreateModal = () => {
    setCreateModalOpen(true);
    setCreateTitle('');
    setCreateDescription('');
    setCreateConditionType(ConditionTypeEnum.TASKS_COMPLETED);
    setCreateConditionValue(1);
    setCreateValidationError(null);
  };
  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setCreateTitle('');
    setCreateDescription('');
    setCreateConditionType(ConditionTypeEnum.TASKS_COMPLETED);
    setCreateConditionValue(1);
    setCreateValidationError(null);
  };
  const handleCreate = async () => {
    const validation = validateAchievement({ title: createTitle, description: createDescription });
    if (!validation.valid) {
      setCreateValidationError(validation.error || null);
      return;
    }
    if (!createConditionType || !createConditionValue || createConditionValue < 1) {
      setCreateValidationError(t('invalid_condition_type_value'));
      return;
    }
    
    // Check for duplicate title
    const duplicateTitleAchievement = achievements.find(
      (a) => a.title.toLowerCase() === createTitle.toLowerCase()
    );
    if (duplicateTitleAchievement) {
      setCreateValidationError(t('duplicate_title', { title: createTitle }));
      return;
    }
    
    // Check for duplicate condition type and value
    const duplicateCondition = achievementTypes.find(
      (at) => at.condition_type === createConditionType && at.condition_value === createConditionValue
    );
    if (duplicateCondition) {
      // Find the achievement title for better error message
      const duplicateAchievement = achievements.find(a => a._id === duplicateCondition.achievement_id.toString());
      const achievementTitle = duplicateAchievement ? duplicateAchievement.title : 'another achievement';
      
      setCreateValidationError(
        t('duplicate_condition', { type: createConditionType, value: createConditionValue, title: achievementTitle })
      );
      return;
    }
    
    setCreateLoading(true);
    try {
      let data: any;
      if (createIconFile) {
        const formData = new FormData();
        formData.append('title', createTitle);
        formData.append('description', createDescription);
        formData.append('file', createIconFile);
        data = formData;
      } else {
        data = { title: createTitle, description: createDescription };
      }
      // 1. Create achievement
      const achievementRes = await achievementService.createAchievement(data);
      console.log('achievementRes', achievementRes);
      const achievementId = achievementRes?.data?.achievement?._id || achievementRes?.data?.achievement?.id;
      console.log('achievementId', achievementId);
      if (!achievementId) throw new Error('Cannot get achievement id');
      // 2. Create achievement type
      await achievementTypeService.createAchievementType({
        achievement_id: achievementId,
        condition_type: createConditionType,
        condition_value: createConditionValue,
      });
      await fetchAchievements();
      await fetchAchievementTypes();
      closeCreateModal();
      setCreateIconFile(null);
    } catch (err: any) {
      console.error('Create achievement error:', err);
      if (err.message?.includes('EAI_AGAIN') || err.code === 'EAI_AGAIN') {
        setCreateValidationError(t('network_error_upload'));
      } else if (err.response?.data?.message) {
        // Ensure we're passing a string to setCreateValidationError
        setCreateValidationError(String(err.response.data.message));
      } else if (err.response?.status === 400 && err.response?.data?.error?.includes('duplicate key')) {
        setCreateValidationError(t('duplicate_title', { title: createTitle }));
      } else if (err.response?.data?.code === 11000 || (err.response?.data?.error && err.response?.data?.error.includes('E11000'))) {
        setCreateValidationError(t('duplicate_title', { title: createTitle }));
      } else if (err.response?.status === 400 && err.response?.data?.message?.includes('condition')) {
        setCreateValidationError(t('duplicate_condition_prefix', { message: err.response.data.message }));
      } else {
        setCreateValidationError(t('failed_to_create'));
      }
    } finally {
      setCreateLoading(false);
    }
  };

  return {
    achievements,
    achievementTypes,
    loading,
    error,
    editingId,
    editTitle,
    editDescription,
    saving,
    validationError,
    handleEdit,
    handleCancel,
    handleSave,
    setEditTitle,
    setEditDescription,
    // create logic
    createModalOpen,
    openCreateModal,
    closeCreateModal,
    createTitle,
    setCreateTitle,
    createDescription,
    setCreateDescription,
    createConditionType,
    setCreateConditionType,
    createConditionValue,
    setCreateConditionValue,
    createLoading,
    createValidationError,
    handleCreate,
    setEditIconFile,
    setCreateIconFile,
    fetchAchievements,
  };
} 