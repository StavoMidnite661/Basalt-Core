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


export const PerformanceProofSchema = z.object({
  proofId: z.string().regex(/^PRP-[A-Z0-9]+$/),
  referenceInvoiceId: z.string(),
  proofType: z.enum(['DIGITAL_SIGNATURE', 'IOT_GEOLOCATION', 'BLOCK_TIMESTAMP', 'ORACLE_FEED']),
  verificationHash: z.string(), // Cryptographic proof of work/delivery
  status: z.enum(['WAITING', 'VERIFIED', 'DISPUTED']),
  performanceDelta: z.number().min(0).max(1), // 1.0 = 100% completion
});

export const RailExitSchema = z.object({
  exitId: z.string().uuid(),
  svt_burn_hash: z.string(), // Proof that SVT was destroyed/locked in exchange for Fiat
  fiat_target: z.enum(['ACH', 'SWIFT', 'FEDWIRE']),
  iso_20022_msg_id: z.string(), // The pacs.008 or pain.001 ID
  destination_account: z.string().regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/), // IBAN Mask
  clearing_status: z.enum(['PENDING_EXIT', 'RAIL_ACKNOWLEDGED', 'SETTLED_EXTERNALLY', 'RAIL_REJECTION']),
});

export type RailExit = z.infer<typeof RailExitSchema>;
