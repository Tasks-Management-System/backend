import { z, registry } from '../swagger/registry.js';

export const bearerAuth = [{ bearerAuth: [] }];

export const StickyColorSchema = z.enum(['lemon', 'mint', 'sky', 'lilac', 'peach', 'paper']);

export const CreateNoteBodySchema = z.object({
    title: z.string().min(1, 'Title is required').openapi({ example: 'Note Title' }),
    content: z.string().min(1, 'Content is required').openapi({ example: 'Note Content' }),
    color: StickyColorSchema.optional().openapi({ example: 'lemon' }),
    positionX: z.coerce.number().min(0).max(100).optional(),
    positionY: z.coerce.number().min(0).max(100).optional(),
}).openapi('CreateNoteBody');

export const NoteIdParamSchema = z
    .object({ id: z.string().min(1).openapi({ example: '64b1f2c3d4e5f6a7b8c9d0e1' }) })
    .openapi('NoteIdParam');

export const UpdateNoteBodySchema = z
    .object({
        title: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        color: StickyColorSchema.optional(),
        positionX: z.coerce.number().min(0).max(100).optional(),
        positionY: z.coerce.number().min(0).max(100).optional(),
    })
    .openapi('UpdateNoteBody');

registry.registerPath({
    method: 'post',
    path: '/notes/create',
    tags: ['Notes'],
    summary: 'Create a new note',
    security: bearerAuth,
    request: { body: { content: { 'application/json': { schema: CreateNoteBodySchema } } } },
    responses: {
        201: { description: 'Note created' },
        400: { description: 'Validation error' },
    },
});