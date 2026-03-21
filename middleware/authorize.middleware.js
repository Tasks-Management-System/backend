/**
 * Role-based access control middleware.
 * Must be used AFTER authenticateMiddleware (requires req.user to be set).
 *
 * Usage:
 *   authorize('admin')
 *   authorize('admin', 'hr')
 *   authorize('admin', 'manager', 'hr')
 *
 * @param {...('admin'|'employee'|'hr'|'manager')} allowedRoles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.',
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}.`,
      });
    }

    next();
  };
};
