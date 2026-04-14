import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TaxIncentive } from "../../lib/schemas";

const INCENTIVE_MENU: TaxIncentive[] = [
  { id: "SEC-179", category: "BUSINESS_INV", type: "DEDUCTION", legal_authority: "IRC §179", face_value: 1000000, mechanical_effect: "BASE_EROSION", status: "POTENTIAL" },
  { id: "SOLAR-ITC", category: "ENERGY", type: "CREDIT", legal_authority: "45L / 48C", face_value: 30000, mechanical_effect: "DEBT_ERASURE", status: "POTENTIAL" },
  { id: "PHANTOM-LOSS", category: "HOUSING", type: "DEDUCTION", legal_authority: "IRC §168(k)", face_value: 45000, mechanical_effect: "BASE_EROSION", status: "ACCRUED" },
];

export default function TaxStrategy() {
  const [selectedIncentives, setSelectedIncentives] = useState<string[]>([]);
  const [taxableIncome, setTaxableIncome] = useState(250000);

  const toggleIncentive = (id: string) => {
    setSelectedIncentives(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const activeIncentives = INCENTIVE_MENU.filter(i => selectedIncentives.includes(i.id));
  
  // Calculate Mechanical Truth
  const deductions = activeIncentives.filter(i => i.type === "DEDUCTION").reduce((acc, curr) => acc + curr.face_value, 0);
  const credits = activeIncentives.filter(i => i.type === "CREDIT").reduce((acc, curr) => acc + curr.face_value, 0);
  
  const netTaxable = Math.max(0, taxableIncome - deductions);
  const estimatedTax = netTaxable * 0.35; // Simulated 35% Bracket
  const finalLiability = Math.max(0, estimatedTax - credits);

  return (
    <div className="p-6 grid grid-cols-12 gap-6 h-full bg-basalt-bg font-mono overflow-y-auto min-h-0 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="col-span-12 border-b border-basalt-800 pb-4 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-xl font-black tracking-tighter text-white">06_STRATEGIC_TAX_ENGINE</h1>
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Authority: Statutes at Large // Method: Accrual</p>
        </div>
        <div className="text-[10px] text-authority-cyan bg-basalt-900 px-3 py-1 border border-authority-cyan/30 font-bold tracking-widest">
          CHEVRON_DEFERENCE: OVERTURNED // IRS_AUTHORITY: LIMITED
        </div>
      </div>

      {/* Incentive Shopping List */}
      <div className="col-span-12 lg:col-span-7 flex flex-col gap-4 min-h-0">
        <h2 className="text-[10px] font-bold text-zinc-400 tracking-widest shrink-0">SELECT_GOVERNMENT_SUBSIDIES</h2>
        <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-2">
          {INCENTIVE_MENU.map((item) => (
            <div 
              key={item.id}
              onClick={() => toggleIncentive(item.id)}
              className={`p-4 border transition-all cursor-pointer flex justify-between items-center ${
                selectedIncentives.includes(item.id) 
                ? "bg-authority-cyan/10 border-authority-cyan text-white" 
                : "bg-basalt-panel border-basalt-800 text-zinc-500 hover:border-zinc-700"
              }`}
            >
              <div>
                <div className="text-[10px] font-black tracking-widest">{item.id} // {item.legal_authority}</div>
                <div className="text-[8px] uppercase font-bold tracking-widest mt-1">{item.category} — {item.mechanical_effect}</div>
              </div>
              <div className="text-sm font-black tabular-nums tracking-wider">
                ${item.face_value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Accrual Method Toggle */}
        <div className="mt-auto p-4 border border-basalt-800 bg-basalt-panel shrink-0">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-authority-amber italic tracking-widest">ACCRUAL_METHOD_ADOPTED</span>
            <div className="w-8 h-4 bg-authority-amber rounded-full relative p-1">
              <div className="w-2 h-2 bg-black rounded-full absolute right-1" />
            </div>
          </div>
          <p className="text-[9px] text-zinc-500 leading-relaxed font-bold tracking-widest">
            Recognizing income/loss at the moment of fixed right. Barter transactions (1099-B) set to zero-sum gain per Eisner v. Macomber.
          </p>
        </div>
      </div>

      {/* Mechanical Calculations HUD */}
      <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 min-h-0">
        <div className="bg-basalt-panel border border-basalt-800 p-6 flex flex-col gap-6 shrink-0">
          <StatLine label="GROSS_TAXABLE_BASE" value={taxableIncome} />
          <StatLine label="DEDUCTION_EROSION" value={-deductions} color="text-mechanical-red" />
          <div className="h-[1px] bg-basalt-800 w-full" />
          <StatLine label="NET_TAXABLE_FOUNDATION" value={netTaxable} />
          <StatLine label="ESTIMATED_LIABILITY (35%)" value={estimatedTax} />
          <StatLine label="CREDIT_DEBT_ERASURE" value={-credits} color="text-authority-cyan" />
          
          <div className="mt-2 p-4 bg-white text-black text-center chamfer-br">
            <div className="text-[9px] font-black tracking-widest mb-1">FINAL_TAX_OBLIGATION</div>
            <div className="text-2xl font-black tabular-nums tracking-wider">${finalLiability.toLocaleString()}</div>
          </div>
        </div>

        {/* NOL Asset Block */}
        <div className="bg-basalt-panel border border-basalt-800 p-6 chamfer-br shrink-0 mt-auto">
          <div className="text-[10px] font-black tracking-widest mb-4 text-white flex items-center gap-2">
            <div className="w-1 h-3 bg-authority-cyan" />
            NOL_ASSET_RECOGNITION
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-black text-authority-cyan tracking-wider">$440,000</div>
              <div className="text-[8px] text-zinc-500 font-bold tracking-widest mt-1">PROPERTY_INTEREST_CARRYFORWARD</div>
            </div>
            <button className="text-[9px] font-black tracking-widest border border-basalt-800 bg-basalt-bg px-4 py-2 hover:bg-white hover:text-black transition-colors text-white">
              PERFECT_ASSET_UCC9
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatLine({ label, value, color = "text-zinc-400" }: { label: string, value: number, color?: string }) {
  return (
    <div className="flex justify-between items-center font-mono">
      <span className="text-[9px] font-bold text-zinc-500 tracking-widest">{label}</span>
      <span className={`text-sm font-black tabular-nums tracking-wider ${color}`}>
        {value < 0 ? "-" : ""}${Math.abs(value).toLocaleString()}
      </span>
    </div>
  );
}
