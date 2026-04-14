import React from 'react';

export default function IngestionDashboard({ onIngest }: { onIngest: () => void }) {
  return (
    <div className="h-full flex flex-col p-6 font-mono text-zinc-200 gap-6 max-w-6xl mx-auto min-h-0">
      {/* Top Drop Zone */}
      <div className="border border-dashed border-basalt-green/50 p-8 flex flex-col items-center justify-center bg-basalt-green/5 shrink-0">
        <div className="text-basalt-green text-[10px] font-bold tracking-widest mb-2">[ PENDING INSTRUMENT INGESTION ]</div>
        <h2 className="text-2xl font-black text-white tracking-wide mb-2">DROP INVOICE AS CURRENCY</h2>
        <p className="text-[10px] text-zinc-500 font-bold tracking-widest mb-6 text-center">
          PDF, XML, EDI-810 | UCC-9 & NISTIR 8202 COMPLIANT (DLT STORED VALUE VAULT)
        </p>
        <button 
          onClick={onIngest}
          className="bg-white text-black px-8 py-3 text-xs font-black tracking-widest hover:bg-zinc-200 transition-colors"
        >
          UPLOAD INSTRUMENT
        </button>
      </div>

      {/* Bottom Panels */}
      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
         {/* Panel 1 */}
         <div className="bg-basalt-panel border border-basalt-800 chamfer-br p-6 flex flex-col min-h-0">
           <h3 className="text-lg font-black text-white tracking-wide mb-6 flex items-center gap-3 shrink-0">
             <div className="w-1 h-5 bg-basalt-orange" />
             CHARACTERIZATION
           </h3>
           
           <div className="space-y-4 overflow-y-auto pr-2">
             <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-xs font-bold">
               <span className="text-zinc-400 tracking-widest">SOURCE TRUTH</span>
               <span className="text-basalt-green tracking-widest">VERIFIED</span>
             </div>
             <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-xs font-bold">
               <span className="text-zinc-400 tracking-widest">GAAP POSITION</span>
               <span className="text-white tracking-widest">UNREALIZED ASSET</span>
             </div>
             <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-xs font-bold">
               <span className="text-zinc-400 tracking-widest">UCC STATUS</span>
               <span className="text-white tracking-widest">NEGOTIABLE INSTRUMENT</span>
             </div>
             <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-xs font-bold">
               <span className="text-zinc-400 tracking-widest">HOLDING PERIOD</span>
               <span className="text-white tracking-widest">T+0MS</span>
             </div>
           </div>

           <div className="mt-auto h-16 bg-stripes border border-basalt-800/30 shrink-0" />
         </div>

         {/* Panel 2 */}
         <div className="bg-basalt-panel border border-basalt-800 chamfer-br p-6 flex flex-col min-h-0">
           <h3 className="text-lg font-black text-white tracking-wide mb-4 flex items-center gap-3 shrink-0">
             <div className="w-1 h-5 bg-basalt-orange" />
             RE-CHARACTERIZATION
           </h3>
           <p className="text-[10px] text-zinc-500 font-bold tracking-widest mb-6 shrink-0">TRANSFORMATION OF LIABILITY TO PRIVATE CREDIT VIA STORED VALUE MECHANISM.</p>
           
           <div className="space-y-4 mb-6 overflow-y-auto pr-2">
             <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-xs font-bold">
               <span className="text-zinc-400 tracking-widest">FACE VALUE</span>
               <span className="text-white tracking-widest">$412,000.00</span>
             </div>
             <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-xs font-bold">
               <span className="text-zinc-400 tracking-widest">ADJ. BASIS</span>
               <span className="text-basalt-green tracking-widest">$411,992.04</span>
             </div>
             <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-xs font-bold">
               <span className="text-zinc-400 tracking-widest">REMITTANCE PATH</span>
               <span className="text-white tracking-widest">IRM-10.1.2</span>
             </div>
           </div>

           <button className="mt-auto w-full py-4 border border-basalt-800 hover:bg-basalt-800 text-[10px] font-bold tracking-widest transition-colors text-white shrink-0">
             EXECUTE PERFORMANCE
           </button>
         </div>
      </div>
    </div>
  );
}
