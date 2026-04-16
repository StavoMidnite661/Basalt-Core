import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ShieldCheck, User, Clock, FileText } from 'lucide-react';
import { ClearingEvent } from '../../lib/schemas';
import { ACHProtocol, SWIFTProtocol } from '../../lib/protocols';

interface TransactionModalProps {
  event: ClearingEvent;
  onClose: () => void;
  onSelectClient?: (client: string) => void;
}

const CLIENTS = ["Cygnus Corp", "Orion Merchants", "Lyra Logistics", "Vela Ventures", "Nova Dynamics"];
export function getClientForEvent(eventId: string) {
  const charCode = eventId.charCodeAt(eventId.length - 1) || 0;
  return CLIENTS[charCode % CLIENTS.length];
}

export default function TransactionModal({ event, onClose, onSelectClient }: TransactionModalProps) {
  const clientName = getClientForEvent(event.eventId);
  const [activeProtocol, setActiveProtocol] = useState<'NONE' | 'ACH' | 'SWIFT'>('NONE');

  const rawACH = ACHProtocol.generateNacha(event, clientName);
  const rawSWIFT = SWIFTProtocol.generateMT103(event, clientName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-basalt-panel border border-basalt-800 max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="border-b border-basalt-800 p-6 flex justify-between items-start bg-basalt-bg relative shrink-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-basalt-orange" />
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Retailer ID: {event.eventId.split('-')[1] || 'F23-5G'}</div>
              <div className="text-[8px] text-zinc-600 font-mono truncate max-w-[200px]">{event.instrument.instrumentId}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-12">
              <div>
                <div className="text-[10px] text-zinc-500 mb-1 font-bold tracking-widest uppercase">User</div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onSelectClient && onSelectClient(clientName)}
                    className="text-white font-black tracking-widest hover:text-authority-cyan transition-colors cursor-pointer"
                  >
                    {clientName}
                  </button>
                  <span className="bg-basalt-800 border border-basalt-700 text-zinc-300 text-[9px] px-2 py-0.5 tracking-widest uppercase font-bold">Client</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 mb-1 font-bold tracking-widest uppercase">Amount</div>
                <div className="text-basalt-green font-black text-lg">{event.instrument.value.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-sm text-zinc-500">TOKENS</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mt-6">
              <div>
                <div className="text-[10px] text-zinc-500 mb-1 font-bold tracking-widest uppercase">Status</div>
                <div className="flex items-center gap-2 bg-basalt-green/10 border border-basalt-green/30 text-basalt-green px-3 py-1 w-fit">
                  <div className="w-2 h-2 bg-basalt-green" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Settled</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 mb-1 font-bold tracking-widest uppercase">Timestamp</div>
                <div className="text-white font-bold text-sm">
                  {new Date(event.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors absolute top-6 right-6">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 text-zinc-300 text-xs space-y-6">
          
          <div className="space-y-4 border-b border-basalt-800 pb-6">
            <div>
              <div className="text-[10px] text-zinc-500 mb-1 font-bold tracking-widest uppercase">Transaction Data Hash</div>
              <div className="font-mono text-[10px] text-zinc-400 break-all">{event.hash_signature || `0x90413cca72cd4d24a96e92bc7155216c20744f2f0c0840f9b87da790`}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 mb-1 font-bold tracking-widest uppercase">Compliance Data Hash</div>
              <div className="font-mono text-[10px] text-zinc-400 break-all">0xd1c4f192751b4f799ac3766670bccfb65897bc9727614bb58383c64e</div>
            </div>
          </div>

          <div className="border-b border-basalt-800 pb-6">
            <h3 className="text-sm font-black text-white mb-4 tracking-widest uppercase">Routing Trace</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-0.5"><ShieldCheck className="w-4 h-4 text-authority-cyan" /></div>
                <div>
                  <div className="font-bold text-white text-xs tracking-wide">API Gateway: <span className="font-normal text-zinc-400">Receive Payment Request</span></div>
                  <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-2 font-bold tracking-widest">
                    <Clock className="w-3 h-3" />
                    {new Date(event.timestamp - 2000).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    <span className="text-authority-cyan cursor-pointer hover:underline ml-2">SHOW DETAILS</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5"><ShieldCheck className="w-4 h-4 text-authority-cyan" /></div>
                <div>
                  <div className="font-bold text-white text-xs tracking-wide">Compliance Engine: <span className="font-normal text-zinc-400">Verify Transaction</span></div>
                  <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-2 font-bold tracking-widest">
                    <Clock className="w-3 h-3" />
                    {new Date(event.timestamp - 1000).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    <span className="text-authority-cyan cursor-pointer hover:underline ml-2">SHOW DETAILS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legacy Settlement Translation */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
                <FileText className="w-4 h-4 text-basalt-orange" />
                Legacy Settlement Translation
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveProtocol(activeProtocol === 'ACH' ? 'NONE' : 'ACH')}
                  className={`text-[9px] px-3 py-1 font-bold tracking-widest transition-colors ${activeProtocol === 'ACH' ? 'bg-basalt-orange text-black' : 'bg-basalt-800 text-zinc-400 hover:text-white'}`}
                >
                  NACHA (ACH)
                </button>
                <button 
                  onClick={() => setActiveProtocol(activeProtocol === 'SWIFT' ? 'NONE' : 'SWIFT')}
                  className={`text-[9px] px-3 py-1 font-bold tracking-widest transition-colors ${activeProtocol === 'SWIFT' ? 'bg-basalt-orange text-black' : 'bg-basalt-800 text-zinc-400 hover:text-white'}`}
                >
                  SWIFT MT103
                </button>
              </div>
            </div>

            {activeProtocol !== 'NONE' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-basalt-950 border border-basalt-800 p-4 overflow-x-auto"
              >
                <div className="text-[9px] text-zinc-500 font-bold tracking-widest mb-2 uppercase">
                  {activeProtocol === 'ACH' ? 'FIXED-WIDTH NACHA FILE FORMAT' : 'SWIFT MT103 MESSAGE BLOCK'}
                </div>
                <pre className="text-[10px] text-authority-cyan font-mono whitespace-pre">
                  {activeProtocol === 'ACH' ? rawACH : rawSWIFT}
                </pre>
              </motion.div>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}
