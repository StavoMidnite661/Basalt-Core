import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'sovrcor-transient-secret';
export const authenticateJWT = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else res.sendStatus(401);
};
export const authorizeRole = (roles: string[]) => (req: any, res: any, next: any) => {
  if (!req.user || !roles.includes(req.user.role)) return res.sendStatus(403);
  next();
};
