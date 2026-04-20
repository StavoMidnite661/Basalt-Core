import React, { useState } from "react";
import { motion } from "motion/react";
import { tbClient, TBFlag } from "../../lib/tigerbeetle";

export default function RailBridge({ onExecute }: { onExecute?: () => void }) {
  const [railStatus, setRailStatus] = useState("AWAITING_INSTRUCTION");
  const [selectedRail, setSelectedRail] = useState<string | null>(null);
  
  const svtAccount = tbClient.accounts.get('STORED_VALUE_TOKENS');
  const availableSVT = svtAccount ? svtAccount.credits_posted - svtAccount.debits_posted : 0;

  const handleExecute = () => {
    if (!selectedRail) return;
    
    // Simulate Fee
    const feeAmount = selectedRail === "SWIFT" ? (availableSVT * 0.0002) : (selectedRail === "FEDWIRE" ? 25 : 0);
    const bridgeAmount = availableSVT - feeAmount;

    // We do absolute voiding logic here. In reality we'd transfer to Fiat Transit and reduce SVT
    tbClient.createTransfer({
      debit_account_id: 'STORED_VALUE_TOKENS',
      credit_account_id: 'EXTERNAL_FIAT_TRANSIT',
      amount: bridgeAmount,
      flags: TBFlag.NONE
    });

    if (feeAmount > 0) {
      tbClient.createTransfer({
        debit_account_id: 'TREASURY_MAIN',
        credit_account_id: 'RAIL_FEES',
        amount: feeAmount,
        flags: TBFlag.NONE
      });
    }

    setRailStatus("SETTLED_EXTERNALLY");
    if (onExecute) onExecute();
  };

  return (
    <div className="p-8 bg-basalt-950 font-mono h-full grid grid-cols-12 gap-8">
      <div className="col-span-8 space-y-6">
        <h2 className="text-lg font-black text-white tracking-tighter uppercase flex items-center gap-2">
           <svg className="w-5 h-5 text-authority-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
           04_EXTERNAL_RAIL_CLEARING
        </h2>
        
        {/* ISO 20022 Generation Block */}
        <div className="border border-basalt-800 bg-basalt-900 p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-authority-cyan tracking-[0.2em] uppercase">ISO_20022_MESSAGE_GEN</span>
            <div className="h-2 w-2 rounded-full bg-authority-cyan animate-ping" />
          </div>
          
          <code className="text-[9px] text-zinc-500 block leading-tight whitespace-pre">
{`<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.02">
  <FIToFICstmrCdtTrf>
    <GrpHdr><MsgId>SOVR-EXIT-${Date.now()}</MsgId></GrpHdr>
    ${selectedRail ? `<SvcLvl><Cd>${selectedRail}</Cd></SvcLvl>` : '<!-- SELECT RAIL -->'}
  </FIToFICstmrCdtTrf>
</Document>`}
          </code>
        </div>

        {/* Rail Selection */}
        <div className="grid grid-cols-3 gap-4">
          <RailCard label="SWIFT" network="GLOBAL" fee="0.02%" selected={selectedRail === "SWIFT"} onClick={() => setSelectedRail("SWIFT")} />
          <RailCard label="ACH" network="DOMESTIC" fee="0.00%" selected={selectedRail === "ACH"} onClick={() => setSelectedRail("ACH")} />
          <RailCard label="FEDWIRE" network="INSTANT" fee="$25.00" selected={selectedRail === "FEDWIRE"} onClick={() => setSelectedRail("FEDWIRE")} />
        </div>
      </div>

      {/* Execution HUD */}
      <div className="col-span-4 bg-black border border-basalt-800 p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="text-[10px] font-bold text-zinc-400 uppercase italic underline decoration-authority-cyan">Exit_Authority</div>
          <div className="p-4 bg-basalt-900 border border-zinc-800">
            <span className="text-[8px] text-zinc-600 block uppercase font-bold tracking-widest">SVT_BURN_AMOUNT</span>
            <span className="text-xl font-black text-white">${availableSVT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="bg-basalt-950 border border-basalt-800 p-4">
             <div className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Internal Status</div>
             <div className={`text-[10px] font-black tracking-widest ${railStatus === 'AWAITING_INSTRUCTION' ? 'text-authority-amber' : 'text-basalt-green'}`}>
                {railStatus}
             </div>
          </div>
        </div>

        <button 
          onClick={handleExecute}
          disabled={!selectedRail || availableSVT <= 0 || railStatus === 'SETTLED_EXTERNALLY'}
          className={`w-full py-4 text-black font-black text-xs uppercase transition-all ${!selectedRail || availableSVT <= 0 || railStatus === 'SETTLED_EXTERNALLY' ? 'bg-basalt-800 text-zinc-500 cursor-not-allowed' : 'bg-authority-cyan hover:bg-white shadow-[0_0_25px_rgba(0,242,255,0.3)]'}`}
        >
          {railStatus === 'SETTLED_EXTERNALLY' ? 'EXIT_COMPLETED' : 'EXECUTE_FIAT_EXIT_BRIDGE'}
        </button>
      </div>
    </div>
  );
}

function RailCard({ label, network, fee, selected, onClick }: { label: string, network: string, fee: string, selected: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 border transition-all cursor-pointer ${selected ? 'border-authority-cyan bg-authority-cyan/10 shadow-[0_0_15px_rgba(0,242,255,0.1)]' : 'border-basalt-800 bg-basalt-900 hover:border-zinc-500'}`}
    >
      <div className="text-[12px] font-black text-white tracking-widest">{label}</div>
      <div className="text-[9px] text-zinc-500 mt-1 font-bold">{network}</div>
      <div className="text-[9px] text-authority-amber mt-3 font-bold uppercase tracking-widest">FEE: {fee}</div>
    </div>
  );
}
