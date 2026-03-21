import { z, registry } from '../swagger/registry.js';

const bearerAuth = [{ bearerAuth: [] }];

registry.registerPath({
  method: 'post',
  path: '/attendance/punch-in',
  tags: ['Attendance'],
  summary: 'Punch in for the day',
  security: bearerAuth,
  responses: {
    200: { description: 'Punched in successfully' },
    400: { description: 'Already punched in today' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/attendance/start-break',
  tags: ['Attendance'],
  summary: 'Start a break',
  security: bearerAuth,
  responses: {
    200: { description: 'Break started' },
    400: { description: 'Not punched in' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/attendance/end-break',
  tags: ['Attendance'],
  summary: 'End the current break',
  security: bearerAuth,
  responses: {
    200: { description: 'Break ended' },
    400: { description: 'Not on break' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/attendance/punch-out',
  tags: ['Attendance'],
  summary: 'Punch out for the day',
  security: bearerAuth,
  responses: { 200: { description: 'Punched out successfully' } },
});

registry.registerPath({
  method: 'get',
  path: '/attendance/',
  tags: ['Attendance'],
  summary: "Get today's attendance (admin sees all, others see own)",
  security: bearerAuth,
  responses: { 200: { description: 'Attendance records returned' } },
});
