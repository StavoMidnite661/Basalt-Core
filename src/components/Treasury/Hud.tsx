import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TreasuryMetrics, QuorumTransaction } from '../../lib/schemas';
import QuorumStaging from './QuorumStaging';

export default function TreasuryHud({ onMint, systemFault, onAudit }: { onMint?: () => void, systemFault?: boolean, onAudit?: (action: string, module: string, hash?: string) => void }) {
  const [metrics, setMetrics] = useState<TreasuryMetrics>({
    total_net_equity: 12440000.00, // Includes the $440k NOL asset
    collateral_coverage_ratio: 1.42,
    minting_capacity: 4200000.00,
    minting_velocity: 142.5,
    reserve_ratio: 0.15,
    last_settlement_hash: "0x7b2...f92a",
  });

  const [mintTarget, setMintTarget] = useState(0);
  const [pendingTx, setPendingTx] = useState<QuorumTransaction | null>(null);

  const handleInitiateMint = () => {
    if (mintTarget <= 0 || systemFault) return;
    setPendingTx({
      txId: `TXN-${Math.random().toString(36).toUpperCase().slice(2, 10)}`,
      amount: mintTarget,
      asset_source: "UCC9-NOL-440K",
      signatures: [],
      threshold: 3,
      total_nodes: 5,
      status: 'STAGING',
    });
    if (onAudit) onAudit('QUORUM_SEQUENCE_INITIATED', 'TREASURY');
  };

  const handleConsensusReached = (tx: QuorumTransaction) => {
    if (onMint) onMint();
    if (onAudit) onAudit('ATOMIC_MINT_FINALIZED', 'TREASURY', tx.txId);
    
    setMetrics(prev => ({
      ...prev,
      minting_capacity: prev.minting_capacity - tx.amount,
      total_net_equity: prev.total_net_equity + tx.amount,
      last_settlement_hash: tx.signatures[0]?.signature_hash.substring(0, 10) + "..." || "0x..."
    }));
    
    setPendingTx(null);
    setMintTarget(0);
  };

  const handleSignatureAdded = (nodeId: string, hash: string) => {
    if (onAudit) onAudit(`NODE_SIGNATURE_ACQUIRED_${nodeId}`, 'QUORUM', hash);
  };

  return (
    <div className="p-4 md:p-6 h-full bg-basalt-bg flex flex-col gap-4 md:gap-6 font-mono overflow-y-auto min-h-0 max-w-6xl mx-auto w-full">
      {/* 05_TREASURY_AUTHORITY_HEADER */}
      <div className="border-b border-basalt-800 pb-2 md:pb-4 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center shrink-0 gap-4 sm:gap-0">
        <div>
          <h1 className="text-lg md:text-xl font-black tracking-tighter text-white">04_STORED_VALUE_ISSUANCE</h1>
          <p className="text-[8px] md:text-[10px] text-zinc-500 uppercase italic font-bold tracking-widest mt-0.5 md:mt-1">UCC-9 Backed Private Credit</p>
        </div>
        <div className="flex gap-4 md:gap-8 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide shrink-0">
          <TrendStat label="TNE" value={`$${(metrics.total_net_equity/1000000).toFixed(2)}M`} color="text-authority-cyan" />
          <TrendStat label="CCR" value={metrics.collateral_coverage_ratio.toFixed(2)} color="text-authority-amber" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 flex-1 min-h-0">
        {/* Main Equity Pulse (The "Mechanical Lung") */}
        <div className="col-span-1 lg:col-span-8 bg-basalt-panel border border-basalt-800 p-4 md:p-8 relative overflow-hidden flex flex-col min-h-[300px] lg:min-h-0 shrink-0 lg:shrink">
          <div className="absolute top-2 right-2 md:top-4 md:right-4 text-[6px] md:text-[8px] text-zinc-700 uppercase font-bold tracking-widest bg-basalt-panel z-10 px-1">Equity_Liquidity_Oscillation</div>
          
          <div className="h-32 md:h-64 flex items-end gap-0.5 md:gap-1 flex-1">
            {/* Simulated Real-Time Equity Waves */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="w-full bg-authority-cyan/20 border-t border-authority-cyan"
                initial={{ height: "20%" }}
                animate={{ height: [`${20 + Math.random() * 40}%`, `${30 + Math.random() * 50}%`, "25%"] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
          
          <div className="mt-4 md:mt-6 grid grid-cols-3 gap-2 md:gap-4 border-t border-basalt-800 pt-4 md:pt-6 shrink-0">
            <MetricBlock label="RESERVE_RATIO" value={`${(metrics.reserve_ratio * 100).toFixed(1)}%`} />
            <MetricBlock label="MINT_VELOCITY" value={`${metrics.minting_velocity} EPS`} />
            <MetricBlock label="CAPA_REMAIN" value={`$${(metrics.minting_capacity/1000).toFixed(0)}K`} />
          </div>
        </div>

        {/* Authority Control Panel */}
        <div className="col-span-1 lg:col-span-4 space-y-4 flex flex-col min-h-0 shrink-0 lg:shrink">
          <div className="bg-basalt-950 border border-basalt-800 p-4 md:p-6 flex flex-col justify-between h-full chamfer-br">
            {pendingTx ? (
              <QuorumStaging 
                pendingTx={pendingTx} 
                onConsensusReached={handleConsensusReached}
                onSignatureAdded={handleSignatureAdded}
              />
            ) : (
            <>
              <div>
                <h3 className="text-[10px] font-black text-white mb-6 tracking-widest uppercase underline decoration-authority-cyan underline-offset-4">Minting_Controls</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-[8px] text-zinc-500 block font-bold tracking-widest">TARGET_MINT_QUANTITY</label>
                      <span className="text-[8px] text-authority-cyan">MAX: ${(metrics.minting_capacity).toLocaleString()}</span>
                    </div>
                    <div className="text-2xl font-black text-white tabular-nums tracking-wider">${mintTarget.toLocaleString()}</div>
                    <input 
                      type="range" 
                      min="0" 
                      max={metrics.minting_capacity} 
                      step="10000"
                      value={mintTarget}
                      onChange={(e) => setMintTarget(Number(e.target.value))}
                      disabled={systemFault}
                      className="w-full h-1 bg-basalt-800 appearance-none accent-authority-cyan mt-4 cursor-pointer disabled:opacity-50" 
                    />
                  </div>

                  <div className="p-4 bg-basalt-bg border border-basalt-800">
                    <div className="text-[9px] text-zinc-500 mb-2 font-bold tracking-widest">REQUIRED_COLLATERAL_ADJUSTMENT</div>
                    <div className="text-xs font-black text-authority-amber tracking-wider">+ $440,000 (NOL_ASSET_LOCKED)</div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleInitiateMint}
                disabled={mintTarget <= 0 || systemFault}
                className="w-full py-4 bg-authority-cyan text-black font-black text-xs tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)] disabled:opacity-50 disabled:shadow-none disabled:hover:bg-authority-cyan mt-6"
              >
                INITIATE_QUORUM_SEQUENCE
              </button>
            </>
          )}
        </div>
      </div>
      </div> {/* Closes grid grid-cols-1 lg:grid-cols-12 */}

      {/* Settlement Log Footnote */}
      <div className="bg-basalt-panel border border-basalt-800 p-3 md:p-4 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center shrink-0 gap-2 sm:gap-0">
        <div className="text-[8px] md:text-[9px] text-zinc-500 font-bold tracking-widest break-all">
          LAST_SETTLEMENT: <span className="text-zinc-300 ml-1 md:ml-2">{metrics.last_settlement_hash}</span>
        </div>
        <div className="flex gap-4 md:gap-6 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 items-center justify-between sm:justify-end">
          <span className="text-[8px] md:text-[9px] text-green-500 font-bold tracking-widest italic animate-pulse flex items-center gap-1.5 md:gap-2">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 shrink-0" />
            CLEARING_HOUSE_ONLINE
          </span>
          <span className="text-[8px] md:text-[9px] text-zinc-500 font-bold tracking-widest shrink-0">UCC-9_SYNC: 100%</span>
        </div>
      </div>
    </div>
  );
}

function TrendStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-right">
      <div className="text-[8px] text-zinc-500 font-bold tracking-widest mb-1">{label}</div>
      <div className={`text-xl font-black ${color} tracking-wider tabular-nums`}>{value}</div>
    </div>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[8px] text-zinc-500 font-bold mb-1 tracking-widest">{label}</div>
      <div className="text-sm font-black text-white tabular-nums tracking-wider">{value}</div>
    </div>
  );
}
