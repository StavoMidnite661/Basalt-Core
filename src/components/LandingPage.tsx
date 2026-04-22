import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, Network, Lock, Zap, ArrowLeft, Loader2 } from 'lucide-react';

interface LandingPageProps {
  onLogin: (role: 'TREASURY' | 'VENDOR') => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [activePrompt, setActivePrompt] = useState<'TREASURY' | 'VENDOR' | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;

    setIsLoading(true);
    setError('');

    // Simulate cryptographic verification delay
    setTimeout(() => {
      const isTreasuryValid = activePrompt === 'TREASURY' && passphrase.toLowerCase() === 'admin';
      const isVendorValid = activePrompt === 'VENDOR' && passphrase.toLowerCase() === 'vendor';

      if (isTreasuryValid || isVendorValid) {
        onLogin(activePrompt!);
      } else {
        setError('INVALID_CRYPTOGRAPHIC_SIGNATURE');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="h-screen bg-basalt-950 font-mono text-zinc-200 overflow-hidden flex flex-col selection:bg-basalt-orange/30">
      {/* Top Bar Map Graphic / System Status */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-authority-cyan to-transparent opacity-50 z-50" />
      
      <header className="shrink-0 w-full px-6 py-4 flex justify-between items-center z-50 border-b border-basalt-800/30">
        <div className="text-sm font-black tracking-[0.3em] text-white flex items-center gap-4">
          <Shield className="w-5 h-5 text-authority-cyan" />
          SOVR<span className="text-basalt-orange">COR</span>
          <span className="text-[10px] text-zinc-500">// BASALT_CORE</span>
        </div>
        <div className="text-[10px] text-zinc-500 tracking-widest font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-basalt-green shadow-[0_0_8px_#a3ff00] animate-pulse" />
          SYSTEM_ONLINE
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-0 w-full">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#2a2a2a_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center z-10 w-full max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border border-basalt-800 bg-basalt-900 rounded-full text-[8px] md:text-[9px] text-authority-cyan tracking-widest font-bold mb-4 md:mb-8 uppercase">
            <Network className="w-3 h-3" />
            <span className="hidden sm:inline">Distributed Ledger Technology • TigerBeetle Engine</span>
            <span className="sm:hidden">DLT • TigerBeetle Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-[1] mb-4 md:mb-6">
            The Era of <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">
              Narrative Finance
            </span>
            <br /> <span className="text-basalt-orange">is Over.</span>
          </h1>

          <p className="hidden sm:block text-xs md:text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed tracking-widest font-bold uppercase mb-8 md:mb-10 border-l-2 border-authority-cyan pl-6 text-left">
            SOVRCOR is a high-fidelity sovereignty engine. 
            Bypass the narrative promise of commercial banking and enter the mechanical truth of a private, distributed ledger. 
            Zero external exposure. Absolute asset perfection.
          </p>
        </motion.div>

        {/* Main Interaction Area */}
        <div className="w-full max-w-4xl z-10 relative">
          <AnimatePresence mode="wait">
            {!activePrompt ? (
              <motion.div 
                key="portal-grid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full"
              >
                {/* Treasury Admin Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-authority-cyan/5 blur-xl group-hover:bg-authority-cyan/10 transition-colors duration-500" />
                  <div className="relative h-full bg-basalt-panel border-2 border-basalt-800 group-hover:border-authority-cyan/50 p-4 sm:p-6 lg:p-8 flex flex-col transition-all duration-300 chamfer-br">
                    <div className="mb-4 sm:mb-6 flex sm:block items-center gap-4">
                      <Lock className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-authority-cyan sm:mb-4 shrink-0" />
                      <div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-white tracking-tighter uppercase mb-1">Authority Login</h2>
                        <div className="text-[8px] sm:text-[9px] text-authority-cyan tracking-widest font-bold uppercase">Treasury / System Admin</div>
                      </div>
                    </div>
                    
                    <p className="hidden sm:block text-[10px] lg:text-xs text-zinc-400 leading-relaxed font-bold tracking-widest mb-6 sm:mb-8 flex-1">
                      Access the core ledger topology. Manage asset perfection, initiate seigniorage, and oversee global system health.
                    </p>

                    <button 
                      onClick={() => { setActivePrompt('TREASURY'); setError(''); setPassphrase(''); }}
                      className="w-full py-3 lg:py-4 bg-basalt-900 border border-authority-cyan text-authority-cyan font-black text-[9px] sm:text-[10px] lg:text-xs tracking-widest uppercase hover:bg-authority-cyan hover:text-black transition-all flex justify-between items-center px-4 md:px-6 mt-auto"
                    >
                      <span>Initialize Core</span>
                      <Key className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                {/* Vendor Portal Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-basalt-orange/5 blur-xl group-hover:bg-basalt-orange/10 transition-colors duration-500" />
                  <div className="relative h-full bg-basalt-panel border-2 border-basalt-800 group-hover:border-basalt-orange/50 p-4 sm:p-6 lg:p-8 flex flex-col transition-all duration-300 chamfer-br">
                    <div className="mb-4 sm:mb-6 flex sm:block items-center gap-4">
                      <Zap className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-basalt-orange sm:mb-4 shrink-0" />
                      <div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-white tracking-tighter uppercase mb-1">Vendor Access</h2>
                        <div className="text-[8px] sm:text-[9px] text-basalt-orange tracking-widest font-bold uppercase">Supply Chain Operations</div>
                      </div>
                    </div>
                    
                    <p className="hidden sm:block text-[10px] lg:text-xs text-zinc-400 leading-relaxed font-bold tracking-widest mb-6 sm:mb-8 flex-1">
                      Onboard entities, pledge performance instruments, and verify digital receipts against the master ledger.
                    </p>

                    <button 
                      onClick={() => { setActivePrompt('VENDOR'); setError(''); setPassphrase(''); }}
                      className="w-full py-3 lg:py-4 bg-basalt-900 border border-basalt-orange text-basalt-orange font-black text-[9px] sm:text-[10px] lg:text-xs tracking-widest uppercase hover:bg-basalt-orange hover:text-black transition-all flex justify-between items-center px-4 md:px-6 mt-auto"
                    >
                      <span>Initialize Gateway</span>
                      <Key className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="auth-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="max-w-md mx-auto w-full relative"
              >
                <div className={`absolute inset-0 blur-2xl transition-colors duration-500 ${activePrompt === 'TREASURY' ? 'bg-authority-cyan/10' : 'bg-basalt-orange/10'}`} />
                <div className={`relative bg-basalt-panel border-2 p-8 chamfer-br ${activePrompt === 'TREASURY' ? 'border-authority-cyan/50' : 'border-basalt-orange/50'}`}>
                  
                  <button 
                    onClick={() => { !isLoading && setActivePrompt(null); }}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-zinc-500 hover:text-white uppercase mb-8 transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft className="w-3 h-3" /> Terminate Handshake
                  </button>

                  <div className="mb-8">
                    {activePrompt === 'TREASURY' ? (
                      <Lock className="w-8 h-8 text-authority-cyan mb-4" />
                    ) : (
                      <Zap className="w-8 h-8 text-basalt-orange mb-4" />
                    )}
                    <h2 className="text-xl font-black text-white tracking-tighter uppercase mb-2">
                      {activePrompt === 'TREASURY' ? 'Authority Node' : 'Vendor Gateway'}
                    </h2>
                    <div className={`text-[9px] tracking-widest font-bold uppercase ${activePrompt === 'TREASURY' ? 'text-authority-cyan' : 'text-basalt-orange'}`}>
                      Awaiting Cryptographic Signature
                    </div>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-2">
                        Passphrase Key
                      </label>
                      <input 
                        type="password"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        disabled={isLoading}
                        autoFocus
                        className={`w-full bg-basalt-900 border p-4 text-white font-mono text-sm focus:outline-none transition-colors disabled:opacity-50 ${
                          error ? 'border-mechanical-red focus:border-mechanical-red' : 
                          activePrompt === 'TREASURY' ? 'border-basalt-800 focus:border-authority-cyan' : 'border-basalt-800 focus:border-basalt-orange'
                        }`}
                        placeholder="••••••••••••••••"
                      />
                      {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-mechanical-red text-[10px] font-bold tracking-widest mt-2 uppercase">
                          {error}
                        </motion.div>
                      )}
                      <div className="text-[8px] text-zinc-600 tracking-widest mt-2 uppercase">
                        DEMO HINT: Use '{activePrompt === 'TREASURY' ? 'admin' : 'vendor'}'
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isLoading || !passphrase.trim()}
                      className={`w-full py-4 font-black text-[10px] lg:text-xs tracking-widest uppercase transition-all flex justify-center items-center gap-3 border ${
                        activePrompt === 'TREASURY' 
                          ? 'bg-basalt-900 border-authority-cyan text-authority-cyan hover:bg-authority-cyan hover:text-black disabled:hover:bg-basalt-900 disabled:hover:text-authority-cyan' 
                          : 'bg-basalt-900 border-basalt-orange text-basalt-orange hover:bg-basalt-orange hover:text-black disabled:hover:bg-basalt-900 disabled:hover:text-basalt-orange'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying Signature...</span>
                        </>
                      ) : (
                        <span>Verify & Execute</span>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Banner */}
      <footer className="shrink-0 border-t border-basalt-800 bg-basalt-900 py-4 px-6 text-center z-10 relative">
        <p className="text-[8px] text-zinc-500 tracking-[0.4em] font-bold uppercase">
          Compliant with NISTIR 8202 DLT Standards • UCC-9 Asset Perfection Protocol Active
        </p>
      </footer>
    </div>
  );
}
