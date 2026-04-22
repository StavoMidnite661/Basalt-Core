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
    <div className="h-full flex flex-col p-4 md:p-6 font-mono text-zinc-200 gap-4 md:gap-6 max-w-6xl mx-auto min-h-0">
      {/* Header */}
      <h2 className="text-lg md:text-xl font-black text-white shrink-0 tracking-widest flex flex-col sm:flex-row justify-between items-start sm:items-center bg-basalt-bg border-b border-basalt-800 pb-2 md:pb-4 gap-2 sm:gap-0">
        <span className="truncate w-full">01_LIABILITY_INGESTION (ISO 20022)</span>
        <div className="text-[8px] md:text-[10px] text-zinc-500 font-bold bg-basalt-panel px-2 py-1 md:px-3 border border-basalt-800 uppercase shrink-0">
          Originating Assets
        </div>
      </h2>

      {/* Top Drop Zone / XML Input */}
      <div className="border border-basalt-800 p-4 md:p-6 flex flex-col bg-basalt-panel shrink-0 relative group">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2 md:gap-0">
          <div className="text-authority-cyan text-[9px] md:text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
            <FileCode2 className="w-3 h-3 md:w-4 md:h-4" />
            ISO 20022 Deep Parser
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide relative z-10 shrink-0">
            <button onClick={loadMockCamt} className="shrink-0 text-[8px] md:text-[9px] bg-basalt-800 hover:bg-basalt-700 px-2 md:px-3 py-1 text-zinc-300 font-bold tracking-widest transition-colors whitespace-nowrap">
              LOAD CAMT
            </button>
            <button onClick={loadMockPain} className="shrink-0 text-[8px] md:text-[9px] bg-basalt-800 hover:bg-basalt-700 px-2 md:px-3 py-1 text-zinc-300 font-bold tracking-widest transition-colors whitespace-nowrap">
              LOAD PAIN
            </button>
            <button onClick={() => document.getElementById('iso-upload')?.click()} className="shrink-0 text-[8px] md:text-[9px] border border-authority-cyan/50 text-authority-cyan hover:bg-authority-cyan hover:text-black px-2 md:px-3 py-1 font-black tracking-widest transition-colors whitespace-nowrap">
              UPLOAD XML
            </button>
            <input 
              type="file" 
              id="iso-upload" 
              className="hidden" 
              accept=".xml"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const text = e.target?.result;
                    if (typeof text === 'string') {
                      setXmlInput(text);
                    }
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </div>
        </div>
        
        <textarea 
          value={xmlInput}
          onChange={(e) => setXmlInput(e.target.value)}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.add('border-authority-cyan', 'bg-authority-cyan/5');
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('border-authority-cyan', 'bg-authority-cyan/5');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('border-authority-cyan', 'bg-authority-cyan/5');
            const file = e.dataTransfer.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const text = e.target?.result;
                if (typeof text === 'string') {
                  setXmlInput(text);
                }
              };
              reader.readAsText(file);
            }
          }}
          placeholder="Paste raw ISO 20022 XML here, or drag and drop an .xml file..."
          className="w-full h-24 md:h-32 bg-basalt-950 border border-basalt-800 p-2 md:p-4 text-[9px] md:text-[10px] text-zinc-400 font-mono focus:outline-none focus:border-authority-cyan transition-colors resize-none mb-4 relative z-10"
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          {parseError ? (
            <div className="text-mechanical-red text-[8px] md:text-[10px] font-bold tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span className="line-clamp-2">{parseError}</span>
            </div>
          ) : parsedEvent ? (
            <div className="text-basalt-green text-[8px] md:text-[10px] font-bold tracking-widest flex items-center gap-2">
              <Upload className="w-3 h-3 shrink-0" />
              XML PARSED SUCCESSFULLY: {parsedEvent.eventId}
            </div>
          ) : (
            <div className="text-zinc-500 text-[8px] md:text-[10px] font-bold tracking-widest">AWAITING XML INPUT</div>
          )}

          <button 
            onClick={handleParse}
            disabled={!xmlInput.trim()}
            className="w-full sm:w-auto bg-authority-cyan text-black px-4 md:px-8 py-2 text-[9px] md:text-[10px] font-black tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            PARSE & VALIDATE
          </button>
        </div>
      </div>

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1 overflow-y-auto min-h-0 md:overflow-visible">
         {/* Panel 1 */}
         <div className="bg-basalt-panel border border-basalt-800 p-4 md:p-6 flex flex-col min-h-0 shrink-0 lg:shrink">
           <h3 className="text-xs md:text-sm font-black text-white tracking-widest mb-4 md:mb-6 flex items-center gap-2 md:gap-3 shrink-0 uppercase">
             <div className="w-1 h-3 md:h-4 bg-basalt-orange shrink-0" />
             <span className="truncate">Instrument Characterization</span>
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

           <div className="mt-auto h-8 md:h-12 bg-stripes border border-basalt-800/30 shrink-0 opacity-20" />
         </div>

         {/* Panel 2 */}
         <div className="bg-basalt-panel border border-basalt-800 p-4 md:p-6 flex flex-col min-h-0 shrink-0 lg:shrink">
           <h3 className="text-xs md:text-sm font-black text-white tracking-widest mb-2 md:mb-4 flex items-center gap-2 md:gap-3 shrink-0 uppercase">
             <div className="w-1 h-3 md:h-4 bg-basalt-orange shrink-0" />
             <span className="truncate">UCC-9 Re-Characterization</span>
           </h3>
           <p className="text-[8px] md:text-[9px] text-zinc-500 font-bold tracking-widest mb-4 md:mb-6 shrink-0 uppercase">Transformation of liability to private credit.</p>
           
           <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 overflow-y-auto pr-2">
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
