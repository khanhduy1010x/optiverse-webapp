export interface Tag {
  _id: string;
  name: string;
  color: string;
  user_id?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  taskTagId?: string; // ID of the task-tag relation (for deletion)
  tasks?: TaskTagRelation[]; // Virtual field for tasks
}

export interface TaskTagRelation {
  _id: string;
  task: any;
  tag: Tag;
}

export interface TagResponse {
  tag: Tag;
}

export interface TagsResponse {
  tags: Tag[];
}
