import { Router } from 'express';
import db from '../models/db';
import { authenticateJWT } from '../middleware/auth';
import { logAuditEvent } from '../services/audit';
import { randomUUID } from 'crypto';
const router = Router();
router.get('/proofs', authenticateJWT, (req, res) => res.json(db.prepare('SELECT * FROM performance_proofs ORDER BY timestamp DESC').all()));
router.post('/proofs', authenticateJWT, (req: any, res) => {
  const { reference_invoice_id, proof_type, verification_hash, performance_delta } = req.body;
  const id = 'PRP-' + randomUUID().substring(0, 8).toUpperCase();
  db.prepare('INSERT INTO performance_proofs (id, reference_invoice_id, proof_type, verification_hash, status, performance_delta, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, reference_invoice_id, proof_type, verification_hash, 'VERIFIED', performance_delta, Date.now());
  logAuditEvent('PERFORMANCE_PROOF_SUBMITTED', 'PERFORMANCE', req.user?.id, verification_hash);
  res.status(201).json({ id, status: 'VERIFIED' });
});
export default router;
