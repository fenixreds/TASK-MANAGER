import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TaskStatus, TaskPriority } from "@/types/task"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.COMPLETED:
      return 'bg-green-100 text-green-800 border-green-200'
    case TaskStatus.STARTED:
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case TaskStatus.BACKLOG:
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case TaskStatus.UNSTARTED:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case TaskStatus.CANCELED:
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getPriorityColor(priority?: TaskPriority): string {
  if (!priority) return 'bg-gray-100 text-gray-600 border-gray-200'

  switch (priority) {
    case TaskPriority.URGENT:
      return 'bg-red-100 text-red-700 border-red-200'
    case TaskPriority.HIGH:
      return 'bg-orange-100 text-orange-700 border-orange-200'
    case TaskPriority.MEDIUM:
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case TaskPriority.LOW:
      return 'bg-green-100 text-green-700 border-green-200'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

export function getStatusBadgeColor(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.COMPLETED:
      return 'bg-green-500 text-white'
    case TaskStatus.STARTED:
      return 'bg-blue-500 text-white'
    case TaskStatus.BACKLOG:
      return 'bg-gray-500 text-white'
    case TaskStatus.UNSTARTED:
      return 'bg-yellow-500 text-black'
    case TaskStatus.CANCELED:
      return 'bg-red-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

export function getPriorityBadgeColor(priority?: TaskPriority): string {
  if (!priority) return 'bg-gray-400 text-white'

  switch (priority) {
    case TaskPriority.URGENT:
      return 'bg-red-600 text-white'
    case TaskPriority.HIGH:
      return 'bg-orange-500 text-white'
    case TaskPriority.MEDIUM:
      return 'bg-yellow-500 text-black'
    case TaskPriority.LOW:
      return 'bg-green-500 text-white'
    default:
      return 'bg-gray-400 text-white'
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatEstimate(hours?: number): string {
  if (!hours || hours === 0) return '0h'
  if (hours < 1) return `${Math.round(hours * 60)}min`
  return `${hours}h`
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function getTaskProgress(task: { status: TaskStatus }): number {
  switch (task.status) {
    case TaskStatus.BACKLOG:
    case TaskStatus.UNSTARTED:
      return 0
    case TaskStatus.STARTED:
      return 50
    case TaskStatus.COMPLETED:
      return 100
    case TaskStatus.CANCELED:
      return 0
    default:
      return 0
  }
}

// Función para validar si una cadena es un UUID válido
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Función para obtener el color de progreso
export function getProgressColor(progress: number): string {
  if (progress === 0) return 'bg-gray-300'
  if (progress < 30) return 'bg-red-400'
  if (progress < 70) return 'bg-yellow-400'
  if (progress < 100) return 'bg-blue-400'
  return 'bg-green-400'
}

// Función para formatear números con separadores de miles
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-ES').format(num)
}

// Función para calcular tiempo relativo
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'hace un momento'
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`
  if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`

  return formatDate(dateString)
}