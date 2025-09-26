'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Task, TaskStatus, TaskPriority } from '@/types/task'
import { getStatusColor, getPriorityColor, formatDate, formatEstimate, truncateText } from '@/lib/utils'
import { 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  Users,
  AlertTriangle 
} from 'lucide-react'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  showActions?: boolean
  compact?: boolean
}

export function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  showActions = true, 
  compact = false 
}: TaskCardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit?.(task)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      onDelete?.(task.id)
    }
  }

  const hasSubtasks = task.subtasks && task.subtasks.length > 0
  const isOverdue = task.status !== TaskStatus.COMPLETED && 
                   task.status !== TaskStatus.CANCELED &&
                   new Date(task.updatedAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 días

  return (
    <Card className={`w-full transition-all duration-200 hover:shadow-md ${
      compact ? 'min-h-0' : 'min-h-[200px]'
    } ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <CardHeader className={compact ? 'pb-2' : 'pb-4'}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(task.status)} variant="outline">
                {task.status}
              </Badge>
              {task.priority && (
                <Badge className={getPriorityColor(task.priority)} variant="outline">
                  {task.priority}
                </Badge>
              )}
              {hasSubtasks && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  <Users className="w-3 h-3 mr-1" />
                  {task.subtasks?.length} subtareas
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Atrasada
                </Badge>
              )}
            </div>

            <h3 className={`font-semibold text-gray-900 ${
              compact ? 'text-sm' : 'text-lg'
            } truncate`}>
              {task.title}
            </h3>

            {!compact && task.description && (
              <p className="text-sm text-gray-600 mt-1">
                {truncateText(task.description, 100)}
              </p>
            )}
          </div>

          {showActions && (
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={compact ? 'pt-0 pb-3' : 'pt-0'}>
        <div className="space-y-3">
          {/* Estimaciones */}
          {(task.estimate || task.totalEstimate) && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Estimado: {formatEstimate(task.estimate || task.totalEstimate)}</span>
              </div>

              {hasSubtasks && task.pendingEstimate !== undefined && (
                <div className="flex items-center gap-1 text-orange-600">
                  <span>Pendiente: {formatEstimate(task.pendingEstimate)}</span>
                </div>
              )}
            </div>
          )}

          {/* Fechas */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Creada: {formatDate(task.createdAt)}</span>
            </div>

            {task.updatedAt !== task.createdAt && (
              <div className="flex items-center gap-1">
                <span>Actualizada: {formatDate(task.updatedAt)}</span>
              </div>
            )}
          </div>

          {/* ID */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-mono">
              ID: {task.id.slice(0, 8)}...
            </span>

            <Link href={`/tasks/${task.id}`}>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                Ver detalles
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TaskCard