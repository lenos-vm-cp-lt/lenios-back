export function autorizar(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const userRole = (req.usuario.rol || '').toLowerCase().trim();
    const normalizedUserRole = userRole === 'client' ? 'cliente' : userRole;

    const normalizedAllowedRoles = rolesPermitidos.map((r) => {
      const lower = r.toLowerCase().trim();
      return lower === 'client' ? 'cliente' : lower;
    });

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }

    return next();
  };
}

