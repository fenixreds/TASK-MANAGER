import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({ description: 'Título de la tarea', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Descripción detallada de la tarea', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TaskStatus, description: 'Estado de la tarea', required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ enum: TaskPriority, description: 'Prioridad de la tarea', required: false })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({ description: 'Estimación en horas', minimum: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimate?: number;

  @ApiProperty({ description: 'ID de la tarea padre (para subtareas)', required: false })
  @IsOptional()
  @IsUUID()
  parentTaskId?: string;
}