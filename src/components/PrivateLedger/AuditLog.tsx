import React from "react";
import { motion, AnimatePresence } from "motion/react";

export interface AuditEntry {
  id: string;
  action: string;
  module: string;
  hash: string;
  timestamp: number;
}

export default function PrivateLedger({ entries }: { entries: AuditEntry[] }) {
  return (
    <aside className="bg-black/40 h-full flex flex-col font-mono overflow-hidden shrink-0 z-10">
      <div className="p-4 border-b border-basalt-800 bg-basalt-900/80">
        <h2 className="text-[10px] font-black tracking-[0.2em] text-zinc-400">SESSION_AUDIT_LOG</h2>
        <div className="text-[8px] text-zinc-600 mt-1 uppercase">Persistence: LOCAL_VOLATILE</div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide">
        <AnimatePresence initial={false}>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-2 border border-basalt-900 bg-basalt-950/50 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start text-[8px] mb-1">
                <span className="text-authority-cyan font-bold">[{entry.module}]</span>
                <span className="text-zinc-700">{new Date(entry.timestamp).toLocaleTimeString([], { hour12: false })}</span>
              </div>
              <div className="text-[9px] text-zinc-300 font-bold truncate">{entry.action}</div>
              <div className="text-[7px] text-zinc-600 font-mono mt-1 break-all truncate">
                HASH: {entry.hash}
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-zinc-800 group-hover:bg-authority-cyan transition-colors" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="p-3 border-t border-basalt-800 text-[8px] text-zinc-700 bg-basalt-900">
        TOTAL_SESSION_EVENTS: {entries.length}
      </div>
    </aside>
  );
}
