import React from 'react';
import { motion } from 'motion/react';
import { FileSignature, AlertTriangle, CheckCircle2, Clock, Landmark } from 'lucide-react';

const MOCK_FILINGS = [
  { id: 'UCC-2026-8819A', type: 'ACCOUNTS', debtor: 'CORP_ALPHA_LLC', status: 'PERFECTED', date: '2026-04-12T08:00:00Z' },
  { id: 'UCC-2026-8820B', type: 'INVENTORY', debtor: 'OMEGA_LOGISTICS', status: 'PENDING', date: '2026-04-12T11:30:00Z' },
  { id: 'UCC-2026-8821C', type: 'EQUIPMENT', debtor: 'NEXUS_MANUFACTURING', status: 'UNPERFECTED', date: '2026-04-12T12:15:00Z' },
  { id: 'UCC-2026-8822D', type: 'GEN_INTANGIBLES', debtor: 'SYNTH_IP_HOLDINGS', status: 'PERFECTED', date: '2026-04-11T16:45:00Z' },
];

export default function UccEngine() {
  return (
    <div className="h-full flex flex-col p-6 font-mono text-zinc-200 gap-6 max-w-6xl mx-auto min-h-0">
      <header className="border-b border-basalt-800 pb-2 md:pb-4 flex flex-col sm:flex-row justify-between sm:items-end shrink-0 gap-4 sm:gap-0">
        <div>
          <h2 className="text-lg md:text-xl font-black tracking-widest text-white flex items-center gap-2 uppercase">
            03_UCC_9_SECURITIZATION
          </h2>
          <p className="text-[8px] md:text-[10px] text-zinc-500 mt-0.5 md:mt-1 uppercase tracking-widest font-bold">
            Asset Perfection & Legal Oracle Integration
          </p>
        </div>
        <button className="w-full sm:w-auto px-4 py-2 bg-authority-amber/10 border border-authority-amber text-[9px] md:text-[10px] text-authority-amber hover:bg-authority-amber/20 transition-colors font-bold tracking-widest uppercase">
          TRIGGER_LEGAL_ORACLE
        </button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-basalt-panel border border-basalt-800 p-3 md:p-4">
          <div className="text-[8px] md:text-[10px] text-zinc-500 mb-1 font-bold tracking-widest">TOTAL_ACTIVE_LIENS</div>
          <div className="text-xl md:text-2xl font-black text-white">1,042</div>
        </div>
        <div className="bg-basalt-panel border border-basalt-800 p-3 md:p-4 border-b-2 border-b-green-500">
          <div className="text-[8px] md:text-[10px] text-zinc-500 mb-1 font-bold tracking-widest">PERFECTED_RATIO</div>
          <div className="text-xl md:text-2xl font-black text-green-500">98.4%</div>
        </div>
        <div className="bg-basalt-panel border border-basalt-800 p-3 md:p-4 border-b-2 border-b-authority-amber">
          <div className="text-[8px] md:text-[10px] text-zinc-500 mb-1 font-bold tracking-widest truncate">PENDING_CONTROL</div>
          <div className="text-xl md:text-2xl font-black text-authority-amber">14</div>
        </div>
        <div className="bg-basalt-panel border border-basalt-800 p-3 md:p-4 border-b-2 border-b-mechanical-red">
          <div className="text-[8px] md:text-[10px] text-zinc-500 mb-1 font-bold tracking-widest truncate">PRIORITY_CONFLICTS</div>
          <div className="text-xl md:text-2xl font-black text-mechanical-red">0</div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 min-h-0 overflow-y-auto lg:overflow-visible">
        {/* Main Log */}
        <div className="col-span-1 lg:col-span-8 bg-basalt-panel border border-basalt-800 flex flex-col min-h-[300px] lg:min-h-0 shrink-0 lg:shrink">
          <div className="p-3 md:p-4 border-b border-basalt-800 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-basalt-950 shrink-0 gap-2 sm:gap-0">
            <h3 className="text-[10px] md:text-xs font-bold text-zinc-400 tracking-widest">COLLATERAL_INSPECTOR_LOG</h3>
            <div className="text-[8px] md:text-[10px] text-zinc-600 font-bold tracking-widest">LIVE_SYNC</div>
          </div>
          
          <div className="flex-1 overflow-auto p-4 scrollbar-hide">
            <table className="w-full text-left text-[10px] md:text-xs">
              <thead className="hidden sm:table-header-group">
                <tr className="text-[8px] md:text-[10px] text-zinc-500 border-b border-basalt-800">
                  <th className="pb-2 font-bold tracking-widest">FILING_ID</th>
                  <th className="pb-2 font-bold tracking-widest">COLLATERAL_CLASS</th>
                  <th className="pb-2 font-bold tracking-widest">DEBTOR_ENTITY</th>
                  <th className="pb-2 font-bold tracking-widest text-right">UCC9_STATUS</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_FILINGS.map((filing, i) => (
                  <motion.tr 
                    key={filing.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="border-b border-basalt-800/50 hover:bg-basalt-800/30 flex flex-col sm:table-row py-2 sm:py-0"
                  >
                    <td className="py-1 sm:py-3 font-bold text-zinc-300">
                      <span className="sm:hidden text-zinc-500 uppercase mr-2 text-[8px]">ID:</span>
                      {filing.id}
                    </td>
                    <td className="py-1 sm:py-3 text-zinc-400">
                      <span className="sm:hidden text-zinc-500 uppercase mr-2 text-[8px]">Class:</span>
                      {filing.type}
                    </td>
                    <td className="py-1 sm:py-3 text-zinc-400">
                      <span className="sm:hidden text-zinc-500 uppercase mr-2 text-[8px]">Debtor:</span>
                      {filing.debtor}
                    </td>
                    <td className="py-1 sm:py-3 text-left sm:text-right mt-1 sm:mt-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-[8px] md:text-[9px] font-bold tracking-widest ${
                        filing.status === 'PERFECTED' ? 'bg-green-500/10 text-green-500' :
                        filing.status === 'PENDING' ? 'bg-authority-amber/10 text-authority-amber' :
                        'bg-mechanical-red/10 text-mechanical-red'
                      }`}>
                        {filing.status === 'PERFECTED' && <CheckCircle2 className="w-3 h-3" />}
                        {filing.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {filing.status === 'UNPERFECTED' && <AlertTriangle className="w-3 h-3" />}
                        {filing.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tax Asset Collateralization */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-4 md:gap-6 min-h-0 shrink-0 lg:shrink">
          <div className="bg-basalt-panel border border-basalt-800 flex flex-col flex-1 p-4 md:p-6 chamfer-br">
            <h3 className="text-xs md:text-sm font-black text-white tracking-widest mb-4 flex items-center gap-2 border-b border-basalt-800 pb-3 md:pb-4">
              <Landmark className="w-3 h-3 md:w-4 md:h-4 text-authority-cyan shrink-0" />
              <span className="truncate">TAX_ASSET_COLLATERAL</span>
            </h3>
            
            <p className="text-[9px] md:text-[10px] text-zinc-400 leading-relaxed mb-4 md:mb-6">
              Convert Net Operating Losses (NOL) and Tax Credits into perfected General Intangibles under UCC-9.
            </p>

            <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
              <div className="bg-basalt-bg border border-basalt-800 p-3">
                <div className="text-[8px] md:text-[9px] font-bold text-zinc-500 tracking-widest mb-1">AVAILABLE NOL ASSET</div>
                <div className="text-base md:text-lg font-black text-authority-cyan">$440,000.00</div>
              </div>
              <div className="bg-basalt-bg border border-basalt-800 p-3">
                <div className="text-[8px] md:text-[9px] font-bold text-zinc-500 tracking-widest mb-1">ELIGIBLE CREDITS</div>
                <div className="text-base md:text-lg font-black text-authority-cyan">$30,000.00</div>
              </div>
            </div>

            <button className="mt-auto w-full py-3 bg-authority-cyan/10 border border-authority-cyan text-authority-cyan text-[10px] md:text-xs font-black tracking-widest hover:bg-authority-cyan hover:text-black transition-colors px-2">
              EXPORT NEGOTIABLE INSTRUMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
