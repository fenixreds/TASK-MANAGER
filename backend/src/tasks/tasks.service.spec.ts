import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TasksService } from './task.service';
import { Task, TaskPriority, TaskStatus } from '../entities/task.entity';


describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Task>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new task successfully', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.MEDIUM,
        estimate: 5,
      };

      const createdTask = {
        id: 'test-uuid',
        ...createTaskDto,
        subtasks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(createdTask);
      mockRepository.save.mockResolvedValue(createdTask);
      mockRepository.findOne.mockResolvedValue(createdTask);

      const result = await service.create(createTaskDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createTaskDto);
      expect(mockRepository.save).toHaveBeenCalledWith(createdTask);
      expect(result.title).toEqual(createTaskDto.title);
    });

    it('should throw BadRequestException if parent task does not exist', async () => {
      const createTaskDto = {
        title: 'Test Task',
        parentTaskId: 'non-existent-id',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createTaskDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const taskId = 'test-uuid';
      const task = {
        id: taskId,
        title: 'Test Task',
        subtasks: [],
      };

      mockRepository.findOne.mockResolvedValue(task);

      const result = await service.findOne(taskId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
        relations: ['subtasks', 'parentTask'],
      });
      expect(result).toEqual(expect.objectContaining(task));
    });

    it('should throw NotFoundException if task not found', async () => {
      const taskId = 'non-existent-id';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(taskId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a task successfully', async () => {
      const taskId = 'test-uuid';
      const updateDto = { title: 'Updated Title' };
      const existingTask = {
        id: taskId,
        title: 'Original Title',
        subtasks: [],
      };
      const updatedTask = { ...existingTask, ...updateDto };

      mockRepository.findOne
        .mockResolvedValueOnce(existingTask) // For findOne in update method
        .mockResolvedValueOnce(updatedTask); // For findOne after update

      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(taskId, updateDto);

      expect(mockRepository.update).toHaveBeenCalledWith(taskId, updateDto);
      expect(result.title).toEqual(updateDto.title);
    });
  });

  describe('remove', () => {
    it('should delete a task without subtasks', async () => {
      const taskId = 'test-uuid';
      const task = {
        id: taskId,
        title: 'Test Task',
        subtasks: [],
      };

      mockRepository.findOne.mockResolvedValue(task);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(taskId);

      expect(mockRepository.delete).toHaveBeenCalledWith(taskId);
    });

    it('should throw BadRequestException if task has subtasks', async () => {
      const taskId = 'test-uuid';
      const task = {
        id: taskId,
        title: 'Test Task',
        subtasks: [{ id: 'subtask-1' }],
      };

      mockRepository.findOne.mockResolvedValue(task);

      await expect(service.remove(taskId)).rejects.toThrow(BadRequestException);
    });
  });
});