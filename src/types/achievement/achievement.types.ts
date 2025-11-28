// Achievement enums and types based on backend schema

export enum RuleCategory {
  TASK = 'TASK',
  FRIEND = 'FRIEND',
  STREAK = 'STREAK'
}

export enum ValueType {
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  ENUM = 'ENUM',
}

export enum Operator {
  GT = 'GT',
  GTE = 'GTE',
  LT = 'LT',
  LTE = 'LTE',
  EQ = 'EQ',
  NE = 'NE'
}

export enum LogicOperator {
  AND = 'AND',
  OR = 'OR'
}

export interface Rule {
  _id?: string;
  category: RuleCategory;
  field: string;
  value_type: ValueType;
  threshold?: number;
  operator: Operator;
  value: string;
}

export interface Achievement {
  _id?: string;
  title: string;
  description?: string;
  icon_url?: string;
  rules: Rule[];
  logic_operator: LogicOperator;
  reward?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Field definitions for each category
export interface FieldDefinition {
  name: string;
  label: string;
  value_type: ValueType;
  requires_threshold: boolean;
  options?: { value: any; label: string }[];
}

export interface CategoryFields {
  [RuleCategory.TASK]: FieldDefinition[];
  [RuleCategory.FRIEND]: FieldDefinition[];
  [RuleCategory.STREAK]: FieldDefinition[];
}

// Field configurations for dynamic form
export const CATEGORY_FIELDS: CategoryFields = {
  [RuleCategory.TASK]: [
    { name: 'status', label: 'Status', value_type: ValueType.ENUM, requires_threshold: true, options: [
      { value: 'pending', label: 'Pending' },
      { value: 'completed', label: 'Completed' },
      { value: 'overdue', label: 'Overdue' }
    ]},
    { name: 'priority', label: 'Priority', value_type: ValueType.ENUM, requires_threshold: true, options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' }
    ]},
    { name: 'completedAt', label: 'Completion Time', value_type: ValueType.DATE, requires_threshold: false }
  ],
  [RuleCategory.FRIEND]: [
    { name: 'status', label: 'Status', value_type: ValueType.ENUM, requires_threshold: true, options: [
      { value: 'pending', label: 'Pending' },
      { value: 'accepted', label: 'Accepted' },
      { value: 'blocked', label: 'Blocked' }
    ]},
    { name: 'completedAt', label: 'Completion Time', value_type: ValueType.DATE, requires_threshold: false }
  ],
  [RuleCategory.STREAK]: [
    { name: 'loginStreak', label: 'Login Streak', value_type: ValueType.NUMBER, requires_threshold: false },
    { name: 'taskStreak', label: 'Task Streak', value_type: ValueType.NUMBER, requires_threshold: false },
    { name: 'flashcardStreak', label: 'Flashcard Streak', value_type: ValueType.NUMBER, requires_threshold: false }
  ]
};

// Operators available for each value type
export const ALL_OPERATORS: Operator[] = [Operator.GT, Operator.GTE, Operator.LT, Operator.LTE, Operator.EQ, Operator.NE];
export const VALUE_TYPE_OPERATORS: Record<ValueType, Operator[]> = {
  [ValueType.NUMBER]: ALL_OPERATORS,
  [ValueType.STRING]: ALL_OPERATORS,
  [ValueType.BOOLEAN]: ALL_OPERATORS,
  [ValueType.DATE]: ALL_OPERATORS,
  [ValueType.ENUM]: ALL_OPERATORS,
};

// English labels for operators
export const OPERATOR_LABELS: Record<Operator, string> = {
  GT: 'Greater than',
  GTE: 'Greater than or equal',
  LT: 'Less than',
  LTE: 'Less than or equal',
  EQ: 'Equal',
  NE: 'Not equal',
};

// Date presets for UI and backend-compatible tokens
export const DATE_TOKENS = ['1D', '7D', '30D'] as const;
export type DateToken = typeof DATE_TOKENS[number];
