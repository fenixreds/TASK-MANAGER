import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TasksService } from './task.service';
import { CreateTaskDto } from 'src/dto/create-task.dto';
import { UpdateTaskDto } from 'src/dto/update-task.dto';
import { QueryTaskDto } from 'src/dto/query-task.dto';
import { Task } from 'src/entities/task.entity';


@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  @ApiResponse({
    status: 201,
    description: 'La tarea ha sido creada exitosamente.',
    type: Task,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las tareas con paginación y filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas obtenida exitosamente.',
  })
  findAll(@Query() queryDto: QueryTaskDto) {
    return this.tasksService.findAll(queryDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obtener estadísticas de las tareas' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente.',
  })
  getStatistics() {
    return this.tasksService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarea por ID' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({
    status: 200,
    description: 'Tarea encontrada exitosamente.',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  findOne(@Param('id') id: string): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @Get(':id/subtasks')
  @ApiOperation({ summary: 'Obtener las subtareas de una tarea específica' })
  @ApiParam({ name: 'id', description: 'ID de la tarea padre' })
  @ApiResponse({
    status: 200,
    description: 'Subtareas obtenidas exitosamente.',
    type: [Task],
  })
  @ApiResponse({ status: 404, description: 'Tarea padre no encontrada.' })
  findSubtasks(@Param('id') id: string): Promise<Task[]> {
    return this.tasksService.findSubtasks(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una tarea' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({
    status: 200,
    description: 'La tarea ha sido actualizada exitosamente.',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una tarea' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({ status: 204, description: 'La tarea ha sido eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar la tarea (tiene subtareas).',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.tasksService.remove(id);
  }
}