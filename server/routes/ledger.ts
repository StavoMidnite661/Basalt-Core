import { Router } from 'express';
import { LedgerService } from '../services/ledger';
import { authenticateJWT, authorizeRole } from '../middleware/auth';
import { getAuditLogs } from '../services/audit';
const router = Router();
router.get('/accounts', authenticateJWT, (req, res) => res.json(LedgerService.getAccounts()));
router.get('/transfers', authenticateJWT, (req, res) => res.json(LedgerService.getTransfers()));
router.post('/transfers', authenticateJWT, (req: any, res) => {
  try { res.status(201).json({ id: LedgerService.createTransfer(req.body, req.user?.id) }); }
  catch (e: any) { res.status(400).json({ error: e.message }); }
});
router.get('/audit', authenticateJWT, authorizeRole(['TREASURY']), (req, res) => res.json(getAuditLogs()));
export default router;
