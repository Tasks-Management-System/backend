import { z, registry } from '../swagger/registry.js';

const bearerAuth = [{ bearerAuth: [] }];

export const CreateHiringBodySchema = z
  .object({
    name: z.string().min(1, 'Name is required').openapi({ example: 'Alice Smith' }),
    email: z.string().email('Invalid email').openapi({ example: 'alice@example.com' }),
    phone: z.string().min(1, 'Phone is required').openapi({ example: '+91 9876543210' }),
    currentSalary: z.coerce.number().nonnegative().optional().openapi({ example: 40000 }),
    expectedSalary: z.coerce.number().nonnegative().optional().openapi({ example: 55000 }),
    noticePeriod: z.string().optional().openapi({ example: '30 days' }),
    skills: z.string().optional().openapi({ example: 'React, Node.js, MongoDB' }),
    experience: z.string().optional().openapi({ example: '3 years' }),
    linkedInProfile: z.string().url().optional().openapi({ example: 'https://linkedin.com/in/alice' }),
    gitHubLink: z.string().url().optional().openapi({ example: 'https://github.com/alice' }),
    portfolioLink: z.string().url().optional().openapi({ example: 'https://alice.dev' }),
    status: z.enum(['pending', 'shortlisted', 'rejected', 'hired']).optional().openapi({ example: 'pending' }),
    note: z.string().optional(),
  })
  .openapi('CreateHiringBody');

export const UpdateHiringBodySchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    currentSalary: z.coerce.number().nonnegative().optional(),
    expectedSalary: z.coerce.number().nonnegative().optional(),
    noticePeriod: z.string().optional(),
    skills: z.string().optional(),
    experience: z.string().optional(),
    linkedInProfile: z.string().url().optional(),
    gitHubLink: z.string().url().optional(),
    portfolioLink: z.string().url().optional(),
    status: z.enum(['pending', 'shortlisted', 'rejected', 'hired']).optional(),
    note: z.string().optional(),
  })
  .openapi('UpdateHiringBody');

export const HiringIdParamSchema = z
  .object({ id: z.string().min(1).openapi({ example: '64b1f2c3d4e5f6a7b8c9d0e1' }) })
  .openapi('HiringIdParam');

export const HiringQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional().openapi({ example: 1 }),
    limit: z.coerce.number().int().positive().optional().openapi({ example: 10 }),
  })
  .openapi('HiringQuery');

registry.registerPath({
  method: 'post',
  path: '/hiring/create',
  tags: ['Hiring'],
  summary: 'Create a hiring candidate record (with resume upload)',
  security: bearerAuth,
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: CreateHiringBodySchema.extend({
            resume: z
              .any()
              .openapi({ type: 'string', format: 'binary', description: 'Resume file (PDF/DOC/DOCX)' }),
          }),
        },
      },
    },
  },
  responses: {
    201: { description: 'Candidate created' },
    400: { description: 'Duplicate email or missing resume' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/hiring/',
  tags: ['Hiring'],
  summary: 'Get all hiring records (paginated)',
  security: bearerAuth,
  request: { query: HiringQuerySchema },
  responses: { 200: { description: 'Paginated hiring list' } },
});

registry.registerPath({
  method: 'get',
  path: '/hiring/{id}',
  tags: ['Hiring'],
  summary: 'Get hiring record by ID',
  security: bearerAuth,
  request: { params: HiringIdParamSchema },
  responses: {
    200: { description: 'Hiring record found' },
    404: { description: 'Not found' },
  },
});

registry.registerPath({
  method: 'put',
  path: '/hiring/update/{id}',
  tags: ['Hiring'],
  summary: 'Update hiring candidate record',
  security: bearerAuth,
  request: {
    params: HiringIdParamSchema,
    body: {
      content: {
        'multipart/form-data': {
          schema: UpdateHiringBodySchema.extend({
            resume: z
              .any()
              .optional()
              .openapi({ type: 'string', format: 'binary', description: 'Updated resume (optional)' }),
          }),
        },
      },
    },
  },
  responses: { 200: { description: 'Candidate updated' } },
});

registry.registerPath({
  method: 'delete',
  path: '/hiring/{id}',
  tags: ['Hiring'],
  summary: 'Delete hiring record by ID',
  security: bearerAuth,
  request: { params: HiringIdParamSchema },
  responses: {
    200: { description: 'Record deleted' },
    404: { description: 'Not found' },
  },
});
