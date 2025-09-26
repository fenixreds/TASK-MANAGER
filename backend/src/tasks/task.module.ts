import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './task.service';
import { TasksController } from './tasks.controller';
import { Task } from 'src/entities/task.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService], // Por si otros módulos necesitan usar el servicio
})
export class TasksModule {}