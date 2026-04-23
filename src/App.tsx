import React, { useState, useEffect, useMemo } from 'react';
import TruthStream from './components/TruthStream/Settlement';
import LedgerTopology, { TopologyNode, TopologyLink } from './components/TopologyMap/LedgerTopology';
import IngestionDashboard from './components/Dashboard/Ingestion';
import UccEngine from './components/UccEngine/Compliance';
import TreasuryHud from './components/Treasury/Hud';
import RailBridge from './components/Treasury/RailBridge';
import NavigationBar from './components/PrivateLedger/Sidebar';
import VendorPortal from './components/Vendor/Portal';
import TaxStrategy from './components/TaxEngine/TaxStrategy';
import LedgerHistory from './components/PrivateLedger/LedgerHistory';
import TransactionModal from './components/TruthStream/TransactionModal';
import AuditLog, { AuditEntry } from './components/PrivateLedger/AuditLog';
import PerformanceBridge from './components/Performance/Bridge';
import LandingPage from './components/LandingPage';
import { generateMockClearingEvent } from './lib/truth-engine';
import { ClearingEvent } from './lib/schemas';
import { verifyMechanicalTruth } from './lib/truth-gate';
import { TBFlag } from './lib/tigerbeetle';
import { api } from './lib/api-client';

export default function App() {
  const [activeTab, setActiveTab] = useState('vendor');
  const [userRole, setUserRole] = useState<'LANDING' | 'TREASURY' | 'VENDOR'>('LANDING');
  const [rawBuffer, setRawBuffer] = useState<unknown[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ClearingEvent | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [systemFault, setSystemFault] = useState(false);
  const [sessionAudit, setSessionAudit] = useState<AuditEntry[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  const fetchState = async () => {
    if (userRole === 'LANDING') return;
    try {
      const [accs, audits, trfs] = await Promise.all([
        api.getAccounts(),
        userRole === 'TREASURY' ? api.getAuditLogs() : Promise.resolve([]),
        api.getTransfers()
      ]);
      setAccounts(Array.isArray(accs) ? accs : []);
      setSessionAudit(Array.isArray(audits) ? audits : []);
      if (Array.isArray(trfs)) {
        setRawBuffer(trfs.map((t: any) => ({
          timestamp: t.timestamp,
          eventId: t.id,
          instrument: {
            instrumentId: `INST-${t.id.split('-')[1] || 'UNK'}`,
            type: 'PROMISSORY_NOTE',
            iso_20022_type: 'pain.001',
            value: { amount: t.amount, currency: 'USD' },
            ucc9_status: 'PERFECTED',
            hash_signature: '0xSIMULATED'
          },
          status: t.flags === 1 ? 'PENDING' : 'CLEARED',
          authority_node: 'SOVR-PRIMARY-01'
        })));
      }
    } catch (e) {
      console.error("Failed to fetch state", e);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, [userRole]);

  const appendAudit = (action: string, module: string) => {
    fetchState();
  };

  const handleManualIngest = async (parsedEvent?: Partial<ClearingEvent>) => {
    if (systemFault) return;
    const amt = parsedEvent?.instrument?.value?.amount || 412000;
    try {
      await api.createTransfer({ debit_account_id: 'TREASURY_MAIN', credit_account_id: 'VENDOR_01', amount: amt, flags: 1 });
      fetchState();
    } catch (e) { console.error(e); }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    appendAudit(`MODULE_SWITCHED_${tab.toUpperCase()}`, 'NAVIGATION');
  };

  const handleVendorBurn = (attestationId: string, amount: string) => {
    handleManualIngest();
  };

  const handleFaultToggle = () => {
    setSystemFault(prev => !prev);
  };

  const { nodes, links } = useMemo(() => {
    const verifiedEvents = (rawBuffer || []).map(verifyMechanicalTruth).filter((e): e is ClearingEvent => e !== null);
    const nodeMap = new Map<string, TopologyNode>();
    const links: TopologyLink[] = [];
    nodeMap.set('SOVR-PRIMARY-01', { id: 'SOVR-PRIMARY-01', group: 'authority', label: 'SOVR-PRIMARY-01' });
    verifiedEvents.forEach(event => {
      nodeMap.set(event.instrument.instrumentId, { id: event.instrument.instrumentId, group: 'instrument', label: `INST-${event.instrument.instrumentId.substring(0, 4)}`, status: event.instrument.ucc9_status });
      links.push({ source: event.authority_node, target: event.instrument.instrumentId, type: 'CLEARS' });
    });
    return { nodes: Array.from(nodeMap.values()), links };
  }, [rawBuffer]);

  const getAcc = (id: string) => accounts.find(a => a.id === id);
  const vendor1 = getAcc('VENDOR_01');
  const performanceGap = vendor1?.credits_pending || 0;
  const tne = getAcc('TREASURY_MAIN')?.credits_posted || 12440000.00;
  const taxCredit = getAcc('TAX_CREDIT_RESERVE')?.credits_posted || 440000.00;
  const svt = getAcc('STORED_VALUE_TOKENS')?.credits_posted || 8122900.50;
  const fees = getAcc('RAIL_FEES')?.debits_posted || 250;
  const lhr = ((tne + taxCredit) / svt).toFixed(2);

  if (userRole === 'LANDING') {
    return (
      <LandingPage 
        onLogin={async (role) => {
          try {
            const data = await api.login({ username: role === 'TREASURY' ? 'admin_demo' : 'vendor_demo', password: 'password123' });
            setUserRole(data.user.role);
            setActiveTab(data.user.role === 'TREASURY' ? 'ingestion' : 'vendor');
          } catch (e) { alert("Login failed"); }
        }} 
      />
    );
  }

  return (
    <div className={`flex flex-col h-screen w-full bg-basalt-bg text-zinc-200 overflow-hidden font-mono ${systemFault ? 'mechanical-fault' : ''}`}>
      <header className="h-14 border-b border-basalt-800 flex justify-between items-center px-6 shrink-0 bg-basalt-bg z-10">
        <div className="text-lg font-black tracking-tighter text-white">SOVR<span className="text-basalt-orange">COR</span></div>
        <div className="flex bg-basalt-950 border border-basalt-800 p-0.5 rounded-sm">
          <button onClick={() => { setUserRole('TREASURY'); setActiveTab('ingestion'); }} className={`text-[9px] font-bold tracking-widest px-3 py-1 uppercase transition-colors ${userRole === 'TREASURY' ? 'bg-authority-cyan text-black' : 'text-zinc-500'}`}>CFO_Admin</button>
          <button onClick={() => { setUserRole('VENDOR'); setActiveTab('vendor'); }} className={`text-[9px] font-bold tracking-widest px-3 py-1 uppercase transition-colors ${userRole === 'VENDOR' ? 'bg-basalt-orange text-black' : 'text-zinc-500'}`}>Vendor_Portal</button>
          <button onClick={() => setUserRole('LANDING')} className="text-[9px] font-bold tracking-widest px-3 py-1 uppercase text-zinc-600 border-l border-basalt-800">EXIT</button>
        </div>
      </header>
      {userRole === 'TREASURY' && <NavigationBar activeTab={activeTab} setActiveTab={handleTabChange} />}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <div className="flex-1 relative bg-basalt-bg overflow-y-auto">
          {userRole === 'VENDOR' ? <VendorPortal onBurn={handleVendorBurn} /> : (
            <>
              {activeTab === 'ingestion' && <IngestionDashboard onIngest={handleManualIngest} />}
              {activeTab === 'performance' && <PerformanceBridge />}
              {activeTab === 'topology' && <LedgerTopology nodes={nodes} links={links} systemFault={systemFault} onToggleFault={handleFaultToggle} />}
              {activeTab === 'ucc' && <UccEngine />}
              {activeTab === 'treasury' && <TreasuryHud onMint={() => fetchState()} systemFault={systemFault} onAudit={appendAudit} />}
              {activeTab === 'fiat_bridge' && <RailBridge onExecute={() => fetchState()} />}
              {activeTab === 'tax_engine' && <TaxStrategy />}
              {activeTab === 'transactions' && <LedgerHistory transactions={rawBuffer} selectedClient={selectedClient} onClearClient={() => setSelectedClient(null)} onSelectEvent={setSelectedEvent} />}
            </>
          )}
        </div>
        {userRole === 'TREASURY' && (
          <div className="hidden lg:flex w-80 flex-col border-l border-basalt-800 bg-basalt-bg shrink-0 z-10 overflow-hidden">
            <TruthStream rawBuffer={rawBuffer} onSelectEvent={setSelectedEvent} />
            <AuditLog entries={sessionAudit} />
          </div>
        )}
      </div>
      {userRole === 'TREASURY' && (
        <footer className="h-20 border-t border-basalt-800 flex items-center px-6 shrink-0 bg-basalt-panel z-10">
          <div className="flex gap-12 flex-1">
            <div><div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Liquidity Ratio</div><div className="text-xl font-black text-basalt-green">{lhr}</div></div>
            <div><div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Performance Gap</div><div className="text-xl font-black text-authority-amber">${performanceGap.toLocaleString()}</div></div>
            <div><div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Treasury Cash</div><div className="text-xl font-black text-white">${tne.toLocaleString()}</div></div>
          </div>
        </footer>
      )}
      {selectedEvent && <TransactionModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}
