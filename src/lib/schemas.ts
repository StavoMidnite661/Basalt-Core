import { z } from "zod";

export const SignatureSchema = z.object({
  nodeId: z.string(),
  signature_hash: z.string(),
  timestamp: z.number(),
});

export const QuorumTransactionSchema = z.object({
  txId: z.string().regex(/^TXN-[A-Z0-9]+$/),
  amount: z.number(),
  asset_source: z.string(),
  signatures: z.array(SignatureSchema),
  threshold: z.number().default(3),
  total_nodes: z.number().default(5),
  status: z.enum(['STAGING', 'BROADCASTING', 'COMMITTED', 'EXPIRED']),
});

export type Signature = z.infer<typeof SignatureSchema>;
export type QuorumTransaction = z.infer<typeof QuorumTransactionSchema>;

export const ClearingEventSchema = z.object({
  timestamp: z.number(),
  eventId: z.string(),
  instrument: z.object({
    instrumentId: z.string(),
    type: z.enum(["PROMISSORY_NOTE", "BILL_OF_EXCHANGE"]),
    iso_20022_type: z.string(),
    value: z.object({
      amount: z.number(),
      currency: z.string(),
    }),
    ucc9_status: z.string(),
    hash_signature: z.string(),
  }),
  status: z.string(),
  authority_node: z.string(),
});

export type ClearingEvent = z.infer<typeof ClearingEventSchema>;

export const TaxIncentiveSchema = z.object({
  id: z.string(),
  category: z.enum(['HOUSING', 'ENERGY', 'BUSINESS_INV', 'RETIREMENT']),
  type: z.enum(['DEDUCTION', 'CREDIT']),
  legal_authority: z.string(), // e.g., "IRC Section 179" or "Statutes at Large"
  face_value: z.number(),
  mechanical_effect: z.enum(['BASE_EROSION', 'DEBT_ERASURE']),
  status: z.enum(['POTENTIAL', 'ACCRUED', 'REALIZED']),
});

export type TaxIncentive = z.infer<typeof TaxIncentiveSchema>;

export const TreasuryMetricsSchema = z.object({
  total_net_equity: z.number(),      // TNE = (Cash + Perfected Assets + NOL)
  collateral_coverage_ratio: z.number(), // Target > 1.2
  minting_capacity: z.number(),      // Unused equity available for credit issuance
  minting_velocity: z.number(),      // Current EPS of new credit issuance
  reserve_ratio: z.number(),         // Percentage of TNE held in High-Quality Liquid Assets
  last_settlement_hash: z.string(),
});

export type TreasuryMetrics = z.infer<typeof TreasuryMetricsSchema>;
