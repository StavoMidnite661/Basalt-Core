import { Router } from 'express';
import { LedgerService } from '../services/ledger';
import { authenticateJWT, AuthRequest, authorizeRole } from '../middleware/auth';
import { getAuditLogs } from '../services/audit';

const router = Router();

router.get('/accounts', authenticateJWT, (req, res) => {
  res.json(LedgerService.getAccounts());
});

router.get('/transfers', authenticateJWT, (req, res) => {
  res.json(LedgerService.getTransfers());
});

router.post('/transfers', authenticateJWT, (req: AuthRequest, res) => {
  try {
    const id = LedgerService.createTransfer(req.body, req.user?.id);
    res.status(201).json({ id });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/audit', authenticateJWT, authorizeRole(['TREASURY']), (req, res) => {
  res.json(getAuditLogs());
});

export default router;
