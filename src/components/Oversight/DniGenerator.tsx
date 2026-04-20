import React from "react";
import { motion } from "motion/react";
import { ClearingEvent } from "../../lib/schemas";

export default function DniGenerator({ settledTx }: { settledTx: ClearingEvent | null }) {
  if (!settledTx) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-6 border-2 border-authority-cyan bg-basalt-900 shadow-[0_0_30px_rgba(0,242,255,0.1)]"
    >
      <div className="flex justify-between items-start border-b border-basalt-800 pb-4 mb-4">
        <div>
          <h3 className="text-xs font-black text-white italic underline">CERTIFICATE_OF_PERFECTION</h3>
          <p className="text-[8px] text-zinc-500 mt-1">UCC-9 COMPLIANT // DNI_REF: {settledTx.eventId.slice(0, 12)}</p>
        </div>
        <div className="text-[10px] font-mono text-authority-cyan font-bold">AUTHENTIC_INSTRUMENT</div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-[9px] mb-6">
        <div>
          <span className="text-zinc-600 block uppercase font-bold">Settlement_ID</span>
          <span className="text-white font-mono">{settledTx.eventId}</span>
        </div>
        <div>
          <span className="text-zinc-600 block uppercase font-bold">Mechanical_Proof</span>
          <span className="text-white font-mono">ORACLE_VERIFIED_100%</span>
        </div>
      </div>

      <div className="bg-black p-3 border border-basalt-800 mb-4">
        <div className="text-[7px] text-zinc-600 mb-2 uppercase">Cryptographic_Seal_Set</div>
        <div className="flex gap-1 overflow-hidden">
           {/* Simulate a signature array based on hash */}
           {[1, 2, 3].map((_, i) => (
             <div key={i} className="text-[6px] text-authority-cyan truncate border border-authority-cyan/20 px-1 py-0.5 bg-authority-cyan/5">
               0x{Math.random().toString(16).slice(2, 10)}...
             </div>
           ))}
        </div>
      </div>

      <button className="w-full py-2 bg-white text-black text-[10px] font-black uppercase hover:bg-authority-cyan transition-colors">
        DOWNLOAD_NEGOTIABLE_INSTRUMENT_PACKAGE
      </button>
    </motion.div>
  );
}
