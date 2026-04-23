"use client";
import { motion, AnimatePresence } from "motion/react";
import { useMemo } from "react";
import { ClearingEvent } from "../../lib/schemas";
import { verifyMechanicalTruth } from "../../lib/truth-gate";
export default function TruthStream({ rawBuffer, onSelectEvent }: { rawBuffer: any[], onSelectEvent: (event: ClearingEvent) => void }) {
  const verifiedEvents = useMemo(() => (rawBuffer || []).map(verifyMechanicalTruth).filter((e): e is ClearingEvent => e !== null), [rawBuffer]);
  return (
    <div className="flex flex-col h-full bg-basalt-bg p-6 font-mono z-10 shrink-0">
      <header className="mb-8"><h2 className="text-lg font-black tracking-wide text-white mb-1">PRIVATE LEDGER</h2></header>
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative pr-2 space-y-8">
        <AnimatePresence initial={false} mode="popLayout">
          {verifiedEvents.map((event) => (<div key={event.eventId}><VerifiedSettlementCard event={event} onSelect={() => onSelectEvent(event)} /></div>))}
        </AnimatePresence>
      </div>
    </div>
  );
}
function VerifiedSettlementCard({ event, onSelect }: { event: ClearingEvent, onSelect: () => void }) {
  const isPositive = event.instrument.type === 'PROMISSORY_NOTE';
  return (
    <motion.div layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' }} className={`border-l-2 ${isPositive ? 'border-basalt-green' : 'border-basalt-orange'} pl-4 py-2 -ml-4 cursor-pointer transition-colors rounded-r-md`} onClick={onSelect}>
      <div className="flex justify-between items-baseline mb-1">
        <div className="text-[11px] font-bold text-white tracking-widest">{isPositive ? 'ASSET RECOGNITION' : 'LIABILITY DISCHARGE'}</div>
        <div className={`text-[11px] font-bold ${isPositive ? 'text-basalt-green' : 'text-basalt-orange'} tabular-nums`}>{isPositive ? '+' : '-'}${event.instrument.value.amount.toLocaleString()}</div>
      </div>
    </motion.div>
  );
}
