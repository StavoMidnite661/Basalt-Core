import { randomUUID, createHash } from 'crypto';
import db from '../models/db';

export interface AuditEntry {
  id: string;
  action: string;
  module: string;
  hash: string;
  user_id?: string;
  timestamp: number;
}

export function logAuditEvent(action: string, module: string, user_id?: string, customHash?: string) {
  const id = randomUUID();
  const timestamp = Date.now();
  const recordContent = `${id}|${action}|${module}|${user_id || 'SYSTEM'}|${timestamp}`;
  const hash = customHash || '0x' + createHash('sha256').update(recordContent).digest('hex');
  db.prepare(`INSERT INTO audit_logs (id, action, module, hash, user_id, timestamp) VALUES (?, ?, ?, ?, ?, ?)`).run(id, action, module, hash, user_id || null, timestamp);
  return id;
}

export function getAuditLogs(limit = 100) {
  return db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?').all(limit);
}
