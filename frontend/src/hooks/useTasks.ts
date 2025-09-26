 
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { Task, TasksResponse, CreateTaskData, UpdateTaskData, TaskQuery, TaskStatistics } from '@/types/task'
import toast from 'react-hot-toast'

export interface UseTasksReturn {
  // State
  tasks: Task[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }

  // Actions
 fetchTasks: (query?: TaskQuery) => Promise<void>
  createTask: (data: CreateTaskData) => Promise<Task | null>
  updateTask: (id: string, data: UpdateTaskData) => Promise<Task | null>
  deleteTask: (id: string) => Promise<void>
  refreshTasks: () => Promise<void>

  // Filters and search
  setPage: (page: number) => void
  setFilters: (filters: Partial<TaskQuery>) => void
  clearFilters: () => void
}

export function useTasks(initialQuery: TaskQuery = {}): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState<TaskQuery>({ page: 1, limit: 10, ...initialQuery })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchTasks = useCallback(async (customQuery?: TaskQuery) => {
    setLoading(true)
    setError(null)

    try {
      const queryToUse = customQuery || query
      const params = new URLSearchParams()

      Object.entries(queryToUse).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response = await api.get<TasksResponse>(`/tasks?${params.toString()}`)

      setTasks(response.data.tasks)
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages,
      })
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cargar las tareas'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [query])

  const createTask = useCallback(async (data: CreateTaskData): Promise<Task | null> => {
    try {
      const response = await api.post<Task>('/tasks', data)
      const newTask = response.data

      setTasks(prevTasks => [newTask, ...prevTasks])
      toast.success('Tarea creada exitosamente')

      return newTask
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear la tarea'
      toast.error(errorMessage)
      return null
    }
  }, [])

  const updateTask = useCallback(async (id: string, data: UpdateTaskData): Promise<Task | null> => {
    try {
      const response = await api.patch<Task>(`/tasks/${id}`, data)
      const updatedTask = response.data

      setTasks(prevTasks =>
        prevTasks.map(task => (task.id === id ? updatedTask : task))
      )

      toast.success('Tarea actualizada exitosamente')
      return updatedTask
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar la tarea'
      toast.error(errorMessage)
      return null
    }
  }, [])

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    try {
      await api.delete(`/tasks/${id}`)

      setTasks(prevTasks => prevTasks.filter(task => task.id !== id))
      toast.success('Tarea eliminada exitosamente')

      // Refrescar si la página actual queda vacía
      if (tasks.length === 1 && pagination.page > 1) {
        setQuery(prev => ({ ...prev, page: prev.page! - 1 }))
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar la tarea'
      toast.error(errorMessage)
    }
  }, [tasks.length, pagination.page])

  const refreshTasks = useCallback(() => {
    return fetchTasks()
  }, [fetchTasks])

  const setPage = useCallback((page: number) => {
    setQuery(prev => ({ ...prev, page }))
  }, [])

  const setFilters = useCallback((filters: Partial<TaskQuery>) => {
    setQuery(prev => ({ ...prev, ...filters, page: 1 }))
  }, [])

  const clearFilters = useCallback(() => {
    setQuery({ page: 1, limit: 10 })
  }, [])

  // Fetch tasks when query changes
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    pagination,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks,
    setPage,
    setFilters,
    clearFilters,
  }
}