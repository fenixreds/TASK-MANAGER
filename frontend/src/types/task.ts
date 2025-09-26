export enum TaskStatus {
  BACKLOG = 'Backlog',
  UNSTARTED = 'Unstarted',
  STARTED = 'Started',
  COMPLETED = 'Completed',
  CANCELED = 'Canceled',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  estimate?: number;
  parentTaskId?: string;
  parentTask?: Task;
  subtasks?: Task[];
  createdAt: string;
  updatedAt: string;

  // Campos calculados
  pendingEstimate?: number;
  inProgressEstimate?: number;
  totalEstimate?: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimate?: number;
  parentTaskId?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskQuery {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface TaskStatistics {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<string, number>;
}