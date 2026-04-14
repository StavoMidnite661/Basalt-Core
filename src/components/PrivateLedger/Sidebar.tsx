import React from 'react';
import { motion } from 'motion/react';

interface NavigationBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function NavigationBar({ activeTab, setActiveTab }: NavigationBarProps) {
  const navItems = [
    { id: 'ingestion', label: 'DASHBOARD' },
    { id: 'topology', label: 'LEDGER_MAP' },
    { id: 'ucc', label: 'UCC_ENGINE' },
    { id: 'treasury', label: 'TREASURY' },
    { id: 'tax_engine', label: 'TAX_ENGINE' },
    { id: 'vendor', label: 'VENDOR_PORTAL' },
    { id: 'transactions', label: 'LEDGER_HISTORY' },
  ];

  return (
    <div className="w-full bg-basalt-bg border-b border-basalt-800 flex items-center px-6 font-mono z-10 shrink-0 h-12">
      <nav className="flex h-full gap-8 overflow-x-auto scrollbar-hide w-full">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center h-full px-2 transition-colors whitespace-nowrap ${
                isActive ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute left-0 right-0 bottom-0 h-[2px] bg-basalt-orange"
                />
              )}
              <span className="text-[10px] font-bold tracking-[0.2em]">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
