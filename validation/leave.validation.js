import { z, registry } from '../swagger/registry.js';

const bearerAuth = [{ bearerAuth: [] }];

export const ApplyLeaveBodySchema = z
  .object({
    days: z.enum(['single', 'multiple'], { required_error: 'days is required' }).openapi({ example: 'single' }),
    subType: z.enum(['halfDay', 'fullDay']).optional().openapi({ example: 'fullDay' }),
    fromDate: z.string().min(1, 'fromDate is required').openapi({ example: '2024-06-01' }),
    toDate: z.string().optional().openapi({ example: '2024-06-05' }),
    reason: z.string().min(1, 'Reason is required').openapi({ example: 'Family function' }),
  })
  .openapi('ApplyLeaveBody');

export const UpdateLeaveStatusBodySchema = z
  .object({
    status: z.enum(['approved', 'rejected'], { required_error: 'status is required' }).openapi({ example: 'approved' }),
    adminComment: z.string().optional().openapi({ example: 'Approved. Enjoy your leave.' }),
  })
  .openapi('UpdateLeaveStatusBody');

export const LeaveIdParamSchema = z
  .object({ id: z.string().min(1).openapi({ example: '64b1f2c3d4e5f6a7b8c9d0e1' }) })
  .openapi('LeaveIdParam');

registry.registerPath({
  method: 'post',
  path: '/leave/apply',
  tags: ['Leave'],
  summary: 'Apply for leave',
  security: bearerAuth,
  request: { body: { content: { 'application/json': { schema: ApplyLeaveBodySchema } } } },
  responses: {
    201: { description: 'Leave applied successfully' },
    400: { description: 'Validation error or insufficient balance' },
  },
});

registry.registerPath({
  method: 'put',
  path: '/leave/{id}',
  tags: ['Leave'],
  summary: 'Approve or reject a leave request (admin/hr only)',
  security: bearerAuth,
  request: {
    params: LeaveIdParamSchema,
    body: { content: { 'application/json': { schema: UpdateLeaveStatusBodySchema } } },
  },
  responses: {
    200: { description: 'Leave status updated' },
    403: { description: 'Unauthorized — admin/hr only' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/leave/',
  tags: ['Leave'],
  summary: "Get current user's leave history",
  security: bearerAuth,
  responses: { 200: { description: 'Leave history' } },
});

registry.registerPath({
  method: 'get',
  path: '/leave/pending',
  tags: ['Leave'],
  summary: 'Pending leave requests (admin / HR / super-admin)',
  security: bearerAuth,
  responses: {
    200: { description: 'Pending requests with employee details' },
    403: { description: 'Forbidden' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/leave/{id}',
  tags: ['Leave'],
  summary: 'Get leave by ID',
  security: bearerAuth,
  request: { params: LeaveIdParamSchema },
  responses: {
    200: { description: 'Leave record found' },
    404: { description: 'Leave not found' },
  },
});
