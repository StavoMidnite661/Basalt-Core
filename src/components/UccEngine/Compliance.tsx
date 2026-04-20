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
      <header className="border-b border-basalt-800 pb-4 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-xl font-black tracking-widest text-white flex items-center gap-2 uppercase">
            03_UCC_9_SECURITIZATION
          </h2>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">
            Asset Perfection & Legal Oracle Integration
          </p>
        </div>
        <button className="px-4 py-2 bg-authority-amber/10 border border-authority-amber text-[10px] text-authority-amber hover:bg-authority-amber/20 transition-colors font-bold tracking-widest uppercase">
          TRIGGER_LEGAL_ORACLE
        </button>
      </header>

      <div className="grid grid-cols-4 gap-4 shrink-0">
        <div className="bg-basalt-panel border border-basalt-800 p-4">
          <div className="text-[10px] text-zinc-500 mb-1 font-bold tracking-widest">TOTAL_ACTIVE_LIENS</div>
          <div className="text-2xl font-black text-white">1,042</div>
        </div>
        <div className="bg-basalt-panel border border-basalt-800 p-4 border-b-2 border-b-green-500">
          <div className="text-[10px] text-zinc-500 mb-1 font-bold tracking-widest">PERFECTED_RATIO</div>
          <div className="text-2xl font-black text-green-500">98.4%</div>
        </div>
        <div className="bg-basalt-panel border border-basalt-800 p-4 border-b-2 border-b-authority-amber">
          <div className="text-[10px] text-zinc-500 mb-1 font-bold tracking-widest">PENDING_CONTROL_AGREEMENTS</div>
          <div className="text-2xl font-black text-authority-amber">14</div>
        </div>
        <div className="bg-basalt-panel border border-basalt-800 p-4 border-b-2 border-b-mechanical-red">
          <div className="text-[10px] text-zinc-500 mb-1 font-bold tracking-widest">PRIORITY_CONFLICTS</div>
          <div className="text-2xl font-black text-mechanical-red">0</div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Main Log */}
        <div className="col-span-8 bg-basalt-panel border border-basalt-800 flex flex-col min-h-0">
          <div className="p-4 border-b border-basalt-800 flex justify-between items-center bg-basalt-950 shrink-0">
            <h3 className="text-xs font-bold text-zinc-400 tracking-widest">COLLATERAL_INSPECTOR_LOG</h3>
            <div className="text-[10px] text-zinc-600 font-bold tracking-widest">LIVE_SYNC</div>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] text-zinc-500 border-b border-basalt-800">
                  <th className="pb-2 font-bold tracking-widest">FILING_ID</th>
                  <th className="pb-2 font-bold tracking-widest">COLLATERAL_CLASS</th>
                  <th className="pb-2 font-bold tracking-widest">DEBTOR_ENTITY</th>
                  <th className="pb-2 font-bold tracking-widest">TIMESTAMP</th>
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
                    className="border-b border-basalt-800/50 hover:bg-basalt-800/30"
                  >
                    <td className="py-3 font-bold text-zinc-300">{filing.id}</td>
                    <td className="py-3 text-zinc-400">{filing.type}</td>
                    <td className="py-3 text-zinc-400">{filing.debtor}</td>
                    <td className="py-3 text-zinc-500">{new Date(filing.date).toLocaleTimeString()}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-[9px] font-bold tracking-widest ${
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
        <div className="col-span-4 flex flex-col gap-4 min-h-0">
          <div className="bg-basalt-panel border border-basalt-800 flex flex-col flex-1 p-6 chamfer-br">
            <h3 className="text-sm font-black text-white tracking-widest mb-4 flex items-center gap-2 border-b border-basalt-800 pb-4">
              <Landmark className="w-4 h-4 text-authority-cyan" />
              TAX_ASSET_COLLATERALIZATION
            </h3>
            
            <p className="text-[10px] text-zinc-400 leading-relaxed mb-6">
              Convert Net Operating Losses (NOL) and Tax Credits into perfected General Intangibles under UCC-9.
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-basalt-bg border border-basalt-800 p-3">
                <div className="text-[9px] font-bold text-zinc-500 tracking-widest mb-1">AVAILABLE NOL ASSET</div>
                <div className="text-lg font-black text-authority-cyan">$440,000.00</div>
              </div>
              <div className="bg-basalt-bg border border-basalt-800 p-3">
                <div className="text-[9px] font-bold text-zinc-500 tracking-widest mb-1">ELIGIBLE CREDITS</div>
                <div className="text-lg font-black text-authority-cyan">$30,000.00</div>
              </div>
            </div>

            <button className="mt-auto w-full py-3 bg-authority-cyan/10 border border-authority-cyan text-authority-cyan text-xs font-black tracking-widest hover:bg-authority-cyan hover:text-black transition-colors">
              EXPORT AS NEGOTIABLE INSTRUMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
