import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Upload, Flame, FileCheck2, Lock, Mail } from 'lucide-react';
import { sendPerformanceConfirmation } from '../../lib/email-service';

export default function VendorPortal({ onBurn }: { onBurn: (attestationId: string, amount: string) => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'ONBOARD'>('LOGIN');
  const [vendorCode, setVendorCode] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorEin, setVendorEin] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [processingState, setProcessingState] = useState<'IDLE' | 'UPLOADING' | 'BURNING' | 'ATTESTED' | 'EMAILING'>('IDLE');
  const [portalTab, setPortalTab] = useState<'PERFORMANCE' | 'ONBOARDING'>('PERFORMANCE');
  const [lastAttestation, setLastAttestation] = useState<{id: string, amount: string} | null>(null);
  const [attestations, setAttestations] = useState<{id: string, amount: string, emailed: boolean}[]>([
    { id: 'ATT-2026-991', amount: '12,000.00', emailed: true },
    { id: 'ATT-2026-992', amount: '12,000.00', emailed: true }
  ]);
  const [totalBurned, setTotalBurned] = useState(124500);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'LOGIN') {
      if (vendorCode.length > 3) {
        setIsAuthenticated(true);
        // Mock name/email for login mode
        setVendorName('EXISTING VENDOR LLC');
        setVendorEmail('vendor@example.com');
      }
    } else {
      if (vendorName.length > 2 && vendorEin.length > 5 && vendorEmail.includes('@')) {
        // Simulate generating a new vendor code
        setVendorCode(`VND-${Math.floor(Math.random() * 900) + 100}`);
        setIsAuthenticated(true);
      }
    }
  };

  const handleProcess = () => {
    if (processingState !== 'IDLE') return;
    
    setProcessingState('UPLOADING');
    setTimeout(() => {
      setProcessingState('BURNING');
      setTimeout(() => {
        const attId = `ATT-2026-${Math.floor(Math.random() * 900) + 100}`;
        const amt = "12,000.00";
        setLastAttestation({ id: attId, amount: amt });
        setProcessingState('ATTESTED');
        onBurn(attId, amt); // Trigger event in the main buffer
        setTotalBurned(prev => prev + 12000);
        
        // Trigger Email Dispatch
        setTimeout(async () => {
          setProcessingState('EMAILING');
          
          // Simulate email service
          await sendPerformanceConfirmation({
            vendorCode,
            vendorName,
            vendorEmail,
            attestationId: attId,
            burnedAmount: amt
          });
          
          setAttestations(prev => [{ id: attId, amount: amt, emailed: true }, ...prev]);

          setTimeout(() => setProcessingState('IDLE'), 4000);
        }, 1500);

      }, 2000);
    }, 1500);
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center p-8 font-mono text-zinc-200 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="bg-basalt-panel border border-basalt-800 p-8 max-w-md w-full chamfer-br relative my-auto shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-basalt-orange" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-basalt-orange" />
              <h2 className="text-xl font-black text-white tracking-widest">
                {authMode === 'LOGIN' ? '01_VENDOR_AUTH' : '01_VENDOR_ONBOARD'}
              </h2>
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest border-b border-basalt-800 pb-6 mb-6 flex justify-between items-center">
            <span>Sovereign Supply Chain Portal</span>
            <button 
              type="button"
              onClick={() => setAuthMode(authMode === 'LOGIN' ? 'ONBOARD' : 'LOGIN')}
              className="text-authority-cyan hover:text-white transition-colors underline"
            >
              {authMode === 'LOGIN' ? 'NEW VENDOR?' : 'EXISTING VENDOR?'}
            </button>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-6">
            {authMode === 'LOGIN' ? (
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 tracking-widest mb-2">
                  SECURE VENDOR CODE
                </label>
                <input 
                  type="password" 
                  value={vendorCode}
                  onChange={(e) => setVendorCode(e.target.value)}
                  className="w-full bg-basalt-bg border border-basalt-800 p-3 text-white font-mono text-sm focus:outline-none focus:border-basalt-orange transition-colors"
                  placeholder="ENTER CODE (e.g. VND-992)"
                  autoFocus
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 tracking-widest mb-2">
                    LEGAL ENTITY NAME
                  </label>
                  <input 
                    type="text" 
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full bg-basalt-bg border border-basalt-800 p-3 text-white font-mono text-sm focus:outline-none focus:border-basalt-orange transition-colors"
                    placeholder="ENTER FULL LEGAL NAME"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 tracking-widest mb-2">
                    TAX ID / EIN
                  </label>
                  <input 
                    type="text" 
                    value={vendorEin}
                    onChange={(e) => setVendorEin(e.target.value)}
                    className="w-full bg-basalt-bg border border-basalt-800 p-3 text-white font-mono text-sm focus:outline-none focus:border-basalt-orange transition-colors"
                    placeholder="XX-XXXXXXX"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 tracking-widest mb-2">
                    CONFIRMATION EMAIL
                  </label>
                  <input 
                    type="email" 
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    className="w-full bg-basalt-bg border border-basalt-800 p-3 text-white font-mono text-sm focus:outline-none focus:border-basalt-orange transition-colors"
                    placeholder="vendor@company.com"
                    required
                  />
                </div>
              </>
            )}
            
            <button 
              type="submit"
              className="w-full py-3 bg-basalt-800 hover:bg-basalt-orange hover:text-black text-xs font-black tracking-widest transition-colors text-white"
            >
              {authMode === 'LOGIN' ? 'INITIALIZE SESSION' : 'REGISTER & GENERATE CODE'}
            </button>
          </form>
          
          <div className="mt-8 pt-4 border-t border-basalt-800/50 text-[8px] text-zinc-600 tracking-widest leading-relaxed">
            ACCESS RESTRICTED TO AUTHORIZED VENDORS. ALL ACTIONS LOGGED TO THE DISTRIBUTED LEDGER. COMPLIANT WITH NISTIR 8202 DLT STANDARDS FOR STORED VALUE VAULTS.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 font-mono text-zinc-200 gap-6 max-w-6xl mx-auto min-h-0">
      <header className="flex justify-between items-end border-b border-basalt-800 pb-4 shrink-0">
        <div>
          <h2 className="text-xl font-black tracking-widest text-white flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-basalt-orange" />
            01_SUPPLY_CHAIN_PORTAL
          </h2>
          <div className="flex gap-4 mt-4">
            <button 
              onClick={() => setPortalTab('PERFORMANCE')}
              className={`text-[10px] font-bold tracking-widest pb-2 border-b-2 transition-colors ${portalTab === 'PERFORMANCE' ? 'border-basalt-orange text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              PERFORMANCE ATTESTATION
            </button>
            <button 
              onClick={() => setPortalTab('ONBOARDING')}
              className={`text-[10px] font-bold tracking-widest pb-2 border-b-2 transition-colors ${portalTab === 'ONBOARDING' ? 'border-basalt-orange text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              VENDOR ONBOARDING
            </button>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500 font-bold tracking-widest mb-1">ACTIVE SESSION</div>
          <div className="text-sm font-black text-basalt-green tracking-widest">{vendorCode.toUpperCase()}</div>
        </div>
      </header>

      {portalTab === 'PERFORMANCE' ? (
        <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
          {/* Upload & Burn Zone */}
        <div className="flex flex-col gap-6 min-h-0">
          <div className="flex-1 border border-dashed border-basalt-orange/50 p-6 flex flex-col items-center justify-center bg-basalt-orange/5 relative overflow-hidden">
            {processingState === 'IDLE' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center flex flex-col items-center w-full max-w-sm">
                <Upload className="w-10 h-10 text-basalt-orange mb-4" />
                <h3 className="text-lg font-black text-white tracking-wide mb-2">UPLOAD PERFORMANCE INSTRUMENT</h3>
                <p className="text-[9px] text-zinc-500 font-bold tracking-widest mb-6 text-center">
                  SUBMIT INVOICES, BILLS OF LADING, OR PROOF OF PERFORMANCE (PDF, XML, JSON).
                </p>
                <div 
                  className="w-full border-2 border-dashed border-basalt-800 bg-basalt-900/50 hover:bg-basalt-800 hover:border-basalt-orange transition-all p-8 mb-6 cursor-pointer flex flex-col items-center justify-center relative group"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.add('border-basalt-orange', 'bg-basalt-orange/10');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('border-basalt-orange', 'bg-basalt-orange/10');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('border-basalt-orange', 'bg-basalt-orange/10');
                    if(e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleProcess();
                    }
                  }}
                >
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    accept=".pdf,.xml,.json,.png,.jpg"
                    onChange={(e) => {
                      if(e.target.files && e.target.files.length > 0) {
                        handleProcess();
                      }
                    }}
                  />
                  <FileCheck2 className="w-6 h-6 text-zinc-500 group-hover:text-basalt-orange mb-2" />
                  <span className="text-[10px] tracking-widest font-bold text-zinc-400 group-hover:text-white uppercase transition-colors">
                    Click or Drag to Select File
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="w-full max-w-sm space-y-6 z-10">
                <div className="flex justify-between text-[10px] font-bold tracking-widest">
                  <span className={processingState === 'UPLOADING' ? 'text-authority-cyan animate-pulse' : 'text-zinc-500'}>1. UPLOAD</span>
                  <span className={processingState === 'BURNING' ? 'text-basalt-orange animate-pulse' : 'text-zinc-500'}>2. BURN</span>
                  <span className={(processingState === 'ATTESTED' || processingState === 'EMAILING') ? 'text-basalt-green' : 'text-zinc-500'}>3. ATTESTED</span>
                </div>
                
                <div className="h-1 bg-basalt-800 w-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${(processingState === 'ATTESTED' || processingState === 'EMAILING') ? 'bg-basalt-green' : processingState === 'BURNING' ? 'bg-basalt-orange' : 'bg-authority-cyan'}`}
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: processingState === 'UPLOADING' ? '33%' : 
                             processingState === 'BURNING' ? '66%' : '100%' 
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="bg-basalt-950 border border-basalt-800 p-4 font-mono text-[10px] text-zinc-400 h-40 overflow-y-auto flex flex-col gap-1">
                  {processingState === 'UPLOADING' && <>&gt; INGESTING VENDOR INSTRUMENT...<br/>&gt; VERIFYING CRYPTOGRAPHIC SIGNATURE...</>}
                  {processingState === 'BURNING' && <span className="text-basalt-orange">&gt; INSTRUMENT VERIFIED.<br/>&gt; INITIATING SMART CONTRACT BURN SEQUENCE...<br/>&gt; DESTROYING STORED VALUE TOKENS...</span>}
                  {(processingState === 'ATTESTED' || processingState === 'EMAILING') && <span className="text-basalt-green">&gt; TOKENS BURNED SUCCESSFULLY: {lastAttestation?.amount} SVT<br/>&gt; PERFORMANCE ATTESTATION GENERATED: {lastAttestation?.id}<br/>&gt; COMMITTED TO DISTRIBUTED LEDGER.</span>}
                  {processingState === 'EMAILING' && (
                    <motion.span 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="text-authority-cyan mt-2 block border-t border-basalt-800 pt-2"
                    >
                      &gt; DISPATCHING SECURE EMAIL RECEIPT...<br/>
                      &gt; TO: {vendorEmail}<br/>
                      &gt; CC: admin@sovr.credit<br/>
                      &gt; ATTACHMENT: {lastAttestation?.id}.pdf<br/>
                      &gt; STATUS: DELIVERED
                    </motion.span>
                  )}
                </div>
              </div>
            )}

            {/* Background Flame Effect during burn */}
            {processingState === 'BURNING' && (
              <motion.div 
                className="absolute inset-0 bg-basalt-orange/10 pointer-events-none"
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              />
            )}
          </div>
        </div>

        {/* Status & Attestation Panel */}
        <div className="flex flex-col gap-6 min-h-0">
          <div className="bg-basalt-panel border border-basalt-800 chamfer-br p-6 flex flex-col flex-1">
            <h3 className="text-sm font-black text-white tracking-wide mb-6 flex items-center gap-3">
              <div className="w-1 h-4 bg-basalt-green" />
              SMART CONTRACT VAULT STATUS
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-xs font-bold">
                <span className="text-zinc-400 tracking-widest">VAULT BALANCE</span>
                <span className="text-white tracking-widest">842,000.00 SVT</span>
              </div>
              <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-xs font-bold">
                <span className="text-zinc-400 tracking-widest">TOKENS BURNED (YTD)</span>
                <span className="text-basalt-orange tracking-widest">{(totalBurned).toLocaleString(undefined, { minimumFractionDigits: 2 })} SVT</span>
              </div>
              <div className="flex justify-between items-center border-b border-basalt-800/50 pb-2 text-xs font-bold">
                <span className="text-zinc-400 tracking-widest">NISTIR 8202 COMPLIANCE</span>
                <span className="text-basalt-green tracking-widest">VERIFIED</span>
              </div>
            </div>

            <div className="mt-auto">
              <h4 className="text-[10px] font-bold text-zinc-500 tracking-widest mb-3 flex items-center justify-between">
                <span>RECENT ATTESTATIONS</span>
                <Mail className="w-3 h-3 text-zinc-600" />
              </h4>
              <div className="space-y-2">
                {attestations.map((att) => (
                  <div key={att.id} className="bg-basalt-950 border border-basalt-800 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck2 className="w-4 h-4 text-basalt-green" />
                      <div>
                        <div className="text-[10px] font-bold text-white">{att.id}</div>
                        <div className="text-[8px] text-zinc-500">{att.emailed ? 'RECEIPT EMAILED' : 'PROCESSING...'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-basalt-orange">-{att.amount} SVT</div>
                      <div className="text-[8px] text-zinc-500">BURNED</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          <div className="bg-basalt-panel border border-basalt-800 p-8 max-w-md w-full chamfer-br relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-basalt-orange" />
            <h3 className="text-lg font-black text-white tracking-widest mb-6">REGISTER NEW VENDOR</h3>
            <form onSubmit={(e) => { e.preventDefault(); alert('Vendor Registered'); }} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 tracking-widest mb-2">LEGAL ENTITY NAME</label>
                <input type="text" className="w-full bg-basalt-bg border border-basalt-800 p-3 text-white font-mono text-sm focus:outline-none focus:border-basalt-orange transition-colors" placeholder="ENTER FULL LEGAL NAME" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 tracking-widest mb-2">TAX ID / EIN</label>
                <input type="text" className="w-full bg-basalt-bg border border-basalt-800 p-3 text-white font-mono text-sm focus:outline-none focus:border-basalt-orange transition-colors" placeholder="XX-XXXXXXX" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 tracking-widest mb-2">CONFIRMATION EMAIL</label>
                <input type="email" className="w-full bg-basalt-bg border border-basalt-800 p-3 text-white font-mono text-sm focus:outline-none focus:border-basalt-orange transition-colors" placeholder="vendor@company.com" required />
              </div>
              <button type="submit" className="w-full py-3 bg-basalt-800 hover:bg-basalt-orange hover:text-black text-xs font-black tracking-widest transition-colors text-white">
                REGISTER & GENERATE CODE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
