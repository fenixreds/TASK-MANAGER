'use client'

import React, { useState } from 'react'
import { TaskCard } from '@/components/TaskCard'
import { TaskForm } from '@/components/TaskForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useTasks } from '@/hooks/useTasks'
import { Task, TaskStatus, TaskPriority, CreateTaskData, UpdateTaskData } from '@/types/task'
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  X 
} from 'lucide-react'

export function TaskList() {
  const {
    tasks,
    loading,
    error,
    pagination,
    createTask,
    updateTask,
    deleteTask,
    setPage,
    setFilters,
    clearFilters,
    refreshTasks,
  } = useTasks()

  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('')

  // Aplicar filtros
  const handleSearch = () => {
    setFilters({
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
    })
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setPriorityFilter('')
    clearFilters()
  }

  const handleCreateTask = async (data: CreateTaskData | UpdateTaskData) => {
    // Ensure required fields for CreateTaskData
    if (!data.title || typeof data.title !== 'string') return
    const newTask = await createTask(data as CreateTaskData)
    if (newTask) {
      setShowForm(false)
    }
  }

  const handleUpdateTask = async (data: CreateTaskData | UpdateTaskData) => {
    if (!editingTask) return
    // Ensure required fields for UpdateTaskData
    const updatedTask = await updateTask(editingTask.id, data as UpdateTaskData)
    if (updatedTask) {
      setEditingTask(null)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowForm(false)
  }

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  // Paginación
  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      setPage(pagination.page - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPage(pagination.page + 1)
    }
  }

  if (showForm || editingTask) {
    return (
      <div className="container mx-auto p-6">
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={handleCancelForm}
          loading={loading}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Tareas</h1>
          <p className="text-gray-600 mt-1">
            {pagination.total} {pagination.total === 1 ? 'tarea' : 'tareas'} en total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => refreshTasks()}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>

          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Filtro por estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todos los estados</option>
              {Object.values(TaskStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            {/* Filtro por prioridad */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todas las prioridades</option>
              {Object.values(TaskPriority).map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>

            {/* Botones de filtro */}
            <div className="flex gap-2">
              <Button onClick={handleSearch} variant="outline" className="flex-1">
                <Filter className="w-4 h-4 mr-2" />
                Aplicar
              </Button>
              <Button 
                onClick={handleClearFilters} 
                variant="ghost" 
                size="sm"
                className="px-3"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de carga */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando tareas...</span>
        </div>
      )}

      {/* Estado de error */}
      {error && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-red-600 text-center">
              <p className="font-semibold">Error al cargar las tareas</p>
              <p className="text-sm mt-1">{error}</p>
              <Button 
                onClick={() => refreshTasks()} 
                variant="outline" 
                size="sm" 
                className="mt-3"
              >
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de tareas */}
      {!loading && !error && (
        <>
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-500">
                  <p className="text-lg font-semibold">No hay tareas que mostrar</p>
                  <p className="mt-2">Crea tu primera tarea para comenzar</p>
                  <Button 
                    onClick={() => setShowForm(true)} 
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Tarea
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <p className="text-sm text-gray-700">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} resultados
              </p>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <span className="text-sm text-gray-700">
                  Página {pagination.page} de {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TaskList