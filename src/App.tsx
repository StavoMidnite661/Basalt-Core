import React, { useState, useEffect, useMemo } from 'react';
import TruthStream from './components/TruthStream/Settlement';
import LedgerTopology, { TopologyNode, TopologyLink } from './components/TopologyMap/LedgerTopology';
import IngestionDashboard from './components/Dashboard/Ingestion';
import UccEngine from './components/UccEngine/Compliance';
import TreasuryHud from './components/Treasury/Hud';
import NavigationBar from './components/PrivateLedger/Sidebar';
import VendorPortal from './components/Vendor/Portal';
import TaxStrategy from './components/TaxEngine/TaxStrategy';
import LedgerHistory from './components/PrivateLedger/LedgerHistory';
import TransactionModal from './components/TruthStream/TransactionModal';
import AuditLog, { AuditEntry } from './components/PrivateLedger/AuditLog';
import { generateMockClearingEvent } from './lib/truth-engine';
import { ClearingEvent } from './lib/schemas';
import { verifyMechanicalTruth } from './lib/truth-gate';

export default function App() {
  const [activeTab, setActiveTab] = useState('ingestion');
  const [rawBuffer, setRawBuffer] = useState<unknown[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ClearingEvent | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [systemFault, setSystemFault] = useState(false);
  const [sessionAudit, setSessionAudit] = useState<AuditEntry[]>([]);

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

  return (
    <div className={`flex flex-col h-screen w-full bg-basalt-bg text-zinc-200 overflow-hidden selection:bg-basalt-orange/30 font-mono ${systemFault ? 'mechanical-fault' : ''}`}>
      {/* Header */}
      <header className="h-14 border-b border-basalt-800 flex justify-between items-center px-6 shrink-0 bg-basalt-bg z-10">
        <div className="text-lg font-black tracking-tighter text-white">
          SOVR<span className="text-basalt-orange">COR</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-zinc-400">
          <span>SESSION: RECEIVERSHIP_9921_X</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${systemFault ? 'bg-mechanical-red text-mechanical-red' : 'bg-basalt-green text-basalt-green'}`} />
            <span className={systemFault ? 'text-mechanical-red' : 'text-basalt-green'}>
              {systemFault ? 'QUORUM FAILURE' : 'NODE SYNCHRONIZED'}
            </span>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <NavigationBar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <div className="flex-1 relative bg-basalt-bg overflow-y-auto min-h-0">
          {activeTab === 'ingestion' && <IngestionDashboard onIngest={handleManualIngest} />}
          {activeTab === 'topology' && <LedgerTopology nodes={nodes} links={links} systemFault={systemFault} onToggleFault={handleFaultToggle} />}
          {activeTab === 'ucc' && <UccEngine />}
          {activeTab === 'treasury' && <TreasuryHud onMint={() => { handleManualIngest(); }} systemFault={systemFault} onAudit={appendAudit} />}
          {activeTab === 'tax_engine' && <TaxStrategy />}
          {activeTab === 'vendor' && <VendorPortal onBurn={handleVendorBurn} />}
          {activeTab === 'transactions' && (
            <LedgerHistory 
              transactions={rawBuffer} 
              selectedClient={selectedClient} 
              onClearClient={() => setSelectedClient(null)} 
              onSelectEvent={setSelectedEvent} 
            />
          )}
        </div>

        {/* Stacked Logs Column */}
        <div className="w-80 flex flex-col border-l border-basalt-800 bg-basalt-bg shrink-0 z-10">
          <div className="flex-1 min-h-0 overflow-hidden">
            <TruthStream rawBuffer={rawBuffer} onSelectEvent={setSelectedEvent} />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden border-t border-basalt-800">
            <AuditLog entries={sessionAudit} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="h-20 border-t border-basalt-800 flex items-center px-6 shrink-0 bg-basalt-panel z-10">
        <div className="flex gap-16">
          <div>
            <div className="text-[10px] text-zinc-500 font-bold tracking-widest mb-1">TOTAL PERFORMANCE VALUE</div>
            <div className="text-xl font-black text-basalt-green tracking-wide">$12,842,001.00</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-bold tracking-widest mb-1">REAL-TIME GAIN (HODL)</div>
            <div className="text-xl font-black text-white tracking-wide">+4.22%</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-bold tracking-widest mb-1">NET EQUITY (NON-BANK)</div>
            <div className="text-xl font-black text-white tracking-wide">$8,122,900.50</div>
          </div>
        </div>
        <div className="ml-auto text-[10px] font-bold text-mechanical-red tracking-widest">
          CRITICAL: NO EXTERNAL RAILS DETECTED
        </div>
      </footer>

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
