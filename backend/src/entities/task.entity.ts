import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

export enum TaskStatus {
  BACKLOG = 'Backlog',
  UNSTARTED = 'Unstarted', 
  STARTED = 'Started',
  COMPLETED = 'Completed',
  CANCELED = 'Canceled'
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent'
}

@Entity('tasks')
export class Task {
  @ApiProperty({ description: 'ID único de la tarea', example: 'uuid-string' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Título de la tarea', example: 'Implementar autenticación' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Descripción detallada de la tarea', required: false })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ enum: TaskStatus, description: 'Estado actual de la tarea' })
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.BACKLOG,
  })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority, description: 'Nivel de prioridad', required: false })
  @Column({
    type: 'enum',
    enum: TaskPriority,
    nullable: true,
  })
  priority: TaskPriority;

  @ApiProperty({ description: 'Estimación de tiempo en horas', required: false })
  @Column('decimal', { precision: 8, scale: 2, nullable: true, default: 0 })
  estimate: number;

  @ApiProperty({ type: () => Task, description: 'Tarea padre (si es subtarea)', required: false })
  @ManyToOne(() => Task, (task) => task.subtasks, { nullable: true })
  @JoinColumn({ name: 'parent_task_id' })
  parentTask: Task;

  @Column({ name: 'parent_task_id', nullable: true })
  parentTaskId: string;

  @ApiProperty({ type: () => [Task], description: 'Lista de subtareas' })
  @OneToMany(() => Task, (task) => task.parentTask)
  subtasks: Task[];

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Campos calculados (no persistidos en BD)
  pendingEstimate?: number;
  inProgressEstimate?: number;
  totalEstimate?: number;
}
