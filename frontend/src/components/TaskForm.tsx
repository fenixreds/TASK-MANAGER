'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Task, TaskStatus, TaskPriority, CreateTaskData, UpdateTaskData } from '@/types/task'
import { Save, X } from 'lucide-react'

const taskSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(255, 'El título es demasiado largo'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  estimate: z.number().min(0, 'La estimación debe ser positiva').optional(),
  parentTaskId: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  task?: Task | null
  parentTask?: Task | null
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function TaskForm({ 
  task = null, 
  parentTask = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}: TaskFormProps) {
  const isEditing = !!task
  const isSubtask = !!parentTask

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || (isSubtask ? TaskStatus.BACKLOG : TaskStatus.BACKLOG),
      priority: task?.priority || TaskPriority.MEDIUM,
      estimate: task?.estimate || 0,
      parentTaskId: parentTask?.id || task?.parentTaskId || undefined,
    },
  })

  const handleFormSubmit = async (data: TaskFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {isEditing ? 'Editar Tarea' : isSubtask ? 'Nueva Subtarea' : 'Nueva Tarea'}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>

        {isSubtask && parentTask && (
          <p className="text-sm text-gray-600">
            Subtarea de: <span className="font-medium">{parentTask.title}</span>
          </p>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Título *
            </label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Ingresa el título de la tarea..."
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={4}
              placeholder="Describe la tarea con más detalle..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          {/* Status y Priority en fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Estado */}
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-gray-700">
                Estado
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {Object.values(TaskStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            {/* Prioridad */}
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium text-gray-700">
                Prioridad
              </label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Sin prioridad</option>
                    {Object.values(TaskPriority).map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          </div>

          {/* Estimación */}
          <div className="space-y-2">
            <label htmlFor="estimate" className="text-sm font-medium text-gray-700">
              Estimación (horas)
            </label>
            <Input
              id="estimate"
              type="number"
              step="0.5"
              min="0"
              {...register('estimate', { valueAsNumber: true })}
              placeholder="0"
              className={errors.estimate ? 'border-red-500' : ''}
            />
            {errors.estimate && (
              <p className="text-sm text-red-600">{errors.estimate.message}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="min-w-[100px]"
            >
              {(isSubmitting || loading) ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Actualizar' : 'Crear'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default TaskForm