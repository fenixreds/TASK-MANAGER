import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { TaskPriority, TaskStatus } from 'src/entities/task.entity';


describe('TasksController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/tasks (POST)', () => {
    it('should create a new task', () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.HIGH,
        estimate: 8,
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .send(createTaskDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toEqual(createTaskDto.title);
          expect(res.body.description).toEqual(createTaskDto.description);
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 400 for invalid task data', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({})
        .expect(400);
    });
  });

  describe('/tasks (GET)', () => {
    it('should return paginated tasks', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('tasks');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(res.body).toHaveProperty('totalPages');
          expect(Array.isArray(res.body.tasks)).toBeTruthy();
        });
    });

    it('should filter tasks by status', () => {
      return request(app.getHttpServer())
        .get('/tasks?status=Backlog')
        .expect(200)
        .expect((res) => {
          res.body.tasks.forEach((task: any) => {
            expect(task.status).toEqual(TaskStatus.BACKLOG);
          });
        });
    });
  });

  describe('/tasks/:id (GET)', () => {
    let createdTaskId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Task for GET test',
          description: 'Test description',
        });
      createdTaskId = response.body.id;
    });

    it('should return a specific task', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${createdTaskId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(createdTaskId);
          expect(res.body.title).toEqual('Task for GET test');
        });
    });

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .get('/tasks/non-existent-id')
        .expect(404);
    });
  });

  describe('/tasks/statistics (GET)', () => {
    it('should return task statistics', () => {
      return request(app.getHttpServer())
        .get('/tasks/statistics')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('byStatus');
          expect(res.body).toHaveProperty('byPriority');
          expect(typeof res.body.total).toBe('number');
        });
    });
  });
});