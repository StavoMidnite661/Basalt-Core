import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import db from '../models/db';
import { logAuditEvent } from '../services/audit';
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sovrcor-transient-secret';
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  if (!user) {
    const id = randomUUID();
    const role = username.toLowerCase().includes('admin') ? 'TREASURY' : 'VENDOR';
    db.prepare('INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)').run(id, username, bcrypt.hashSync(password, 10), role);
    user = { id, username, role, password_hash: bcrypt.hashSync(password, 10) };
    logAuditEvent('USER_AUTO_REGISTERED', 'AUTH', id);
  }
  if (bcrypt.compareSync(password, user.password_hash)) {
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    logAuditEvent('USER_LOGIN_SUCCESS', 'AUTH', user.id);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } else res.status(401).json({ error: 'INVALID_CREDENTIALS' });
});
export default router;
