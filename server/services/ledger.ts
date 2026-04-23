import { randomUUID } from 'crypto';
import db from '../models/db';
import { logAuditEvent } from './audit';

export enum TBFlag { NONE = 0, PENDING = 1, POST_PENDING = 2, VOID_PENDING = 3 }
export interface TBAccount { id: string; name: string; debits_posted: number; debits_pending: number; credits_posted: number; credits_pending: number; }
export interface TBTransfer { id: string; debit_account_id: string; credit_account_id: string; amount: number; pending_id?: string; flags: TBFlag; timestamp: number; }

export class LedgerService {
  static getAccounts(): TBAccount[] { return db.prepare('SELECT * FROM accounts').all() as TBAccount[]; }
  static getAccount(id: string): TBAccount | undefined { return db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as TBAccount; }
  static getTransfers(limit = 50): TBTransfer[] { return db.prepare('SELECT * FROM transfers ORDER BY timestamp DESC LIMIT ?').all(limit) as TBTransfer[]; }
  static createTransfer(transfer: Omit<TBTransfer, 'timestamp' | 'id'>, userId?: string): string {
    const id = 'TRF-' + randomUUID().substring(0, 8).toUpperCase();
    const timestamp = Date.now();
    const transaction = db.transaction(() => {
      if (transfer.flags === TBFlag.PENDING) {
        db.prepare('UPDATE accounts SET debits_pending = debits_pending + ? WHERE id = ?').run(transfer.amount, transfer.debit_account_id);
        db.prepare('UPDATE accounts SET credits_pending = credits_pending + ? WHERE id = ?').run(transfer.amount, transfer.credit_account_id);
        logAuditEvent('TWO_PHASE_COMMIT_PREPARE', 'TIGERBEETLE', userId);
      } else if (transfer.flags === TBFlag.POST_PENDING) {
        const original = db.prepare('SELECT * FROM transfers WHERE id = ?').get(transfer.pending_id) as TBTransfer;
        db.prepare('UPDATE accounts SET debits_pending = debits_pending - ? WHERE id = ?').run(original.amount, original.debit_account_id);
        db.prepare('UPDATE accounts SET credits_pending = credits_pending - ? WHERE id = ?').run(original.amount, original.credit_account_id);
        db.prepare('UPDATE accounts SET debits_posted = debits_posted + ? WHERE id = ?').run(transfer.amount, transfer.debit_account_id);
        db.prepare('UPDATE accounts SET credits_posted = credits_posted + ? WHERE id = ?').run(transfer.amount, transfer.credit_account_id);
        db.prepare('UPDATE transfers SET flags = ? WHERE id = ?').run(TBFlag.POST_PENDING, transfer.pending_id);
        logAuditEvent('TWO_PHASE_COMMIT_COMMIT', 'TIGERBEETLE', userId);
      } else {
        db.prepare('UPDATE accounts SET debits_posted = debits_posted + ? WHERE id = ?').run(transfer.amount, transfer.debit_account_id);
        db.prepare('UPDATE accounts SET credits_posted = credits_posted + ? WHERE id = ?').run(transfer.amount, transfer.credit_account_id);
      }
      db.prepare('INSERT INTO transfers (id, debit_account_id, credit_account_id, amount, pending_id, flags, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, transfer.debit_account_id, transfer.credit_account_id, transfer.amount, transfer.pending_id || null, transfer.flags, timestamp);
      return id;
    });
    return transaction();
  }
}
