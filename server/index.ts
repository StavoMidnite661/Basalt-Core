import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './models/db';
import authRoutes from './routes/auth';
import ledgerRoutes from './routes/ledger';
import performanceRoutes from './routes/performance';
import { logAuditEvent } from './services/audit';

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Initialize Database
initDb();

app.use(cors());
app.use(express.json());

// Request logging middleware for NIST AU
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/performance', performanceRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: Date.now() });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('UNHANDLED_ERROR:', err);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`SOVRCOR Backend running on port ${PORT}`);
  logAuditEvent('SYSTEM_BOOT', 'CORE');
});
