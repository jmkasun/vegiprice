import React from 'react';
import { VegetablePrice, Language } from '../types';
import { TrendingDown, TrendingUp, ShoppingBag, Zap, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface PriceOverviewCardsProps {
  vegetables: VegetablePrice[];
  language: Language;
  onSelectVegetableForHistory: (vegId: string) => void;
  onOpenSmsForVeg: (veg: VegetablePrice) => void;
}

export const PriceOverviewCards: React.FC<PriceOverviewCardsProps> = ({
  vegetables,
  language,
  onSelectVegetableForHistory,
  onOpenSmsForVeg,
}) => {
  if (!vegetables || vegetables.length === 0) return null;

  // Find top price drop and rise
  const sorted = [...vegetables].sort((a, b) => a.changePercent - b.changePercent);
  const topDrop = sorted[0];
  const topRise = sorted[sorted.length - 1];

  // Average change
  const avgChange = (vegetables.reduce((acc, v) => acc + v.changePercent, 0) / vegetables.length).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Monitored Items */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {language === 'si' ? 'නිරීක්ෂිත එළවළු ප්‍රමාණය' : 'Monitored Vegetables'}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{vegetables.length}</span>
            <span className="text-xs text-emerald-700 font-medium">
              {language === 'si' ? 'වර්ග (Dambulla DEC)' : 'Varieties'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {language === 'si' ? 'දෛනිකව ස්වයංක්‍රීයව යාවත්කාලීන වේ' : 'Auto-updated daily from DEC'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
          <ShoppingBag className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Top Price Drop Today */}
      {topDrop && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 p-4 rounded-xl border border-emerald-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{language === 'si' ? 'වැඩිම මිල පහළ බැසීම' : 'Top Price Drop'}</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
                {language === 'si' ? topDrop.nameSi : topDrop.nameEn}
              </p>
            </div>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs shrink-0">
              <ArrowDownRight className="w-3.5 h-3.5" />
              {Math.abs(topDrop.changePercent)}%
            </span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-emerald-200/60 text-xs">
            <div>
              <span className="text-slate-500">{language === 'si' ? 'තොග: ' : 'Wholesale: '}</span>
              <span className="font-extrabold text-emerald-950">Rs. {topDrop.wholesaleAvg}</span>
              <span className="text-[10px] text-slate-500"> /kg</span>
            </div>
            <button
              onClick={() => onSelectVegetableForHistory(topDrop.id)}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline"
            >
              {language === 'si' ? 'ඉතිහාසය බලන්න' : 'View History'}
            </button>
          </div>
        </div>
      )}

      {/* 3. Top Price Rise Today */}
      {topRise && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 p-4 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{language === 'si' ? 'වැඩිම මිල ඉහළ යෑම' : 'Top Price Rise'}</span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
                {language === 'si' ? topRise.nameSi : topRise.nameEn}
              </p>
            </div>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-black bg-amber-600 text-white shadow-xs shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{topRise.changePercent}%
            </span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-amber-200/60 text-xs">
            <div>
              <span className="text-slate-500">{language === 'si' ? 'තොග: ' : 'Wholesale: '}</span>
              <span className="font-extrabold text-amber-950">Rs. {topRise.wholesaleAvg}</span>
              <span className="text-[10px] text-slate-500"> /kg</span>
            </div>
            <button
              onClick={() => onOpenSmsForVeg(topRise)}
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline"
            >
              {language === 'si' ? 'SMS Alert' : 'SMS Alert'}
            </button>
          </div>
        </div>
      )}

      {/* 4. Overall Market Index */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {language === 'si' ? 'සමස්ත වෙළඳපොළ ප්‍රවණතාව' : 'Market Avg Trend'}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-extrabold ${Number(avgChange) < 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {Number(avgChange) > 0 ? `+${avgChange}%` : `${avgChange}%`}
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {Number(avgChange) < 0 
                ? (language === 'si' ? 'සමස්ත මිල පහළ' : 'Market Cooling') 
                : (language === 'si' ? 'මිල ඉහළට' : 'Market Rising')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>{language === 'si' ? 'සජීවී Dambulla DEC feed' : 'Live Dambulla DEC feed'}</span>
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
          <Zap className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
