import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Upload, Flame, FileCheck2, Lock, Mail } from 'lucide-react';
import { sendPerformanceConfirmation } from '../../lib/email-service';
import { api } from '../../lib/api-client';

export default function VendorPortal({ onBurn }: { onBurn: (attestationId: string, amount: string) => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!api.getToken());
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'LOGIN') {
      try {
        const data = await api.login({ username: vendorCode, password: 'password123' });
        setIsAuthenticated(true);
        setVendorName(data.user.username);
        setVendorEmail('vendor@example.com');
      } catch (e) { alert("Invalid Vendor Code"); }
    } else {
      if (vendorName.length > 2 && vendorEin.length > 5 && vendorEmail.includes('@')) {
        try {
          const data = await api.login({ username: vendorName.replace(/\s/g, '_'), password: 'password123' });
          setVendorCode(data.user.username);
          setIsAuthenticated(true);
        } catch (e) { alert("Registration failed"); }
      }
    }
  };

  const handleProcess = async () => {
    if (processingState !== 'IDLE') return;
    setProcessingState('UPLOADING');
    const attId = `ATT-2026-${Math.floor(Math.random() * 900) + 100}`;
    const amt = 12000;
    try {
      await api.submitProof({ reference_invoice_id: 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase(), proof_type: 'DIGITAL_SIGNATURE', verification_hash: '0x' + Math.random().toString(16).substring(2, 66), performance_delta: 1.0 });
      setProcessingState('BURNING');
      await api.createTransfer({ debit_account_id: 'VENDOR_01', credit_account_id: 'STORED_VALUE_TOKENS', amount: amt, flags: 0 });
      setLastAttestation({ id: attId, amount: amt.toLocaleString() });
      setProcessingState('ATTESTED');
      onBurn(attId, amt.toString());
      setTotalBurned(prev => prev + amt);
      setTimeout(async () => {
        setProcessingState('EMAILING');
        await sendPerformanceConfirmation({ vendorCode, vendorName, vendorEmail, attestationId: attId, burnedAmount: amt.toString() });
        setAttestations(prev => [{ id: attId, amount: amt.toLocaleString(), emailed: true }, ...prev]);
        setTimeout(() => setProcessingState('IDLE'), 4000);
      }, 1500);
    } catch (e) { console.error(e); setProcessingState('IDLE'); }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center p-8 font-mono text-zinc-200 overflow-y-auto bg-basalt-950">
        <div className="bg-basalt-panel border border-basalt-800 p-8 max-w-md w-full relative">
          <h2 className="text-xl font-black text-white tracking-widest mb-6">{authMode === 'LOGIN' ? '01_VENDOR_AUTH' : '01_VENDOR_ONBOARD'}</h2>
          <form onSubmit={handleAuth} className="space-y-6">
            {authMode === 'LOGIN' ? (
              <input type="password" value={vendorCode} onChange={(e) => setVendorCode(e.target.value)} className="w-full bg-basalt-bg border border-basalt-800 p-3 text-white focus:border-basalt-orange outline-none" placeholder="ENTER CODE" />
            ) : (
              <input type="text" value={vendorName} onChange={(e) => setVendorName(e.target.value)} className="w-full bg-basalt-bg border border-basalt-800 p-3 text-white focus:border-basalt-orange outline-none" placeholder="LEGAL NAME" />
            )}
            <button type="submit" className="w-full py-3 bg-basalt-800 hover:bg-basalt-orange hover:text-black text-xs font-black tracking-widest transition-colors text-white">{authMode === 'LOGIN' ? 'INITIALIZE SESSION' : 'REGISTER'}</button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'LOGIN' ? 'ONBOARD' : 'LOGIN')} className="mt-4 text-[10px] text-authority-cyan uppercase underline">{authMode === 'LOGIN' ? 'NEW VENDOR?' : 'EXISTING VENDOR?'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 font-mono text-zinc-200 gap-6 max-w-6xl mx-auto">
      <header className="flex justify-between items-end border-b border-basalt-800 pb-4">
        <h2 className="text-xl font-black tracking-widest text-white flex items-center gap-3"><ShieldAlert className="w-6 h-6 text-basalt-orange" /> 01_SUPPLY_CHAIN_PORTAL</h2>
        <div className="text-right"><div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">ACTIVE SESSION</div><div className="text-sm font-black text-basalt-green tracking-widest">{vendorCode.toUpperCase()}</div></div>
      </header>
      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
        <div className="border border-dashed border-basalt-orange/50 p-6 flex flex-col items-center justify-center bg-basalt-orange/5 relative">
          {processingState === 'IDLE' ? (
            <div onClick={handleProcess} className="cursor-pointer text-center"><Upload className="w-10 h-10 text-basalt-orange mx-auto mb-4" /><h3 className="text-lg font-black text-white uppercase">Upload Performance Instrument</h3></div>
          ) : (
            <div className="w-full max-w-sm text-center">
              <div className="text-[10px] font-bold mb-4 uppercase">{processingState}</div>
              <div className="h-1 bg-basalt-800 w-full mb-4"><motion.div className="h-full bg-basalt-orange" initial={{ width: 0 }} animate={{ width: '100%' }} /></div>
            </div>
          )}
        </div>
        <div className="bg-basalt-panel border border-basalt-800 p-6 flex flex-col">
          <h3 className="text-sm font-black text-white mb-6 uppercase underline">Vault Status</h3>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-xs font-bold uppercase text-zinc-400"><span>Vault Balance</span><span className="text-white">842,000 SVT</span></div>
            <div className="flex justify-between text-xs font-bold uppercase text-zinc-400"><span>Tokens Burned</span><span className="text-basalt-orange">{totalBurned.toLocaleString()} SVT</span></div>
          </div>
          <div className="mt-auto space-y-2 max-h-40 overflow-y-auto">
            {attestations.map(a => <div key={a.id} className="bg-basalt-950 border border-basalt-800 p-3 flex justify-between items-center text-[10px] uppercase font-bold"><span>{a.id}</span><span className="text-basalt-orange">-{a.amount} SVT</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
