// Mock TigerBeetle State Machine for Two-Phase Commits in the Frontend
// Enforces the "Verification Gap" mathematically using pending/posted double-entry accounting.

export enum TBFlag {
  NONE = 0,
  PENDING = 1,
  POST_PENDING = 2,
  VOID_PENDING = 3
}

export interface TBAccount {
  id: string;
  name: string;
  debits_posted: number;
  debits_pending: number;
  credits_posted: number;
  credits_pending: number;
}

export interface TBTransfer {
  id: string;
  debit_account_id: string;
  credit_account_id: string;
  amount: number;
  pending_id?: string;
  flags: TBFlag;
  timestamp: number;
}

type Listener = () => void;

export class TigerBeetleSimulator {
  accounts = new Map<string, TBAccount>();
  transfers = new Map<string, TBTransfer>();
  listeners: Listener[] = [];

  constructor() {
    this.createAccount({ id: 'TREASURY_MAIN', name: 'Treasury Cash (Asset)' });
    this.createAccount({ id: 'UCC9_RECEIVABLES', name: 'Perfected Claims (Asset)' });
    this.createAccount({ id: 'TAX_CREDIT_RESERVE', name: 'NOL Tax Shield (Asset)' });
    this.createAccount({ id: 'VENDOR_01', name: 'Accounts Payable (Liability)' });
    this.createAccount({ id: 'STORED_VALUE_TOKENS', name: 'Circulating SVT (Equity)' });
    this.createAccount({ id: 'EXTERNAL_FIAT_TRANSIT', name: 'External Rail Transit (Asset)' });
    this.createAccount({ id: 'RAIL_FEES', name: 'Legacy Friction (Expense)' });
    
    // Initial capitalization
    const t = this.accounts.get('TREASURY_MAIN')!;
    t.credits_posted = 12440000.00;

    const tx = this.accounts.get('TAX_CREDIT_RESERVE')!;
    tx.credits_posted = 440000.00;

    const svt = this.accounts.get('STORED_VALUE_TOKENS')!;
    svt.credits_posted = 8122900.50;

    const rails = this.accounts.get('RAIL_FEES')!;
    rails.debits_posted = 250.00; // Mock initial fee history
  }

  on(event: 'change', cb: Listener) {
    this.listeners.push(cb);
  }

  off(event: 'change', cb: Listener) {
    this.listeners = this.listeners.filter(l => l !== cb);
  }

  private emitChange() {
    this.listeners.forEach(l => l());
  }

  createAccount(data: { id: string, name: string }) {
    this.accounts.set(data.id, {
      id: data.id,
      name: data.name,
      debits_posted: 0,
      debits_pending: 0,
      credits_posted: 0,
      credits_pending: 0,
    });
    this.emitChange();
  }

  createTransfer(transfer: Omit<TBTransfer, 'timestamp' | 'id'>): string {
    const id = 'TRF-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const t: TBTransfer = { ...transfer, id, timestamp: Date.now() };
    
    const db = this.accounts.get(t.debit_account_id);
    const cr = this.accounts.get(t.credit_account_id);
    
    if (!db || !cr) {
      console.error("TigerBeetle: Account not found");
      return '';
    }

    if (t.flags === TBFlag.PENDING) {
      db.debits_pending += t.amount;
      cr.credits_pending += t.amount;
    } else if (t.flags === TBFlag.POST_PENDING) {
      if (!t.pending_id) throw new Error("Missing pending_id for POST_PENDING");
      const original = this.transfers.get(t.pending_id);
      if (!original || original.flags !== TBFlag.PENDING) throw new Error("Invalid pending transfer");

      db.debits_pending -= original.amount;
      cr.credits_pending -= original.amount;
      
      db.debits_posted += t.amount;
      cr.credits_posted += t.amount;
      
      original.flags = TBFlag.POST_PENDING; // Mark original as completed
    } else if (t.flags === TBFlag.VOID_PENDING) {
      if (!t.pending_id) throw new Error("Missing pending_id for VOID_PENDING");
      const original = this.transfers.get(t.pending_id);
      if (!original || original.flags !== TBFlag.PENDING) throw new Error("Invalid pending transfer");

      db.debits_pending -= original.amount;
      cr.credits_pending -= original.amount;
      
      original.flags = TBFlag.VOID_PENDING; // Mark original as voided
    } else {
      db.debits_posted += t.amount;
      cr.credits_posted += t.amount;
    }
    
    this.transfers.set(id, t);
    this.emitChange();
    return id;
  }
}

export const tbClient = new TigerBeetleSimulator();
