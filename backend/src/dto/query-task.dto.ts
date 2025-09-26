import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class QueryTaskDto {
  @ApiProperty({ description: 'Número de página', minimum: 1, required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Elementos por página', minimum: 1, maximum: 100, required: false, default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ enum: TaskStatus, description: 'Filtrar por estado', required: false })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ enum: TaskPriority, description: 'Filtrar por prioridad', required: false })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({ description: 'Buscar en título y descripción', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Ordenar por campo (title, createdAt, updatedAt, priority)', required: false, default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ description: 'Dirección del ordenamiento (ASC, DESC)', required: false, default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}