'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TaskCard } from '@/components/TaskCard'
import { TaskForm } from '@/components/TaskForm'
import { useTask } from '@/hooks/useTask'
import { getStatusColor, getPriorityColor, formatDate, formatEstimate } from '@/lib/utils'
import { Task, CreateTaskData, UpdateTaskData } from '@/types/task'
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Plus, 
  Calendar, 
  Clock, 
  User,
  CheckCircle,
  AlertTriangle,
  RefreshCw 
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string

  const { task, loading, error, subtasks, updateTask, deleteTask, fetchTask, fetchSubtasks } = useTask(taskId)

  const [isEditing, setIsEditing] = useState(false)
  const [showSubtaskForm, setShowSubtaskForm] = useState(false)
  const [editingSubtask, setEditingSubtask] = useState<Task | null>(null)

  const handleUpdateTask = async (data: CreateTaskData | UpdateTaskData) => {
    // Validar que tenemos los datos mínimos necesarios para actualizar
    const updateData: UpdateTaskData = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      estimate: data.estimate,
      parentTaskId: data.parentTaskId
    }

    const updated = await updateTask(updateData)
    if (updated) {
      setIsEditing(false)
    }
  }

  const handleDeleteTask = async () => {
    if (!task) return

    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      try {
        await deleteTask()
        router.push('/')
        toast.success('Tarea eliminada exitosamente')
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    }
  }

  const handleCreateSubtask = async (data: CreateTaskData | UpdateTaskData) => {
    // Validar que tenemos los datos mínimos necesarios para crear una subtarea
    if (!data.title) {
      toast.error('El título es requerido para crear una subtarea')
      return
    }

    try {
      const createData: CreateTaskData = {
        title: data.title,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
        estimate: data.estimate || 0,
        parentTaskId: taskId
      }

      const response = await api.post('/tasks', createData)

      if (response.data) {
        setShowSubtaskForm(false)
        await fetchSubtasks()
        await fetchTask()
        toast.success('Subtarea creada exitosamente')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear la subtarea'
      toast.error(errorMessage)
    }
  }

  const handleUpdateSubtask = async (data: CreateTaskData | UpdateTaskData) => {
    if (!editingSubtask) return

    try {
      const updateData: UpdateTaskData = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        estimate: data.estimate,
        parentTaskId: data.parentTaskId
      }

      const response = await api.patch(`/tasks/${editingSubtask.id}`, updateData)

      if (response.data) {
        setEditingSubtask(null)
        await fetchSubtasks()
        await fetchTask()
        toast.success('Subtarea actualizada exitosamente')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar la subtarea'
      toast.error(errorMessage)
    }
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta subtarea?')) {
      return
    }

    try {
      await api.delete(`/tasks/${subtaskId}`)
      await fetchSubtasks()
      await fetchTask()
      toast.success('Subtarea eliminada exitosamente')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar la subtarea'
      toast.error(errorMessage)
    }
  }

  // Estados de carga y error
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando tarea...</span>
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error al cargar la tarea
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'La tarea no pudo ser encontrada'}
            </p>
            <div className="space-x-2">
              <Button onClick={() => fetchTask()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar formulario de edición
  if (isEditing || showSubtaskForm || editingSubtask) {
    const getFormHandler = () => {
      if (editingSubtask) return handleUpdateSubtask
      if (isEditing) return handleUpdateTask
      return handleCreateSubtask
    }

    return (
      <div className="container mx-auto p-6">
        <div className="mb-4">
          <Link href={`/tasks/${taskId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la tarea
            </Button>
          </Link>
        </div>

        <TaskForm
          task={editingSubtask || (isEditing ? task : null)}
          parentTask={showSubtaskForm ? task : undefined}
          onSubmit={getFormHandler()}
          onCancel={() => {
            setIsEditing(false)
            setShowSubtaskForm(false)
            setEditingSubtask(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-gray-900">
          Tareas
        </Link>
        <span>/</span>
        <span className="text-gray-900">{task.title}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Detalles de la Tarea
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={handleDeleteTask}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Información principal de la tarea */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Información principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-3">
                    {task.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getStatusColor(task.status)} variant="outline">
                      {task.status}
                    </Badge>
                    {task.priority && (
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {task.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {task.description && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Tarea padre */}
              {task.parentTask && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Tarea Padre</h4>
                  <Link href={`/tasks/${task.parentTask.id}`}>
                    <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{task.parentTask.title}</p>
                            <Badge className={getStatusColor(task.parentTask.status)} variant="outline">
                              {task.parentTask.status}
                            </Badge>
                          </div>
                          <ArrowLeft className="w-4 h-4 text-gray-400 transform rotate-180" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              )}

              {/* Información adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Creada: {formatDate(task.createdAt)}</span>
                </div>

                {task.updatedAt !== task.createdAt && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Actualizada: {formatDate(task.updatedAt)}</span>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-mono">ID: {task.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral con estimaciones */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Estimaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estimación propia:</span>
                <span className="font-medium">{formatEstimate(task.estimate)}</span>
              </div>

              {task.pendingEstimate !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subtareas pendientes:</span>
                  <span className="font-medium text-orange-600">
                    {formatEstimate(task.pendingEstimate)}
                  </span>
                </div>
              )}

              {task.inProgressEstimate !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subtareas en progreso:</span>
                  <span className="font-medium text-blue-600">
                    {formatEstimate(task.inProgressEstimate)}
                  </span>
                </div>
              )}

              {task.totalEstimate !== undefined && task.totalEstimate > 0 && (
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-semibold text-gray-900">Total:</span>
                  <span className="font-bold text-lg">
                    {formatEstimate(task.totalEstimate)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subtareas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Subtareas ({subtasks.length})
          </h2>
          <Button onClick={() => setShowSubtaskForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Subtarea
          </Button>
        </div>

        {subtasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay subtareas
              </h3>
              <p className="text-gray-600 mb-4">
                Las subtareas te ayudan a dividir esta tarea en partes más pequeñas
              </p>
              <Button onClick={() => setShowSubtaskForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear primera subtarea
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {subtasks.map((subtask) => (
              <TaskCard
                key={subtask.id}
                task={subtask}
                onEdit={setEditingSubtask}
                onDelete={handleDeleteSubtask}
                compact
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}