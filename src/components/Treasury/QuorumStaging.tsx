import React, { useState } from "react";
import { motion } from "motion/react";
import { QuorumTransaction, Signature } from "../../lib/schemas";

export default function QuorumStaging({ 
  pendingTx, 
  onConsensusReached,
  onSignatureAdded
}: { 
  pendingTx: QuorumTransaction | null, 
  onConsensusReached: (tx: QuorumTransaction) => void,
  onSignatureAdded?: (nodeId: string, hash: string) => void
}) {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const nodes = ["TB_NODE_01", "TB_NODE_02", "TB_NODE_03", "TB_NODE_04", "TB_NODE_05"];

  const addSignature = (nodeId: string) => {
    if (signatures.some(s => s.nodeId === nodeId)) return;
    
    // Generate mock ECDSA hash
    const hash = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
    
    const newSig: Signature = {
      nodeId,
      signature_hash: hash,
      timestamp: Date.now()
    };
    
    const newSigs = [...signatures, newSig];
    setSignatures(newSigs);
    
    if (onSignatureAdded) {
      onSignatureAdded(nodeId, hash);
    }
    
    if (newSigs.length >= (pendingTx?.threshold || 3)) {
      setTimeout(() => onConsensusReached({ ...pendingTx!, signatures: newSigs, status: 'COMMITTED' }), 800);
    }
  };

  if (!pendingTx) return (
    <div className="h-full flex items-center justify-center border border-dashed border-basalt-800 text-[10px] text-zinc-700 italic">
      NO_PENDING_TRANSACTIONS_IN_STAGING
    </div>
  );

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="bg-black p-4 border border-basalt-800">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black text-white">PROPOSED_MINT_EVENT: {pendingTx.txId}</span>
          <span className="text-authority-cyan text-[10px] tracking-widest animate-pulse">
            {signatures.length}/{pendingTx.threshold}_SIGNATURES_COLLECTED
          </span>
        </div>
        <div className="text-2xl font-black text-white mb-1">${pendingTx.amount.toLocaleString()}</div>
        <div className="text-[8px] text-zinc-500 uppercase">Collateral_Base: {pendingTx.asset_source}</div>
      </div>

      {/* Signature Grid */}
      <div className="grid grid-cols-5 gap-2 flex-1">
        {nodes.map((nodeId) => {
          const sig = signatures.find(s => s.nodeId === nodeId);
          const isSigned = !!sig;
          return (
            <div 
              key={nodeId}
              onClick={() => addSignature(nodeId)}
              className={`h-full min-h-[80px] border flex flex-col items-center justify-center cursor-pointer transition-all ${
                isSigned ? "bg-authority-cyan/20 border-authority-cyan consensus-ripple" : "bg-basalt-900 border-basalt-800 hover:border-zinc-600"
              }`}
            >
              <div className={`w-2 h-2 mb-2 ${isSigned ? "bg-authority-cyan shadow-[0_0_10px_#00f2ff]" : "bg-zinc-800"}`} />
              <span className={`text-[7px] font-bold ${isSigned ? "text-white" : "text-zinc-600"}`}>{nodeId.replace('TB_NODE_', 'N_')}</span>
              {isSigned && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[5px] text-authority-cyan mt-1 truncate w-full px-1 text-center">
                  {sig.signature_hash.substring(0, 8)}...
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-1 bg-basalt-900 w-full overflow-hidden shrink-0">
        <motion.div 
          className="h-full bg-authority-cyan"
          initial={{ width: "0%" }}
          animate={{ width: `${(signatures.length / (pendingTx.threshold || 3)) * 100}%` }}
        />
      </div>
      
      <p className="text-[8px] text-zinc-600 leading-tight italic shrink-0">
        CAUTION: Gathering {pendingTx.threshold} of {pendingTx.total_nodes} signatures triggers an irreversible atomic broadcast to the settlement rail. 
        Once quorum is reached, the transaction enters the Mechanical Truth stream.
      </p>
    </div>
  );
}
