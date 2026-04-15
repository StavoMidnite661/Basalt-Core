import React, { useState } from 'react';
import { ISO20022Parser } from '../../lib/parsers';
import { ClearingEvent } from '../../lib/schemas';
import { FileCode2, Upload, AlertTriangle } from 'lucide-react';

export default function IngestionDashboard({ onIngest }: { onIngest: (event?: Partial<ClearingEvent>) => void }) {
  const [xmlInput, setXmlInput] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedEvent, setParsedEvent] = useState<Partial<ClearingEvent> | null>(null);

  const handleParse = () => {
    try {
      setParseError(null);
      if (!xmlInput.trim()) throw new Error("XML input is empty.");
      const event = ISO20022Parser.parse(xmlInput);
      setParsedEvent(event);
    } catch (err: any) {
      setParseError(err.message);
      setParsedEvent(null);
    }
  };

  const loadMockCamt = () => {
    setXmlInput(`<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>CAMT-053-99281</MsgId>
      <CreDtTm>2026-04-14T10:00:00Z</CreDtTm>
    </GrpHdr>
    <Stmt>
      <Id>STMT-99281-A</Id>
      <Bal>
        <Tp>
          <CdOrPrtry><Cd>CLBD</Cd></CdOrPrtry>
        </Tp>
        <Amt Ccy="USD">412000.00</Amt>
      </Bal>
    </Stmt>
  </BkToCstmrStmt>
</Document>`);
  };

  const loadMockPain = () => {
    setXmlInput(`<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>PAIN-001-55421</MsgId>
      <CreDtTm>2026-04-14T11:30:00Z</CreDtTm>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMT-55421-B</PmtInfId>
      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>E2E-55421</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="EUR">85000.50</InstdAmt>
        </Amt>
      </CdtTrfTxInf>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`);
  };

  const handleExecute = () => {
    if (parsedEvent) {
      onIngest(parsedEvent);
      setXmlInput('');
      setParsedEvent(null);
    } else {
      onIngest(); // Fallback to random mock if no parsed event
    }
  };

  return (
    <div className="h-full flex flex-col p-6 font-mono text-zinc-200 gap-6 max-w-6xl mx-auto min-h-0">
      {/* Top Drop Zone / XML Input */}
      <div className="border border-basalt-800 p-6 flex flex-col bg-basalt-panel shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div className="text-authority-cyan text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
            <FileCode2 className="w-4 h-4" />
            ISO 20022 Deep Parser (CAMT.053 / PAIN.001)
          </div>
          <div className="flex gap-2">
            <button onClick={loadMockCamt} className="text-[9px] bg-basalt-800 hover:bg-basalt-700 px-3 py-1 text-zinc-300 font-bold tracking-widest transition-colors">
              LOAD MOCK CAMT.053
            </button>
            <button onClick={loadMockPain} className="text-[9px] bg-basalt-800 hover:bg-basalt-700 px-3 py-1 text-zinc-300 font-bold tracking-widest transition-colors">
              LOAD MOCK PAIN.001
            </button>
          </div>
        </div>
        
        <textarea 
          value={xmlInput}
          onChange={(e) => setXmlInput(e.target.value)}
          placeholder="Paste raw ISO 20022 XML here..."
          className="w-full h-32 bg-basalt-950 border border-basalt-800 p-4 text-[10px] text-zinc-400 font-mono focus:outline-none focus:border-authority-cyan transition-colors resize-none mb-4"
        />

        <div className="flex justify-between items-center">
          {parseError ? (
            <div className="text-mechanical-red text-[10px] font-bold tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              {parseError}
            </div>
          ) : parsedEvent ? (
            <div className="text-basalt-green text-[10px] font-bold tracking-widest flex items-center gap-2">
              <Upload className="w-3 h-3" />
              XML PARSED SUCCESSFULLY: {parsedEvent.eventId}
            </div>
          ) : (
            <div className="text-zinc-500 text-[10px] font-bold tracking-widest">AWAITING XML INPUT</div>
          )}

          <button 
            onClick={handleParse}
            disabled={!xmlInput.trim()}
            className="bg-authority-cyan text-black px-8 py-2 text-[10px] font-black tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            PARSE & VALIDATE
          </button>
        </div>
      </div>

      {/* Bottom Panels */}
      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
         {/* Panel 1 */}
         <div className="bg-basalt-panel border border-basalt-800 p-6 flex flex-col min-h-0">
           <h3 className="text-sm font-black text-white tracking-widest mb-6 flex items-center gap-3 shrink-0 uppercase">
             <div className="w-1 h-4 bg-basalt-orange" />
             Instrument Characterization
           </h3>
           
           <div className="space-y-4 overflow-y-auto pr-2">
             <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-[10px] font-bold uppercase">
               <span className="text-zinc-500 tracking-widest">ISO 20022 TYPE</span>
               <span className="text-authority-cyan tracking-widest">{parsedEvent?.instrument?.iso_20022_type || 'N/A'}</span>
             </div>
             <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-[10px] font-bold uppercase">
               <span className="text-zinc-500 tracking-widest">INSTRUMENT CLASS</span>
               <span className="text-white tracking-widest">{parsedEvent?.instrument?.type.replace('_', ' ') || 'N/A'}</span>
             </div>
             <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-[10px] font-bold uppercase">
               <span className="text-zinc-500 tracking-widest">UCC-9 STATUS</span>
               <span className="text-white tracking-widest">{parsedEvent?.instrument?.ucc9_status || 'N/A'}</span>
             </div>
             <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-[10px] font-bold uppercase">
               <span className="text-zinc-500 tracking-widest">CRYPTOGRAPHIC HASH</span>
               <span className="text-zinc-400 font-mono truncate max-w-[150px]">{parsedEvent?.instrument?.hash_signature || 'N/A'}</span>
             </div>
           </div>

           <div className="mt-auto h-12 bg-stripes border border-basalt-800/30 shrink-0 opacity-20" />
         </div>

         {/* Panel 2 */}
         <div className="bg-basalt-panel border border-basalt-800 p-6 flex flex-col min-h-0">
           <h3 className="text-sm font-black text-white tracking-widest mb-4 flex items-center gap-3 shrink-0 uppercase">
             <div className="w-1 h-4 bg-basalt-orange" />
             UCC-9 Re-Characterization
           </h3>
           <p className="text-[9px] text-zinc-500 font-bold tracking-widest mb-6 shrink-0 uppercase">Transformation of liability to private credit via stored value mechanism.</p>
           
           <div className="space-y-4 mb-6 overflow-y-auto pr-2">
             <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-[10px] font-bold uppercase">
               <span className="text-zinc-500 tracking-widest">FACE VALUE</span>
               <span className="text-white tracking-widest">
                 {parsedEvent?.instrument?.value?.amount 
                   ? `$${parsedEvent.instrument.value.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${parsedEvent.instrument.value.currency}` 
                   : 'N/A'}
               </span>
             </div>
             <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-[10px] font-bold uppercase">
               <span className="text-zinc-500 tracking-widest">ADJ. BASIS</span>
               <span className="text-basalt-green tracking-widest">
                 {parsedEvent?.instrument?.value?.amount 
                   ? `$${(parsedEvent.instrument.value.amount * 0.9998).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${parsedEvent.instrument.value.currency}` 
                   : 'N/A'}
               </span>
             </div>
             <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-[10px] font-bold uppercase">
               <span className="text-zinc-500 tracking-widest">REMITTANCE PATH</span>
               <span className="text-white tracking-widest">{parsedEvent ? 'IRM-10.1.2' : 'N/A'}</span>
             </div>
           </div>

           <button 
             onClick={handleExecute}
             disabled={!parsedEvent}
             className="mt-auto w-full py-4 border border-basalt-800 hover:bg-basalt-800 text-[10px] font-bold tracking-widest transition-colors text-white shrink-0 uppercase disabled:opacity-30 disabled:cursor-not-allowed"
           >
             EXECUTE PERFORMANCE & INGEST
           </button>
         </div>
      </div>
    </div>
  );
}
