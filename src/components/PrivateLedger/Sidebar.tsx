import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, FileCode, Route, Activity, CheckCircle2, ShieldCheck, Landmark, Wallet, Network, Calculator } from 'lucide-react';

interface NavigationBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function NavigationBar({ activeTab, setActiveTab }: NavigationBarProps) {
  // Grouped into the real-world lifecycle of the capital
  const workflowStages = [
    {
      group: 'I. ORIGINATION',
      items: [
        { id: 'vendor', label: 'VENDOR PORTAL', icon: FileCode },
        { id: 'ingestion', label: 'ISO INGESTION', icon: Activity },
      ]
    },
    {
      group: 'II. PERFORMANCE',
      items: [
        { id: 'performance', label: 'PERF ORACLE', icon: CheckCircle2 },
      ]
    },
    {
      group: 'III. SECURITIZATION',
      items: [
        { id: 'ucc', label: 'UCC-9 ENGINE', icon: ShieldCheck },
      ]
    },
    {
      group: 'IV. SEIGNIORAGE',
      items: [
        { id: 'treasury', label: 'TREASURY QUORUM', icon: Landmark },
      ]
    },
    {
      group: 'V. SETTLEMENT',
      items: [
        { id: 'transactions', label: 'SETTLEMENT LOG', icon: Wallet },
        { id: 'fiat_bridge', label: 'FIAT RAIL EXIT', icon: Route },
      ]
    },
    {
      group: 'VI. OVERSIGHT',
      items: [
        { id: 'topology', label: 'NODE TOPOLOGY', icon: Network },
        { id: 'tax_engine', label: 'TAX STRATEGY', icon: Calculator },
      ]
    }
  ];

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll active tab into view when selected
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  return (
    <div className="w-full bg-basalt-bg border-b border-basalt-800 font-mono z-10 shrink-0 select-none shadow-sm shadow-black/50">
      <nav 
        ref={scrollContainerRef}
        className="flex items-center px-4 md:px-6 py-2 md:py-4 gap-4 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
      >
        {workflowStages.map((stage, stageIdx) => (
          <React.Fragment key={stage.group}>
            <div className="flex flex-col flex-shrink-0">
              <span className="text-[8px] md:text-[10px] text-basalt-orange font-black tracking-widest uppercase mb-1 md:mb-2 opacity-90 pl-0.5">
                {stage.group}
              </span>
              <div className="flex items-center gap-1.5 md:gap-2">
                {stage.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      data-active={isActive}
                      onClick={() => setActiveTab(item.id)}
                      className={`relative flex items-center justify-center gap-1.5 md:gap-2.5 h-8 md:h-10 px-3 md:px-4 transition-all border outline-none whitespace-nowrap cursor-pointer ${
                        isActive 
                          ? 'text-white border-authority-cyan bg-authority-cyan/10 shadow-[0_0_15px_rgba(0,242,255,0.15)] ring-1 ring-authority-cyan/20' 
                          : 'text-zinc-400 border-basalt-800 bg-basalt-900/50 hover:text-white hover:border-zinc-500 hover:bg-basalt-800'
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-3 h-3 md:w-4 md:h-4 ${isActive ? 'text-authority-cyan' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                      <span className="text-[8px] md:text-[10px] lg:text-[11px] font-bold tracking-widest uppercase">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            {stageIdx < workflowStages.length - 1 && (
              <div className="flex flex-col justify-end pb-2.5 flex-shrink-0">
                <ChevronRight className="w-4 h-4 text-zinc-700 opacity-50" />
              </div>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
}
