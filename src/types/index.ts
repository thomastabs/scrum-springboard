
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  endGoal: string;
  createdAt: string;
  owner: string;
}

export interface Sprint {
  id: string;
  name: string;
  description: string;
  projectId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'active' | 'completed';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  sprintId: string;
  status: 'todo' | 'inProgress' | 'review' | 'done';
  storyPoints: number;
  assignee?: string;
}

export interface BurndownData {
  date: string;
  ideal: number;
  actual: number;
}
