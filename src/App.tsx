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
import { tbClient, TBFlag } from './lib/tigerbeetle';

export default function App() {
  const [activeTab, setActiveTab] = useState('vendor');
  const [userRole, setUserRole] = useState<'LANDING' | 'TREASURY' | 'VENDOR'>('LANDING');
  const [rawBuffer, setRawBuffer] = useState<unknown[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ClearingEvent | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [systemFault, setSystemFault] = useState(false);
  const [sessionAudit, setSessionAudit] = useState<AuditEntry[]>([]);
  const [tbTick, setTbTick] = useState(0);

  useEffect(() => {
    const handler = () => setTbTick(t => t + 1);
    tbClient.on('change', handler);
    return () => tbClient.off('change', handler);
  }, []);

  const appendAudit = (action: string, module: string, hashOverride?: string) => {
    setSessionAudit(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      action,
      module,
      hash: hashOverride || `0x${Math.random().toString(16).slice(2, 64)}`,
      timestamp: Date.now()
    }, ...prev]);
  };

  // Simulate incoming stream of events
  useEffect(() => {
    // Initial load
    const initialEvents = Array.from({ length: 3 }, generateMockClearingEvent);
    setRawBuffer(initialEvents);
    appendAudit('SYSTEM_INITIALIZED', 'CORE');

    // Remove random auto ingestion for tighter TigerBeetle logic but keep stream for visual
    const interval = setInterval(() => {
      if (systemFault) return;
      setRawBuffer(prev => {
        const newEvent = generateMockClearingEvent();
        // Keep last 10 events
        return [newEvent, ...prev].slice(0, 10);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [systemFault]);

  const handleManualIngest = (parsedEvent?: Partial<ClearingEvent>) => {
    if (systemFault) return;

    // Trigger TigerBeetle PENDING reservation
    const amt = parsedEvent?.instrument?.value?.amount || 412000;
    tbClient.createTransfer({
      debit_account_id: 'TREASURY_MAIN',
      credit_account_id: 'VENDOR_01',
      amount: amt,
      flags: TBFlag.PENDING
    });
    appendAudit('TWO_PHASE_COMMIT_PREPARE', 'TIGERBEETLE');

    setRawBuffer(prev => {
      const newEvent = parsedEvent 
        ? { ...generateMockClearingEvent(), ...parsedEvent } as ClearingEvent
        : generateMockClearingEvent();
      return [newEvent, ...prev].slice(0, 10);
    });
    appendAudit(parsedEvent ? 'XML_INSTRUMENT_INGESTED' : 'MANUAL_INGESTION_TRIGGERED', 'INGESTION');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    appendAudit(`MODULE_SWITCHED_${tab.toUpperCase()}`, 'NAVIGATION');
  };

  const handleVendorBurn = (attestationId: string, amount: string) => {
    handleManualIngest();
    appendAudit(`VENDOR_TOKENS_BURNED_${amount}_SVT`, 'VENDOR_PORTAL', attestationId);
  };

  const handleFaultToggle = () => {
    setSystemFault(prev => !prev);
    appendAudit(systemFault ? 'SYSTEM_FAULT_CLEARED' : 'SYSTEM_FAULT_INJECTED', 'LEDGER_MAP');
  };

  // Derive topology from verified events
  const { nodes, links } = useMemo(() => {
    const verifiedEvents = rawBuffer
      .map(verifyMechanicalTruth)
      .filter((e): e is ClearingEvent => e !== null);

    const nodeMap = new Map<string, TopologyNode>();
    const links: TopologyLink[] = [];

    // Always ensure the primary authority node exists
    nodeMap.set('SOVR-PRIMARY-01', {
      id: 'SOVR-PRIMARY-01',
      group: 'authority',
      label: 'SOVR-PRIMARY-01'
    });

    verifiedEvents.forEach(event => {
      // Add Instrument Node
      nodeMap.set(event.instrument.instrumentId, {
        id: event.instrument.instrumentId,
        group: 'instrument',
        label: `${event.instrument.type.substring(0, 4)}-${event.instrument.instrumentId.substring(0, 4)}`,
        status: event.instrument.ucc9_status
      });

      // Link Authority to Instrument
      links.push({
        source: event.authority_node,
        target: event.instrument.instrumentId,
        type: 'CLEARS'
      });

      // Mock an Account Node for the instrument
      const accountId = `ACCT-${event.eventId.split('-')[1]}`;
      if (!nodeMap.has(accountId)) {
        nodeMap.set(accountId, {
          id: accountId,
          group: 'account',
          label: accountId
        });
      }

      // Link Instrument to Account
      links.push({
        source: event.instrument.instrumentId,
        target: accountId,
        type: 'SECURES'
      });
    });

    return {
      nodes: Array.from(nodeMap.values()),
      links
    };
  }, [rawBuffer]);

  const vendor1 = tbClient.accounts.get('VENDOR_01');
  const performanceGap = vendor1?.credits_pending || 0;
  const tne = tbClient.accounts.get('TREASURY_MAIN')?.credits_posted || 12440000.00;
  const taxCredit = tbClient.accounts.get('TAX_CREDIT_RESERVE')?.credits_posted || 440000.00;
  const svt = tbClient.accounts.get('STORED_VALUE_TOKENS')?.credits_posted || 8122900.50;
  const fees = tbClient.accounts.get('RAIL_FEES')?.debits_posted || 250;
  const fiatTransit = tbClient.accounts.get('EXTERNAL_FIAT_TRANSIT')?.credits_posted || 0;

  const lhr = ((tne + taxCredit) / svt).toFixed(2);
  const totalVolume = svt + fiatTransit;
  const efc = totalVolume > 0 ? ((fees / totalVolume) * 100).toFixed(4) : "0.0000";

  if (userRole === 'LANDING') {
    return (
      <LandingPage 
        onLogin={(role) => {
          setUserRole(role);
          setActiveTab(role === 'TREASURY' ? 'ingestion' : 'vendor');
          appendAudit(`USER_AUTHENTICATED: ${role}`, 'AUTH');
        }} 
      />
    );
  }

  return (
    <div className={`flex flex-col h-screen w-full bg-basalt-bg text-zinc-200 overflow-hidden selection:bg-basalt-orange/30 font-mono ${systemFault ? 'mechanical-fault' : ''}`}>
      {/* Header */}
      <header className="h-auto md:h-14 py-2 border-b border-basalt-800 flex flex-col md:flex-row md:justify-between md:items-center px-4 md:px-6 shrink-0 bg-basalt-bg z-10 relative">
        <div className="flex justify-between items-center w-full md:w-auto">
          <div className="text-sm md:text-lg font-black tracking-tighter text-white flex items-center shrink-0">
            SOVR<span className="text-basalt-orange">COR</span>
          </div>
          
          {/* Mobile Status - Hidden on Desktop */}
          <div className="md:hidden flex items-center gap-2">
            {userRole === 'TREASURY' && (
              <>
                <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${systemFault ? 'bg-mechanical-red text-mechanical-red' : 'bg-basalt-green text-basalt-green'}`} />
                <span className={`text-[8px] tracking-widest font-bold ${systemFault ? 'text-mechanical-red' : 'text-basalt-green'}`}>
                  {systemFault ? 'FAULT' : 'SYNC'}
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Identity Toggle */}
        <div className="flex md:items-center mt-3 md:mt-0 overflow-x-auto w-full md:w-auto justify-start md:justify-end pb-1 md:pb-0 scrollbar-hide">
          <div className="hidden md:block mx-4 h-6 border-l border-basalt-800 shrink-0" />
          <div className="flex bg-basalt-950 border border-basalt-800 p-0.5 rounded-sm shrink-0">
            <button 
              onClick={() => { setUserRole('TREASURY'); setActiveTab('ingestion'); }}
              className={`text-[8px] md:text-[9px] font-bold tracking-widest px-2 sm:px-3 py-1 uppercase transition-colors ${userRole === 'TREASURY' ? 'bg-authority-cyan text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              CFO_Admin
            </button>
            <button 
              onClick={() => { setUserRole('VENDOR'); setActiveTab('vendor'); }}
              className={`text-[8px] md:text-[9px] font-bold tracking-widest px-2 sm:px-3 py-1 uppercase transition-colors ${userRole === 'VENDOR' ? 'bg-basalt-orange text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Vendor_Portal
            </button>
            <button 
              onClick={() => { setUserRole('LANDING'); }}
              className={`text-[8px] md:text-[9px] font-bold tracking-widest px-2 sm:px-3 py-1 uppercase transition-colors text-zinc-600 hover:text-mechanical-red hover:bg-mechanical-red/10 border-l border-basalt-800 ml-1`}
              title="Terminate Session"
            >
              EXIT
            </button>
          </div>
        </div>
        
        {/* Desktop Status - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-4 text-[10px] font-bold tracking-widest text-zinc-400 shrink-0 ml-4">
          <span className="hidden lg:inline">SESSION: RECEIVERSHIP_9921_X</span>
          {userRole === 'TREASURY' && (
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${systemFault ? 'bg-mechanical-red text-mechanical-red' : 'bg-basalt-green text-basalt-green'}`} />
              <span className={systemFault ? 'text-mechanical-red' : 'text-basalt-green'}>
                {systemFault ? 'QUORUM FAILURE' : 'NODE SYNCHRONIZED'}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Navigation Bar - ONLY VISIBLE TO TREASURY ADMIN */}
      {userRole === 'TREASURY' && (
        <NavigationBar activeTab={activeTab} setActiveTab={handleTabChange} />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <div className="flex-1 relative bg-basalt-bg overflow-y-auto min-h-0">
          {userRole === 'VENDOR' ? (
             <div className="h-full w-full">
               <VendorPortal onBurn={handleVendorBurn} />
             </div>
          ) : (
            <>
              {activeTab === 'ingestion' && <IngestionDashboard onIngest={handleManualIngest} />}
              {activeTab === 'performance' && <PerformanceBridge />}
              {activeTab === 'topology' && <LedgerTopology nodes={nodes} links={links} systemFault={systemFault} onToggleFault={handleFaultToggle} />}
              {activeTab === 'ucc' && <UccEngine />}
              {activeTab === 'treasury' && <TreasuryHud onMint={() => { handleManualIngest(); }} systemFault={systemFault} onAudit={appendAudit} />}
              {activeTab === 'fiat_bridge' && <RailBridge onExecute={() => appendAudit('RAIL_EXIT_EXECUTED', 'TIGERBEETLE')} />}
              {activeTab === 'tax_engine' && <TaxStrategy />}
              {activeTab === 'transactions' && (
                <LedgerHistory 
                  transactions={rawBuffer} 
                  selectedClient={selectedClient} 
                  onClearClient={() => setSelectedClient(null)} 
                  onSelectEvent={setSelectedEvent} 
                />
              )}
            </>
          )}
        </div>

        {/* Stacked Logs Column - ONLY VISIBLE TO TREASURY ON DESKTOP */}
        {userRole === 'TREASURY' && (
          <div className="hidden lg:flex w-80 flex-col border-l border-basalt-800 bg-basalt-bg shrink-0 z-10 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-hidden">
              <TruthStream rawBuffer={rawBuffer} onSelectEvent={setSelectedEvent} />
            </div>
            <div className="flex-1 min-h-0 overflow-hidden border-t border-basalt-800">
              <AuditLog entries={sessionAudit} />
            </div>
          </div>
        )}
      </div>

      {/* Footer - ONLY VISIBLE TO TREASURY */}
      {userRole === 'TREASURY' && (
      <footer className="h-auto md:h-20 py-4 md:py-0 border-t border-basalt-800 flex flex-col md:flex-row items-start md:items-center px-4 md:px-6 shrink-0 bg-basalt-panel z-10 gap-4 md:gap-0">
        <div className="grid grid-cols-2 md:flex gap-4 md:gap-12 w-full md:w-auto md:flex-1">
          <div>
            <div className="text-[9px] md:text-[10px] text-zinc-500 font-bold tracking-widest mb-1 uppercase">Liquidity Health Ratio</div>
            <div className="text-base md:text-xl font-black text-basalt-green tracking-wide">{lhr}</div>
            <div className="hidden md:block text-[8px] text-zinc-600 font-bold tracking-widest mt-0.5 uppercase">LHR OVER 1.0 (SOLVENT)</div>
          </div>
          <div>
            <div className="text-[9px] md:text-[10px] text-zinc-500 font-bold tracking-widest mb-1 uppercase">Performance Gap</div>
            <div className={`text-base md:text-xl font-black ${performanceGap > 0 ? 'text-authority-amber' : 'text-zinc-500'} tracking-wide`}>
              ${(performanceGap).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="hidden md:block text-[8px] text-zinc-600 font-bold tracking-widest mt-0.5 uppercase">TigerBeetle Two-Phase Pending</div>
          </div>
          <div className="hidden sm:block">
            <div className="text-[9px] md:text-[10px] text-zinc-500 font-bold tracking-widest mb-1 uppercase">Treasury Cash (Asset)</div>
            <div className="text-base md:text-xl font-black text-white tracking-wide">${(tne).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="hidden md:block text-[8px] text-zinc-600 font-bold tracking-widest mt-0.5 uppercase">Liquid Pool Available</div>
          </div>
          <div className="hidden sm:block">
            <div className="text-[9px] md:text-[10px] text-zinc-500 font-bold tracking-widest mb-1 uppercase">External Friction (EFC)</div>
            <div className="text-base md:text-xl font-black text-mechanical-red tracking-wide">{efc}%</div>
            <div className="hidden md:block text-[8px] text-zinc-600 font-bold tracking-widest mt-0.5 uppercase">Legacy Rail Value Leak</div>
          </div>
        </div>
        <div className="hidden lg:flex ml-auto flex-col items-end shrink-0">
          <div className="text-[10px] font-bold text-basalt-green tracking-widest mb-1">
            ALL OPERATIONS CONFINED TO PRIVATE LEDGER
          </div>
          <div className="text-[8px] text-zinc-500 font-mono">
            Zero external exposure. Total systemic sovereignty.
          </div>
        </div>
      </footer>
      )}

      {/* Transaction Modal Overlay */}
      {selectedEvent && (
        <TransactionModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onSelectClient={(client) => {
            setSelectedClient(client);
            setActiveTab('transactions');
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}
