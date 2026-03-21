import { z, registry } from '../swagger/registry.js';

const bearerAuth = [{ bearerAuth: [] }];

export const CreateSalaryBodySchema = z
  .object({
    employee: z.string().min(1, 'Employee ID is required').openapi({ example: '64b1f2c3d4e5f6a7b8c9d0e1' }),
    month: z.string().min(1, 'Month is required').openapi({ example: 'October' }),
    year: z.coerce.number().int().min(2000, 'Invalid year').openapi({ example: 2024 }),
    basicSalary: z.coerce.number().positive('Basic salary must be positive').openapi({ example: 50000 }),
    bonus: z.coerce.number().nonnegative().optional().openapi({ example: 5000 }),
    deductions: z.coerce.number().nonnegative().optional().openapi({ example: 2000 }),
    payDate: z.string().optional().openapi({ example: '2024-10-31' }),
  })
  .openapi('CreateSalaryBody');

export const UpdateSalaryBodySchema = z
  .object({
    basicSalary: z.coerce.number().positive().optional().openapi({ example: 55000 }),
    bonus: z.coerce.number().nonnegative().optional().openapi({ example: 6000 }),
    deductions: z.coerce.number().nonnegative().optional().openapi({ example: 1500 }),
  })
  .openapi('UpdateSalaryBody');

export const SalaryIdParamSchema = z
  .object({ id: z.string().min(1).openapi({ example: '64b1f2c3d4e5f6a7b8c9d0e1' }) })
  .openapi('SalaryIdParam');

export const SalaryQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional().openapi({ example: 1 }),
    limit: z.coerce.number().int().positive().optional().openapi({ example: 10 }),
  })
  .openapi('SalaryQuery');

registry.registerPath({
  method: 'post',
  path: '/salary/create',
  tags: ['Salary'],
  summary: 'Create a salary slip for an employee',
  security: bearerAuth,
  request: { body: { content: { 'application/json': { schema: CreateSalaryBodySchema } } } },
  responses: {
    200: { description: 'Salary slip created' },
    400: { description: 'Duplicate slip or validation error' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/salary/',
  tags: ['Salary'],
  summary: 'Get all salary records (paginated)',
  security: bearerAuth,
  request: { query: SalaryQuerySchema },
  responses: { 200: { description: 'Paginated salary list' } },
});

registry.registerPath({
  method: 'get',
  path: '/salary/pdf/{id}',
  tags: ['Salary'],
  summary: 'Generate and download salary slip PDF',
  security: bearerAuth,
  request: { params: SalaryIdParamSchema },
  responses: {
    200: { description: 'PDF generated' },
    404: { description: 'Salary record not found' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/salary/{id}',
  tags: ['Salary'],
  summary: 'Get salary record by ID',
  security: bearerAuth,
  request: { params: SalaryIdParamSchema },
  responses: {
    200: { description: 'Salary record found' },
    404: { description: 'Salary record not found' },
  },
});

registry.registerPath({
  method: 'put',
  path: '/salary/{id}',
  tags: ['Salary'],
  summary: 'Update salary record by ID',
  security: bearerAuth,
  request: {
    params: SalaryIdParamSchema,
    body: { content: { 'application/json': { schema: UpdateSalaryBodySchema } } },
  },
  responses: { 200: { description: 'Salary updated' } },
});

registry.registerPath({
  method: 'delete',
  path: '/salary/{id}',
  tags: ['Salary'],
  summary: 'Delete salary record by ID',
  security: bearerAuth,
  request: { params: SalaryIdParamSchema },
  responses: {
    200: { description: 'Salary deleted' },
    404: { description: 'Salary record not found' },
  },
});
