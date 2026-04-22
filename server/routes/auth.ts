import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import db from '../models/db';
import { logAuditEvent } from '../services/audit';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET not set in environment. Using transient secret.");
}

const secret = JWT_SECRET || 'sovrcor-transient-secret';

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

  if (!user) {
    // In a production NIST environment, auto-registration is forbidden.
    // For this demo/transition phase, we'll allow it but log it as a security event.
    const id = randomUUID();
    const role = username.toLowerCase().includes('admin') ? 'TREASURY' : 'VENDOR';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    db.prepare('INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)')
      .run(id, username, hash, role);

    user = { id, username, password_hash: hash, role };
    logAuditEvent('USER_AUTO_REGISTERED', 'AUTH', id);
  }

  if (bcrypt.compareSync(password, user.password_hash)) {
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '8h' }
    );

    logAuditEvent('USER_LOGIN_SUCCESS', 'AUTH', user.id);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } else {
    logAuditEvent('USER_LOGIN_FAILURE', 'AUTH', undefined, `Username: ${username}`);
    res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  }
});

export default router;
