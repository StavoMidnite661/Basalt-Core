import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { tbClient, TBFlag } from "../../lib/tigerbeetle";

export default function PerformanceBridge({ onVerify }: { onVerify?: () => void }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick(t => t + 1);
    tbClient.on('change', handler);
    return () => tbClient.off('change', handler);
  }, []);

  // Filter transfers intended for Vendor 1 that are still pending
  const pendingTransfers = Array.from(tbClient.transfers.values())
    .filter(t => t.flags === TBFlag.PENDING && t.credit_account_id === 'VENDOR_01');
  
  const hasPending = pendingTransfers.length > 0;
  
  const vendorAccount = tbClient.accounts.get('VENDOR_01');
  const totalPosted = vendorAccount?.credits_posted || 0;
  
  // Calculate a visual score. Real score is determined by external oracle, we simulate here.
  const performanceScore = hasPending ? 33.4 : (totalPosted > 0 ? 100 : 0);

  const handleOracleVerify = () => {
    pendingTransfers.forEach(pt => {
      tbClient.createTransfer({
        debit_account_id: pt.debit_account_id,
        credit_account_id: pt.credit_account_id,
        amount: pt.amount,
        pending_id: pt.id,
        flags: TBFlag.POST_PENDING
      });
    });
    if (onVerify) onVerify();
  };

  const handleDispute = () => {
    pendingTransfers.forEach(pt => {
      tbClient.createTransfer({
        debit_account_id: pt.debit_account_id,
        credit_account_id: pt.credit_account_id,
        amount: pt.amount,
        pending_id: pt.id,
        flags: TBFlag.VOID_PENDING
      });
    });
  };

  return (
    <div className="p-4 md:p-6 bg-basalt-bg font-mono h-full flex flex-col max-w-6xl mx-auto min-h-0 overflow-y-auto lg:overflow-visible">
      <div className="border-b border-basalt-800 pb-2 md:pb-4 shrink-0 mb-4 md:mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4 sm:gap-0">
        <div>
          <h2 className="text-lg md:text-xl font-black text-white tracking-widest uppercase truncate">02_PERF_VERIFICATION</h2>
          <p className="text-[8px] md:text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-0.5 md:mt-1 truncate">Mechanical Oracle: ACTIVE</p>
        </div>
        <div className="flex gap-2 md:gap-4 w-full sm:w-auto shrink-0">
          <button 
            onClick={handleDispute}
            disabled={!hasPending}
            className={`flex-1 sm:flex-none px-2 md:px-4 py-2 text-[8px] md:text-[10px] font-bold tracking-widest transition-colors ${hasPending ? 'bg-mechanical-red hover:bg-white text-black' : 'bg-basalt-900 border border-basalt-800 text-zinc-600 cursor-not-allowed'}`}
          >
            DISPUTE
          </button>
          <button 
            onClick={handleOracleVerify}
            disabled={!hasPending}
            className={`flex-1 sm:flex-none px-4 py-2 text-[8px] md:text-[10px] font-bold tracking-widest transition-colors ${hasPending ? 'bg-authority-cyan hover:bg-white text-black' : 'bg-basalt-900 border border-basalt-800 text-zinc-600 cursor-not-allowed'}`}
          >
            INJECT PROOF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 flex-1 min-h-0 shrink-0 lg:shrink">
        {/* Verification Stream */}
        <div className="border border-basalt-800 bg-basalt-panel p-4 md:p-6 flex flex-col min-h-[300px] lg:min-h-0 shrink-0 lg:shrink">
          <h3 className="text-[10px] font-bold text-zinc-400 mb-4 tracking-widest shrink-0 uppercase">INCOMING_ORACLE_DATA</h3>
          <div className="space-y-3 overflow-y-auto pr-2">
             <OracleItem label="GPS_DELIVERY_CONFIRMATION" status={hasPending ? "PENDING" : "VERIFIED"} value={hasPending ? "TRACKING..." : "LAT: 34.05 / LONG: -118.24"} />
             <OracleItem label="VENDOR_DIGITAL_RECEIPT" status={hasPending ? "WAITING" : "VERIFIED"} value={hasPending ? "..." : "SIGNED_BY: NODE_VENDOR_04"} />
             <OracleItem label="QUALITY_CONTROL_PING" status={hasPending ? "PENDING" : "VERIFIED"} value={hasPending ? "WAITING_FOR_SENSORS..." : "PASS: A-GRADE"} />
             <OracleItem label="WEIGHT_SCALE_TELEMETRY" status={hasPending ? "WAITING" : "VERIFIED"} value={hasPending ? "null" : "4,200 LBS DETECTED"} />
          </div>
        </div>

        {/* The Gatekeeper */}
        <div className={`border-l-4 p-4 md:p-6 flex flex-col justify-between shadow-2xl transition-colors min-h-[300px] lg:min-h-0 shrink-0 lg:shrink ${hasPending ? 'bg-basalt-950 border-authority-amber' : 'bg-basalt-950 border-basalt-green'}`}>
          <div>
            <div className={`text-[12px] md:text-[14px] font-black mb-4 uppercase tracking-widest flex items-center gap-2 ${hasPending ? 'text-authority-amber' : 'text-basalt-green'}`}>
              <span className={`w-2 h-2 shrink-0 ${hasPending ? 'bg-authority-amber animate-pulse' : 'bg-basalt-green'}`}></span>
              <span className="truncate">{hasPending ? '!!_GATE_LOCKED' : '//_GATE_CLEARED'}</span>
            </div>
            {hasPending ? (
              <p className="text-[10px] md:text-xs text-zinc-400 leading-loose mt-4 border border-basalt-800 p-3 md:p-4 bg-basalt-900/50">
                Securitization (UCC-9) cannot proceed. Total Performance Score is currently <span className="text-white font-black">{performanceScore.toFixed(1)}%</span>. 
                <br/><br/>
                Required threshold for Seigniorage is <span className="text-authority-cyan font-black">100.0%</span>.
              </p>
            ) : (
               <p className="text-[10px] md:text-xs text-zinc-400 leading-loose mt-4 border border-basalt-800 p-3 md:p-4 bg-basalt-900/50">
                TigerBeetle POST_PENDING signal executed atomically.
                <br/><br/>
                <span className="text-basalt-green font-black">100.0%</span> condition met. Securitization has been unlocked.
              </p>             
            )}
          </div>
          
          <div className="mt-6 md:mt-8 border border-basalt-800 p-3 md:p-4 bg-basalt-panel">
            <div className="h-2 w-full bg-basalt-800 rounded-none overflow-hidden">
               <motion.div 
                 initial={{ width: "0%" }}
                 animate={{ width: `${performanceScore}%` }}
                 className={`h-full ${hasPending ? 'bg-authority-amber' : 'bg-basalt-green'}`}
               />
            </div>
            <div className="flex justify-between mt-3 text-[8px] md:text-[9px] text-zinc-500 font-bold tracking-widest uppercase">
               <span>P_LOGGED</span>
               <span>{hasPending ? '66.6%_REMAIN' : '0.0%_REMAIN'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OracleItem({ label, status, value }: { label: string, status: string, value: string }) {
  return (
    <div className="p-2 md:p-3 border border-basalt-800 bg-basalt-950 flex justify-between items-center group hover:border-zinc-700 transition-colors">
      <div className="min-w-0 flex-1 pr-4">
        <div className="text-[8px] md:text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1 truncate">{label}</div>
        <div className="text-[9px] md:text-[10px] text-white font-mono truncate">{value}</div>
      </div>
      <div className={`text-[7px] md:text-[8px] font-black px-1.5 md:px-2 py-1 tracking-widest uppercase shrink-0 ${status === 'VERIFIED' ? 'bg-authority-cyan text-black' : 'bg-basalt-800 text-zinc-500'}`}>
        {status}
      </div>
    </div>
  );
}
