import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { CreateTaskDto } from 'src/dto/create-task.dto';
import { QueryTaskDto } from 'src/dto/query-task.dto';
import { UpdateTaskDto } from 'src/dto/update-task.dto';
import { Task, TaskStatus } from '../entities/task.entity';


@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    // Verificar si la tarea padre existe
    if (createTaskDto.parentTaskId) {
      const parentTask = await this.tasksRepository.findOne({
        where: { id: createTaskDto.parentTaskId },
      });
      if (!parentTask) {
        throw new BadRequestException('La tarea padre no existe');
      }
    }

    const task = this.tasksRepository.create(createTaskDto);
    const savedTask = await this.tasksRepository.save(task);

    return this.findOne(savedTask.id);
  }

  async findAll(queryDto: QueryTaskDto): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, status, priority, search, sortBy = 'createdAt', sortOrder = 'DESC' } = queryDto;

    const queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.subtasks', 'subtasks')
      .leftJoinAndSelect('task.parentTask', 'parentTask');

    // Filtros
    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    if (search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Solo tareas principales (sin padre) para la lista principal
    queryBuilder.andWhere('task.parentTaskId IS NULL');

    // Ordenamiento
    queryBuilder.orderBy(`task.${sortBy}`, sortOrder);

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [tasks, total] = await queryBuilder.getManyAndCount();

    // Calcular estimaciones para cada tarea
    const tasksWithEstimates = await Promise.all(
      tasks.map(task => this.calculateEstimates(task))
    );

    const totalPages = Math.ceil(total / limit);

    return {
      tasks: tasksWithEstimates,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['subtasks', 'parentTask'],
    });

    if (!task) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }

    return this.calculateEstimates(task);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    // Verificar si la nueva tarea padre existe
    if (updateTaskDto.parentTaskId && updateTaskDto.parentTaskId !== task.parentTaskId) {
      const parentTask = await this.tasksRepository.findOne({
        where: { id: updateTaskDto.parentTaskId },
      });
      if (!parentTask) {
        throw new BadRequestException('La tarea padre no existe');
      }

      // Evitar ciclos: la tarea no puede ser padre de sí misma o de su ancestro
      if (await this.wouldCreateCycle(id, updateTaskDto.parentTaskId)) {
        throw new BadRequestException('Esta operación crearía un ciclo en la jerarquía de tareas');
      }
    }

    await this.tasksRepository.update(id, updateTaskDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);

    // Verificar si tiene subtareas
    if (task.subtasks && task.subtasks.length > 0) {
      throw new BadRequestException('No se puede eliminar una tarea que tiene subtareas. Elimina primero las subtareas.');
    }

    await this.tasksRepository.delete(id);
  }

  async findSubtasks(parentId: string): Promise<Task[]> {
    const parentTask = await this.findOne(parentId);

    const subtasks = await this.tasksRepository.find({
      where: { parentTaskId: parentId },
      relations: ['subtasks'],
      order: { createdAt: 'ASC' },
    });

    return Promise.all(subtasks.map(subtask => this.calculateEstimates(subtask)));
  }

  private async calculateEstimates(task: Task): Promise<Task> {
    if (task.subtasks && task.subtasks.length > 0) {
      // Cargar subtareas recursivamente si no están cargadas
      const subtasksWithEstimates = await Promise.all(
        task.subtasks.map(async (subtask) => {
          const fullSubtask = await this.tasksRepository.findOne({
            where: { id: subtask.id },
            relations: ['subtasks'],
          });
          return this.calculateEstimates(fullSubtask || subtask);
        })
      );

     // Sumar numéricamente estimaciones pendientes e inProgress
      const pendingEstimate = subtasksWithEstimates
        .filter(s => [TaskStatus.BACKLOG, TaskStatus.UNSTARTED].includes(s.status))
        .reduce((sum, s) => sum + Number(s.estimate || 0), 0);

      const inProgressEstimate = subtasksWithEstimates
        .filter(s => s.status === TaskStatus.STARTED)
        .reduce((sum, s) => sum + Number(s.estimate || 0), 0);

      // Sumar estimado total: estimado de la tarea padre + suma de subtareas
      const subtasksTotalEstimate = subtasksWithEstimates
        .reduce((sum, s) => sum + Number(s.estimate || 0), 0);

      const parentEstimate = Number(task.estimate) || 0;

      const totalEstimate = parentEstimate + subtasksTotalEstimate;
      task.pendingEstimate = pendingEstimate;
      task.inProgressEstimate = inProgressEstimate;
      task.totalEstimate = totalEstimate;
      task.subtasks = subtasksWithEstimates;
      
    } else {
      task.pendingEstimate = 0;
      task.inProgressEstimate = 0;
      task.totalEstimate = task.estimate || 0;
    }

    return task;
  }

  private async wouldCreateCycle(taskId: string, parentTaskId: string): Promise<boolean> {
    let currentParentId = parentTaskId;

    while (currentParentId) {
      if (currentParentId === taskId) {
        return true; // Ciclo detectado
      }

      const parentTask = await this.tasksRepository.findOne({
        where: { id: currentParentId },
        select: ['parentTaskId'],
      });

      if (!parentTask) {
        break;
      }

      currentParentId = parentTask.parentTaskId;
    }

    return false;
  }

  // Método adicional para obtener estadísticas
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<string, number>;
  }> {
    const tasks = await this.tasksRepository.find();

    const total = tasks.length;

    const byStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<TaskStatus, number>);

    const byPriority = tasks.reduce((acc, task) => {
      if (task.priority) {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { total, byStatus, byPriority };
  }
}