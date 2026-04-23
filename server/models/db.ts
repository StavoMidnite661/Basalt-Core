import Database from 'better-sqlite3';

const dbPath = process.env.DB_PATH || 'sovrcor.db';
const db = new Database(dbPath);

// Enable WAL mode for performance
db.pragma('journal_mode = WAL');

// Initialize Tables
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('TREASURY', 'VENDOR', 'ADMIN'))
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      debits_posted REAL DEFAULT 0,
      debits_pending REAL DEFAULT 0,
      credits_posted REAL DEFAULT 0,
      credits_pending REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS transfers (
      id TEXT PRIMARY KEY,
      debit_account_id TEXT NOT NULL,
      credit_account_id TEXT NOT NULL,
      amount REAL NOT NULL,
      pending_id TEXT,
      flags INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY(debit_account_id) REFERENCES accounts(id),
      FOREIGN KEY(credit_account_id) REFERENCES accounts(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      hash TEXT NOT NULL,
      user_id TEXT,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS performance_proofs (
      id TEXT PRIMARY KEY,
      reference_invoice_id TEXT NOT NULL,
      proof_type TEXT NOT NULL,
      verification_hash TEXT NOT NULL,
      status TEXT NOT NULL,
      performance_delta REAL NOT NULL,
      timestamp INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tax_assets (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      legal_authority TEXT NOT NULL,
      face_value REAL NOT NULL,
      mechanical_effect TEXT NOT NULL,
      status TEXT NOT NULL
    );
  `);

  // Seed initial data if accounts are empty
  const accountCount = db.prepare('SELECT COUNT(*) as count FROM accounts').get() as { count: number };
  if (accountCount.count === 0) {
    const insertAccount = db.prepare('INSERT INTO accounts (id, name, credits_posted) VALUES (?, ?, ?)');
    insertAccount.run('TREASURY_MAIN', 'Treasury Cash (Asset)', 12440000.00);
    insertAccount.run('TAX_CREDIT_RESERVE', 'NOL Tax Shield (Asset)', 440000.00);
    insertAccount.run('STORED_VALUE_TOKENS', 'Circulating SVT (Equity)', 8122900.50);
    insertAccount.run('VENDOR_01', 'Accounts Payable (Liability)', 0);
    insertAccount.run('EXTERNAL_FIAT_TRANSIT', 'External Rail Transit (Asset)', 0);
    insertAccount.run('RAIL_FEES', 'Legacy Friction (Expense)', 250.00);
  }
}

export default db;
