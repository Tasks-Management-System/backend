import { z, registry } from '../swagger/registry.js';

const bearerAuth = [{ bearerAuth: [] }];

export const CreateTaskBodySchema = z
  .object({
    project: z.string().min(1, 'Project ID is required').openapi({ example: '64b1f2c3d4e5f6a7b8c9d0e1' }),
    assignedTo: z.string().optional().openapi({ example: '64b1f2c3d4e5f6a7b8c9d0e2' }),
    taskName: z.string().min(1, 'Task name is required').openapi({ example: 'Implement login API' }),
    priority: z.enum(['low', 'medium', 'urgent']).optional().openapi({ example: 'medium' }),
    status: z.enum(['pending', 'in_progress', 'completed']).optional().openapi({ example: 'pending' }),
  })
  .openapi('CreateTaskBody');

export const UpdateTaskBodySchema = z
  .object({
    taskName: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed']).optional().openapi({ example: 'in_progress' }),
    priority: z.enum(['low', 'medium', 'urgent']).optional(),
  })
  .openapi('UpdateTaskBody');

export const TaskIdParamSchema = z
  .object({ id: z.string().min(1).openapi({ example: '64b1f2c3d4e5f6a7b8c9d0e1' }) })
  .openapi('TaskIdParam');

export const TaskQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional().openapi({ example: 1 }),
    limit: z.coerce.number().int().positive().optional().openapi({ example: 10 }),
    fromDate: z.string().optional().openapi({ example: '2024-01-01' }),
    toDate: z.string().optional().openapi({ example: '2024-12-31' }),
    search: z.string().optional().openapi({ example: 'login' }),
  })
  .openapi('TaskQuery');

export const AddQueryBodySchema = z
  .object({
    message: z.string().min(1, 'Message is required').openapi({ example: 'What is the expected output format?' }),
  })
  .openapi('AddQueryBody');

export const ReplyQueryBodySchema = z
  .object({
    reply: z.string().min(1, 'Reply is required').openapi({ example: 'It should return a JSON object.' }),
  })
  .openapi('ReplyQueryBody');

export const ReplyQueryParamSchema = z
  .object({
    taskId: z.string().min(1).openapi({ example: '64b1f2c3d4e5f6a7b8c9d0e1' }),
    queryId: z.string().min(1).openapi({ example: '64b1f2c3d4e5f6a7b8c9d0e2' }),
  })
  .openapi('ReplyQueryParam');

registry.registerPath({
  method: 'post',
  path: '/task/create',
  tags: ['Tasks'],
  summary: 'Create a new task',
  security: bearerAuth,
  request: { body: { content: { 'application/json': { schema: CreateTaskBodySchema } } } },
  responses: {
    201: { description: 'Task created' },
    400: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/task/',
  tags: ['Tasks'],
  summary: 'Get all tasks (paginated, filterable)',
  security: bearerAuth,
  request: { query: TaskQuerySchema },
  responses: { 200: { description: 'Paginated task list' } },
});

registry.registerPath({
  method: 'get',
  path: '/task/{id}',
  tags: ['Tasks'],
  summary: 'Get task by ID',
  security: bearerAuth,
  request: { params: TaskIdParamSchema },
  responses: {
    200: { description: 'Task found' },
    404: { description: 'Task not found' },
  },
});

registry.registerPath({
  method: 'put',
  path: '/task/{id}',
  tags: ['Tasks'],
  summary: 'Update task by ID',
  security: bearerAuth,
  request: {
    params: TaskIdParamSchema,
    body: { content: { 'application/json': { schema: UpdateTaskBodySchema } } },
  },
  responses: { 200: { description: 'Task updated' } },
});

registry.registerPath({
  method: 'delete',
  path: '/task/{id}',
  tags: ['Tasks'],
  summary: 'Delete task by ID',
  security: bearerAuth,
  request: { params: TaskIdParamSchema },
  responses: {
    200: { description: 'Task deleted' },
    404: { description: 'Task not found' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/task/query/{id}',
  tags: ['Tasks'],
  summary: 'Add a query to a task',
  security: bearerAuth,
  request: {
    params: TaskIdParamSchema,
    body: { content: { 'application/json': { schema: AddQueryBodySchema } } },
  },
  responses: { 200: { description: 'Query added' } },
});

registry.registerPath({
  method: 'post',
  path: '/task/reply/{taskId}/{queryId}',
  tags: ['Tasks'],
  summary: 'Reply to a task query (admin/manager only)',
  security: bearerAuth,
  request: {
    params: ReplyQueryParamSchema,
    body: { content: { 'application/json': { schema: ReplyQueryBodySchema } } },
  },
  responses: {
    200: { description: 'Reply added' },
    403: { description: 'Unauthorized — admin/manager only' },
  },
});
