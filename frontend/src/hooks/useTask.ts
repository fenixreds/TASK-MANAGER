import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { Task, UpdateTaskData } from '@/types/task'
import toast from 'react-hot-toast'

export interface UseTaskReturn {
  task: Task | null
  loading: boolean
  error: string | null
  subtasks: Task[]
  updateTask: (data: UpdateTaskData) => Promise<Task | null>
  deleteTask: () => Promise<void>
  fetchTask: () => Promise<void>
  fetchSubtasks: () => Promise<void>
}

export function useTask(taskId: string | null): UseTaskReturn {
  const [task, setTask] = useState<Task | null>(null)
  const [subtasks, setSubtasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTask = useCallback(async () => {
    if (!taskId) return

    setLoading(true)
    setError(null)

    try {
      const response = await api.get<Task>(`/tasks/${taskId}`)
      setTask(response.data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cargar la tarea'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [taskId])

  const fetchSubtasks = useCallback(async () => {
    if (!taskId) return

    try {
      const response = await api.get<Task[]>(`/tasks/${taskId}/subtasks`)
      setSubtasks(response.data)
    } catch (err: any) {
      console.error('Error fetching subtasks:', err)
    }
  }, [taskId])

  const updateTask = useCallback(async (data: UpdateTaskData): Promise<Task | null> => {
    if (!taskId) return null

    try {
      const response = await api.patch<Task>(`/tasks/${taskId}`, data)
      const updatedTask = response.data

      setTask(updatedTask)
      toast.success('Tarea actualizada exitosamente')

      return updatedTask
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar la tarea'
      toast.error(errorMessage)
      return null
    }
  }, [taskId])

  const deleteTask = useCallback(async (): Promise<void> => {
    if (!taskId) return

    try {
      await api.delete(`/tasks/${taskId}`)
      toast.success('Tarea eliminada exitosamente')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar la tarea'
      toast.error(errorMessage)
      throw err
    }
  }, [taskId])

  useEffect(() => {
    if (taskId) {
      fetchTask()
      fetchSubtasks()
    }
  }, [fetchTask, fetchSubtasks])

  return {
    task,
    loading,
    error,
    subtasks,
    updateTask,
    deleteTask,
    fetchTask,
    fetchSubtasks,
  }
}