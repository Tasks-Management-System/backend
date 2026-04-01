import { ZodError } from 'zod';

/**
 * Validates req.body, req.params, and req.query against provided Zod schemas.
 * @param {{ body?: import('zod').ZodTypeAny, params?: import('zod').ZodTypeAny, query?: import('zod').ZodTypeAny }} schemas
 */
export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.params) {
      // req.params is a plain object set by the router — safe to reassign
      req.params = schemas.params.parse(req.params);
    }
    if (schemas.query) {
      // Express 5 makes req.query a read-only getter, so we validate only
      // and write coerced values back via Object.assign on the existing object
      const parsed = schemas.query.parse(req.query);
      Object.assign(req.query, parsed);
    }
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Zod v3 exposes `errors`; Zod v4 exposes `issues`.
      const issues = Array.isArray(error.errors)
        ? error.errors
        : Array.isArray(error.issues)
          ? error.issues
          : [];
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: issues.map((e) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : '',
          message: e.message,
        })),
      });
    }
    next(error);
  }
};
