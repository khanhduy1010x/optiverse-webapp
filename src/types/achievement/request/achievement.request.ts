import { Rule, LogicOperator } from '../achievement.types';

export interface CreateAchievementRequest {
  title: string;
  description?: string;
  icon_url?: string;
  rules: Rule[];
  logic_operator: LogicOperator;
  reward?: string;
}

export interface UpdateAchievementRequest {
  title?: string;
  description?: string;
  icon_url?: string;
  rules?: Rule[];
  logic_operator?: LogicOperator;
  reward?: string;
}

export interface AchievementFormData extends CreateAchievementRequest {
  icon_file?: File;
}