"use client";

import { motion, AnimatePresence } from "motion/react";
import { useMemo } from "react";
import { ClearingEvent } from "@/src/lib/schemas";
import { verifyMechanicalTruth } from "@/src/lib/truth-gate";

interface TruthStreamProps {
  rawBuffer: unknown[];
  onSelectEvent: (event: ClearingEvent) => void;
}

export default function TruthStream({ rawBuffer, onSelectEvent }: TruthStreamProps) {
  const verifiedEvents = useMemo(() => {
    return rawBuffer
      .map(verifyMechanicalTruth)
      .filter((e): e is ClearingEvent => e !== null);
  }, [rawBuffer]);

  return (
    <div className="flex flex-col h-full bg-basalt-bg p-6 font-mono z-10 shrink-0">
      <header className="mb-8">
        <h2 className="text-lg font-black tracking-wide text-white mb-1">
          PRIVATE LEDGER
        </h2>
        <div className="text-[9px] font-bold tracking-widest text-zinc-500">
          CLOSED-LOOP SETTLEMENT SYSTEM
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative pr-2 space-y-8">
        <AnimatePresence initial={false} mode="popLayout">
          {verifiedEvents.length === 0 ? (
            <div className="text-[10px] text-zinc-600 italic">
              AWAITING VERIFICATION ...
            </div>
          ) : (
            verifiedEvents.map((event) => (
              <VerifiedSettlementCard 
                key={event.eventId} 
                event={event} 
                onSelect={() => onSelectEvent(event)} 
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function VerifiedSettlementCard({ event, onSelect }: { event: ClearingEvent, onSelect: () => void }) {
  // Alternate between positive and negative for visual variety based on instrument type
  const isPositive = event.instrument.type === 'PROMISSORY_NOTE';
  const colorClass = isPositive ? 'text-basalt-green' : 'text-basalt-orange';
  const borderClass = isPositive ? 'border-basalt-green' : 'border-basalt-orange';
  const sign = isPositive ? '+' : '-';

  const handleClick = () => {
    console.log('=========================================');
    console.log('MECHANICAL_TRUTH_EVENT_SELECTED:');
    console.log(JSON.stringify(event, null, 2));
    console.log('=========================================');
    onSelect();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02, x: -4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      className={`border-l-2 ${borderClass} pl-4 py-2 -ml-4 relative group cursor-pointer transition-colors rounded-r-md`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-baseline mb-1">
        <div className="text-[11px] font-bold text-white tracking-widest">
          {isPositive ? 'ASSET RECOGNITION' : 'LIABILITY DISCHARGE'}
        </div>
        <div className={`text-[11px] font-bold ${colorClass} tabular-nums`}>
          {sign}${event.instrument.value.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <div className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">
        {isPositive ? 'INST: INV-2023-991 | RE-CHAR: COMPLETE' : 'SOVEREIGN DEBT OFFSET | UCC-3 FILING'}
      </div>
    </motion.div>
  );
}

