import api from './api.service';
import { AchievementType, ConditionTypeEnum } from '../types/achievement/achievement.type';

export const achievementTypeService = {
  createAchievementType: async (data: {
    achievement_id: string;
    condition_type: ConditionTypeEnum;
    condition_value: number;
  }): Promise<AchievementType> => {
    try {
      const response = await api.post('/productivity/achievement-types', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating achievement type:', error);
      
      // Handle duplicate condition error
      if (error.response?.status === 400 && 
          (error.response?.data?.message?.includes('duplicate') || 
           error.response?.data?.message?.includes('already exists'))) {
        throw new Error(`An achievement with condition type "${data.condition_type}" and value ${data.condition_value} already exists.`);
      }
      
      // Handle MongoDB duplicate key error
      if (error.response?.data?.code === 11000 || 
          (error.response?.data?.error && error.response?.data?.error.includes('E11000'))) {
        throw new Error(`An achievement with condition type "${data.condition_type}" and value ${data.condition_value} already exists.`);
      }
      
      // Handle other errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw error;
    }
  },

  getAchievementTypes: async (): Promise<AchievementType[]> => {
    try {
      const response = await api.get('/productivity/achievement-types');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching achievement types:', error);
      throw error;
    }
  },

  getAchievementTypesByAchievementId: async (achievementId: string): Promise<AchievementType[]> => {
    try {
      const response = await api.get(`/productivity/achievement-types/achievement/${achievementId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching achievement types by achievement ID:', error);
      throw error;
    }
  },
}; 