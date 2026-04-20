import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ClearingEvent } from '../../lib/schemas';
import { verifyMechanicalTruth } from '../../lib/truth-gate';
import { FileText, Clock, CheckCircle2, ArrowLeft, User, Database } from 'lucide-react';
import { getClientForEvent } from '../TruthStream/TransactionModal';
import { tbClient, TBFlag, TBTransfer } from '../../lib/tigerbeetle';

interface LedgerHistoryProps {
  transactions: unknown[];
  selectedClient?: string | null;
  onClearClient?: () => void;
  onSelectEvent?: (event: ClearingEvent) => void;
}

export default function LedgerHistory({ transactions, selectedClient, onClearClient, onSelectEvent }: LedgerHistoryProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick(t => t + 1);
    tbClient.on('change', handler);
    return () => tbClient.off('change', handler);
  }, []);

  const verifiedEvents = useMemo(() => {
    return transactions
      .map(verifyMechanicalTruth)
      .filter((e): e is ClearingEvent => e !== null);
  }, [transactions]);

  // Combine TB transfers logic with previous events for robust accounting visual
  const accounts = Array.from(tbClient.accounts.values());
  const tbTransfers = Array.from(tbClient.transfers.values()).sort((a, b) => b.timestamp - a.timestamp);
  const allTransactions = useMemo(() => {
    const history = [...verifiedEvents];
    
    // Add a couple of mock pending transactions
    history.push({
      eventId: `PEND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      timestamp: Date.now() - 10000,
      status: 'PENDING',
      authority_node: 'AWAITING_QUORUM',
      instrument: {
        instrumentId: `INST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        type: 'PROMISSORY_NOTE',
        iso_20022_type: 'pain.001.001.03',
        value: { amount: 45000, currency: 'USD' },
        ucc9_status: 'UNPERFECTED',
        hash_signature: '0x...'
      }
    } as any);

    // Sort by timestamp descending
    return history.sort((a, b) => b.timestamp - a.timestamp);
  }, [verifiedEvents]);

  const displayedTransactions = useMemo(() => {
    if (!selectedClient) return allTransactions;
    return allTransactions.filter(tx => getClientForEvent(tx.eventId) === selectedClient);
  }, [allTransactions, selectedClient]);

  const totalVolume = displayedTransactions.reduce((sum, tx) => sum + tx.instrument.value.amount, 0);

  // Generate a mock wallet address based on client name
  const getWalletForClient = (client: string) => {
    const hash = Array.from(client).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `0x${hash.toString(16)}cfb4123a59466aa68de3a6684b30dc`;
  };

  if (selectedClient) {
    return (
      <div className="h-full flex flex-col p-6 font-mono text-zinc-200 gap-6 max-w-6xl mx-auto min-h-0">
        <button 
          onClick={onClearClient}
          className="flex items-center gap-2 text-[10px] text-zinc-500 hover:text-white transition-colors w-fit font-bold tracking-widest uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-basalt-panel border border-basalt-800 p-6 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 bg-basalt-950 border border-basalt-800 flex items-center justify-center">
            <User className="w-6 h-6 text-zinc-500" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-white tracking-widest">{selectedClient}</h2>
              <span className="bg-basalt-800 border border-basalt-700 text-zinc-300 text-[9px] px-2 py-0.5 font-bold tracking-widest uppercase">Client</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1 font-mono">{getWalletForClient(selectedClient)}</div>
          </div>
        </div>

        <div className="flex-1 bg-basalt-panel border border-basalt-800 flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 border-b border-basalt-800 bg-basalt-950">
            <h3 className="text-sm font-black text-white tracking-widest uppercase">Transaction History</h3>
          </div>
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-basalt-800 bg-basalt-950 text-[10px] font-bold text-zinc-500 tracking-widest uppercase shrink-0">
            <div className="col-span-3">Timestamp ↓</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-2 text-right">Amount (Tokens)</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Tx Hash</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {displayedTransactions.map((tx, idx) => {
              const isPending = tx.status === 'PENDING';
              
              return (
                <motion.div 
                  key={tx.eventId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onSelectEvent && onSelectEvent(tx as ClearingEvent)}
                  className="grid grid-cols-12 gap-4 px-4 py-4 items-center text-[11px] border-b border-basalt-800/50 hover:bg-basalt-800/30 transition-colors cursor-pointer"
                >
                  <div className="col-span-3 text-zinc-400">
                    {new Date(tx.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                  </div>
                  
                  <div className="col-span-3 font-bold text-zinc-300">
                    Retailer ID: {tx.eventId.split('-')[1] || 'A78-2B'}
                  </div>
                  
                  <div className="col-span-2 text-right font-bold text-basalt-green tabular-nums">
                    {tx.instrument.value.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  
                  <div className="col-span-2">
                    {isPending ? (
                      <div className="flex items-center gap-2 bg-authority-amber/10 border border-authority-amber/30 text-authority-amber px-2 py-1 w-fit">
                        <div className="w-1.5 h-1.5 bg-authority-amber" />
                        <span className="text-[9px] font-bold tracking-widest uppercase">Pending Approval</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-basalt-green/10 border border-basalt-green/30 text-basalt-green px-2 py-1 w-fit">
                        <div className="w-1.5 h-1.5 bg-basalt-green" />
                        <span className="text-[9px] font-bold tracking-widest uppercase">Processing Settlement</span>
                      </div>
                    )}
                  </div>

                  <div className="col-span-2 text-zinc-500 font-mono truncate">
                    {tx.instrument.hash_signature || '0x2fee...e1e7'}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 font-mono text-zinc-200 gap-6 max-w-6xl mx-auto min-h-0">
      <header className="flex justify-between items-end border-b border-basalt-800 pb-4 shrink-0">
        <div>
          <h2 className="text-xl font-black tracking-widest text-white flex items-center gap-3">
            <FileText className="w-6 h-6 text-authority-cyan" />
            05_SETTLEMENT_LEDGER
          </h2>
          <p className="text-[10px] text-zinc-500 uppercase italic font-bold tracking-widest mt-1">
            Immutable Record of Truth // Fiat Off-Ramp Translations
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500 font-bold tracking-widest mb-1">TOTAL SETTLED VOLUME</div>
          <div className="text-sm font-black text-basalt-green tracking-widest">
            ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 shrink-0">
        <div className="bg-basalt-panel border border-basalt-800 p-4">
          <div className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-basalt-orange" />
            TIGERBEETLE TWO-PHASE ACCOUNTS
          </div>
          <div className="space-y-4">
            {accounts.map(acc => (
              <div key={acc.id} className="border border-basalt-800 bg-basalt-950 p-3 flex justify-between items-center group">
                <div>
                  <div className="text-[11px] font-black tracking-widest uppercase text-white">{acc.name}</div>
                  <div className="text-[9px] text-zinc-500 font-bold uppercase mt-1">ID: {acc.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-400 font-bold mb-1">POSTED / AVAILABLE</div>
                  <div className="text-sm font-black text-basalt-green">${(acc.credits_posted - acc.debits_posted - acc.debits_pending).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-basalt-panel border border-basalt-800 p-4 flex flex-col">
          <div className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase mb-4">
            TIGERBEETLE RESERVATION STATE
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto">
             {tbTransfers.slice(0, 5).map(t => (
               <div key={t.id} className="text-[9px] flex justify-between p-2 border border-basalt-800 bg-black items-center">
                 <div className="flex items-center gap-3">
                   <span className={`px-2 py-0.5 font-bold uppercase text-black ${
                     t.flags === TBFlag.PENDING ? 'bg-authority-amber' : 
                     t.flags === TBFlag.POST_PENDING ? 'bg-basalt-green' : 'bg-mechanical-red'
                   }`}>
                     {TBFlag[t.flags]}
                   </span>
                   <span className="text-zinc-500 font-mono text-[10px] truncate w-24">{t.id}</span>
                 </div>
                 <span className="text-white font-mono font-bold">${t.amount.toLocaleString()}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-basalt-panel border border-basalt-800 flex flex-col min-h-0 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-basalt-800 bg-basalt-950 text-[10px] font-bold text-zinc-500 tracking-widest shrink-0">
          <div className="col-span-2">TIMESTAMP</div>
          <div className="col-span-3">TRANSACTION_ID</div>
          <div className="col-span-2">INSTRUMENT</div>
          <div className="col-span-2 text-right">AMOUNT</div>
          <div className="col-span-3 text-right">STATUS / HASH</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {displayedTransactions.map((tx, idx) => {
            const isPending = tx.status === 'PENDING';
            const isDebit = tx.instrument.type !== 'PROMISSORY_NOTE';
            
            return (
              <motion.div 
                key={tx.eventId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectEvent && onSelectEvent(tx as ClearingEvent)}
                className={`grid grid-cols-12 gap-4 p-3 items-center text-[11px] border border-transparent hover:border-basalt-800 transition-colors cursor-pointer ${isPending ? 'bg-basalt-900/30' : 'bg-basalt-950/50'}`}
              >
                <div className="col-span-2 text-zinc-400">
                  {new Date(tx.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium', hour12: false })}
                </div>
                
                <div className="col-span-3 font-bold text-white truncate pr-4">
                  {tx.eventId}
                </div>
                
                <div className="col-span-2 text-zinc-500 truncate">
                  {tx.instrument.type.replace('_', ' ')}
                </div>
                
                <div className={`col-span-2 text-right font-bold tabular-nums ${isPending ? 'text-zinc-500' : isDebit ? 'text-basalt-orange' : 'text-basalt-green'}`}>
                  {isDebit ? '-' : '+'}${tx.instrument.value.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                
                <div className="col-span-3 flex flex-col items-end justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    {isPending ? (
                      <>
                        <span className="text-[9px] font-bold text-authority-amber tracking-widest">PENDING_QUORUM</span>
                        <Clock className="w-3 h-3 text-authority-amber animate-pulse" />
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] font-bold text-basalt-green tracking-widest">SETTLED</span>
                        <CheckCircle2 className="w-3 h-3 text-basalt-green" />
                      </>
                    )}
                  </div>
                  <div className="text-[8px] text-zinc-600 font-mono truncate w-full text-right" title={tx.instrument.hash_signature}>
                    {tx.instrument.hash_signature}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
