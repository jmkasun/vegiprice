import React, { useState } from 'react';
import { VegetablePrice, Language } from '../types';
import { Calculator, ShoppingBag, Truck, Coins, ArrowRight } from 'lucide-react';

interface PriceCalculatorProps {
  vegetables: VegetablePrice[];
  language: Language;
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({ vegetables, language }) => {
  const [selectedVegId, setSelectedVegId] = useState<string>(vegetables[0]?.id || 'carrot');
  const [quantityKg, setQuantityKg] = useState<number>(200);
  const [transportCost, setTransportCost] = useState<number>(5000);
  const [targetMarginPct, setTargetMarginPct] = useState<number>(25);

  const currentVeg = vegetables.find((v) => v.id === selectedVegId) || vegetables[0];

  const totalWholesaleCost = currentVeg ? currentVeg.wholesaleAvg * quantityKg : 0;
  const totalInvestment = totalWholesaleCost + transportCost;
  const costPerKgEffective = quantityKg > 0 ? totalInvestment / quantityKg : 0;
  
  const suggestedRetailPrice = costPerKgEffective * (1 + targetMarginPct / 100);
  const projectedRevenue = suggestedRetailPrice * quantityKg;
  const projectedProfit = projectedRevenue - totalInvestment;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
      
      {/* Title Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="w-11 h-11 rounded-xl bg-emerald-900 text-amber-400 flex items-center justify-center font-bold shadow-md shrink-0">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            {language === 'si'
              ? 'දඹුල්ල තොග මිලදී ගැනීම් සහ ලාභ ගණකය'
              : 'Dambulla Wholesale Bulk Purchase & Profit Calculator'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'si'
              ? 'තොග මිලදී ගැනීම්, ප්‍රවාහන ගාස්තු සහ ඉලක්ක ලාභ ප්‍රතිශත අනුව සිල්ලර මිල ගණනය කරන්න'
              : 'Estimate total investment, effective per-kg cost, and projected gross profit margin'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Parameters */}
        <div className="space-y-4">
          
          {/* Vegetable Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'si' ? 'එළවළු හෝ අල වර්ගය තෝරන්න' : 'Select Vegetable or Tuber Item'}
            </label>
            <select
              value={selectedVegId}
              onChange={(e) => setSelectedVegId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/30"
            >
              {vegetables.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nameSi} ({v.nameEn}) - Dambulla Avg: Rs.{v.wholesaleAvg}/kg
                </option>
              ))}
            </select>
          </div>

          {/* Quantity in KG / Bags */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">
                {language === 'si' ? 'මිලදී ගන්නා ප්‍රමාණය (කිලෝ ග්‍රෑම් වලින්)' : 'Quantity in Kilograms (kg)'}
              </label>
              <span className="text-[11px] font-mono font-bold text-emerald-800">
                ≈ {(quantityKg / 50).toFixed(1)} {language === 'si' ? 'මළු (50kg bags)' : 'Bags (50kg)'}
              </span>
            </div>
            <input
              type="number"
              min="10"
              step="10"
              value={quantityKg}
              onChange={(e) => setQuantityKg(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Transportation Cost */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'si' ? 'ප්‍රවාහන සහ හැසුරුම් ගාස්තු (LKR)' : 'Transport & Logistics Cost (LKR)'}
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={transportCost}
              onChange={(e) => setTransportCost(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Profit Margin % */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">
                {language === 'si' ? 'ඉලක්ක ලාභ ප්‍රතිශතය (Target Margin %)' : 'Target Profit Margin (%)'}
              </label>
              <span className="text-xs font-mono font-bold text-emerald-800">{targetMarginPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="1"
              value={targetMarginPct}
              onChange={(e) => setTargetMarginPct(Number(e.target.value))}
              className="w-full accent-emerald-800 cursor-pointer"
            />
          </div>

        </div>

        {/* Breakdown Output Panel */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-5 shadow-lg flex flex-col justify-between">
          
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block mb-2">
              {language === 'si' ? 'ගණනය කළ තොග සහ ලාභ සාරාංශය' : 'Calculated Bulk Financial Summary'}
            </span>

            <div className="space-y-3 font-mono text-xs border-b border-slate-800 pb-4">
              <div className="flex justify-between items-center text-slate-300">
                <span>{language === 'si' ? 'දඹුල්ල තොග මිල (Dambulla Avg):' : 'Dambulla Wholesale Rate:'}</span>
                <span className="font-bold text-white">Rs. {currentVeg?.wholesaleAvg}/kg</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>{language === 'si' ? 'එකතුව තොග පිරිවැය:' : 'Total Wholesale Stock Cost:'}</span>
                <span className="font-bold text-white">Rs. {totalWholesaleCost.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>{language === 'si' ? 'ප්‍රවාහන වියදම:' : 'Logistics Cost:'}</span>
                <span className="font-bold text-slate-400">+ Rs. {transportCost.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-emerald-300 font-bold text-sm pt-2 border-t border-slate-800">
                <span>{language === 'si' ? 'මුළු ආයෝජනය (Total Investment):' : 'Total Required Capital:'}</span>
                <span className="text-amber-400">Rs. {totalInvestment.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  {language === 'si' ? 'ප්‍රවාහන සහිත සැබෑ කිලෝ පිරිවැය' : 'Effective Cost / kg'}
                </span>
                <span className="text-lg font-extrabold font-mono text-white">
                  Rs. {costPerKgEffective.toFixed(1)}
                </span>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-600" />

              <div className="text-right">
                <span className="text-[10px] text-amber-300 uppercase tracking-wider block font-bold">
                  {language === 'si' ? 'නිර්දේශිත සිල්ලර මිල' : 'Suggested Retail / kg'}
                </span>
                <span className="text-xl font-extrabold font-mono text-amber-400">
                  Rs. {suggestedRetailPrice.toFixed(0)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-200">
                {language === 'si' ? 'අපේක්ෂිත ශුද්ධ ලාභය (Projected Profit):' : 'Projected Net Profit:'}
              </span>
              <span className="text-xl font-extrabold font-mono text-emerald-400">
                + Rs. {projectedProfit.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
