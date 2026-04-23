import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TreasuryMetrics, QuorumTransaction } from '../../lib/schemas';
import QuorumStaging from './QuorumStaging';
import { api } from '../../lib/api-client';

export default function TreasuryHud({ onMint, systemFault, onAudit }: { onMint?: () => void, systemFault?: boolean, onAudit?: (action: string, module: string, hash?: string) => void }) {
  const [metrics, setMetrics] = useState<TreasuryMetrics>({ total_net_equity: 12440000.00, collateral_coverage_ratio: 1.42, minting_capacity: 4200000.00, minting_velocity: 142.5, reserve_ratio: 0.15, last_settlement_hash: "0x7b2...f92a" });
  const [mintTarget, setMintTarget] = useState(0);
  const [pendingTx, setPendingTx] = useState<QuorumTransaction | null>(null);

  const handleInitiateMint = () => {
    if (mintTarget <= 0 || systemFault) return;
    setPendingTx({ txId: `TXN-${Math.random().toString(36).toUpperCase().slice(2, 10)}`, amount: mintTarget, asset_source: "UCC9-NOL-440K", signatures: [], threshold: 3, total_nodes: 5, status: 'STAGING' });
    if (onAudit) onAudit('QUORUM_SEQUENCE_INITIATED', 'TREASURY');
  };

  const handleConsensusReached = async (tx: QuorumTransaction) => {
    try {
      await api.createTransfer({ debit_account_id: 'TAX_CREDIT_RESERVE', credit_account_id: 'TREASURY_MAIN', amount: tx.amount, flags: 0 });
      if (onMint) onMint();
      if (onAudit) onAudit('ATOMIC_MINT_FINALIZED', 'TREASURY', tx.txId);
      setMetrics(prev => ({ ...prev, minting_capacity: prev.minting_capacity - tx.amount, total_net_equity: prev.total_net_equity + tx.amount, last_settlement_hash: tx.signatures[0]?.signature_hash.substring(0, 10) + "..." }));
      setPendingTx(null); setMintTarget(0);
    } catch (e) { console.error("Minting failed", e); }
  };

  return (
    <div className="p-6 h-full bg-basalt-bg flex flex-col gap-6 font-mono overflow-y-auto min-h-0">
      <div className="border-b border-basalt-800 pb-4 flex justify-between items-center">
        <div><h1 className="text-xl font-black text-white uppercase">04_Stored_Value_Issuance</h1></div>
        <div className="flex gap-8"><div className="text-right text-[10px] font-bold uppercase text-zinc-500">TNE <div className="text-xl text-authority-cyan">${(metrics.total_net_equity/1000000).toFixed(2)}M</div></div></div>
      </div>
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="col-span-8 bg-basalt-panel border border-basalt-800 p-8 relative flex flex-col">
          <div className="h-64 flex items-end gap-1 flex-1">{[...Array(20)].map((_, i) => <motion.div key={i} className="w-full bg-authority-cyan/20 border-t border-authority-cyan" animate={{ height: [`${20+Math.random()*40}%`, `${30+Math.random()*50}%`, "25%"] }} transition={{ duration: 3, repeat: Infinity, delay: i*0.1 }} />)}</div>
        </div>
        <div className="col-span-4 bg-basalt-950 border border-basalt-800 p-6 flex flex-col justify-between">
          {pendingTx ? <QuorumStaging pendingTx={pendingTx} onConsensusReached={handleConsensusReached} /> : (
            <>
              <div>
                <h3 className="text-[10px] font-black text-white mb-6 uppercase underline decoration-authority-cyan">Minting_Controls</h3>
                <div className="space-y-6">
                  <div><label className="text-[8px] text-zinc-500 block uppercase font-bold">Target Mint Quantity</label><div className="text-2xl font-black text-white tabular-nums">${mintTarget.toLocaleString()}</div><input type="range" min="0" max={metrics.minting_capacity} step="10000" value={mintTarget} onChange={(e) => setMintTarget(Number(e.target.value))} className="w-full h-1 bg-basalt-800 accent-authority-cyan mt-4 appearance-none" /></div>
                </div>
              </div>
              <button onClick={handleInitiateMint} disabled={mintTarget <= 0 || systemFault} className="w-full py-4 bg-authority-cyan text-black font-black text-xs uppercase tracking-widest hover:bg-white transition-all">Initiate Quorum</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
