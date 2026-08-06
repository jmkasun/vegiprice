import React, { useState, useEffect } from 'react';
import { MarketInsight, Language } from '../types';
import { Sparkles, TrendingDown, TrendingUp, Lightbulb, RefreshCw, ShoppingCart, Landmark } from 'lucide-react';

interface AIMarketSummaryProps {
  language: Language;
}

export const AIMarketSummary: React.FC<AIMarketSummaryProps> = ({ language }) => {
  const [insight, setInsight] = useState<MarketInsight | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAiSummary = () => {
    setLoading(true);
    fetch('/api/ai/market-summary')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setInsight(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch AI market summary:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAiSummary();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-emerald-950 font-extrabold shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">
                {language === 'si'
                  ? 'දඹුල්ල වෙළඳපොළ AI බුද්ධිමය විශ්ලේෂණය'
                  : 'Dambulla DEC Daily AI Market Report'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Gemini 2.5 AI Powered
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'si'
                ? 'දඹුල්ල විශේෂිත ආර්ථික මධ්‍යස්ථානයේ දෛනික මිල සහ පැමිණීම් පිළිබඳ AI විග්‍රහය'
                : 'Daily automated agricultural insights, price drivers, and wholesale buyer tips'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchAiSummary}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>{loading ? (language === 'si' ? 'විශ්ලේෂණය වෙමින්...' : 'Analyzing...') : (language === 'si' ? 'නැවත ගණනය කරන්න' : 'Re-Analyze')}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-600">
            {language === 'si' ? 'Gemini AI මාදිලිය මගින් දඹුල්ල මිල ගණන් පරීක්ෂා කරමින් පවතී...' : 'Gemini AI is analyzing live Dambulla DEC arrivals and prices...'}
          </p>
        </div>
      ) : insight ? (
        <div className="space-y-6">
          
          {/* Main AI Commentary Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                {language === 'si' ? 'අද දින වෙළඳපොළ ප්‍රධාන සාරාංශය' : 'Today\'s Market Synthesis'}
              </span>
              <p className="text-sm sm:text-base leading-relaxed font-medium text-emerald-50">
                "{language === 'si' ? insight.summarySi : insight.summaryEn}"
              </p>
            </div>
          </div>

          {/* Key Movements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Loser / Drop */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-600 text-white font-bold shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  {language === 'si' ? 'ප්‍රධාන මිල පහත වැටීම (Top Opportunity)' : 'Major Price Drop Today'}
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{insight.topLoser}</p>
                <p className="text-[11px] text-emerald-700 mt-1">
                  {language === 'si' ? 'තොග මිලදී ගැනීම් සඳහා වඩාත් සුදුසුයි' : 'Favorable wholesale purchasing window'}
                </p>
              </div>
            </div>

            {/* Top Gainer / Rise */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-600 text-white font-bold shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  {language === 'si' ? 'ප්‍රධාන මිල ඉහළ යාම (Top Price Spike)' : 'Major Price Spike Today'}
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{insight.topGainer}</p>
                <p className="text-[11px] text-amber-700 mt-1">
                  {language === 'si' ? 'ප්‍රවාහන හෝ අස්වැන්න සීමා වීම් බලපා ඇත' : 'Harvest supply limits in effect'}
                </p>
              </div>
            </div>
          </div>

          {/* Actionable Tips for Traders & Farmers */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>
                {language === 'si'
                  ? 'තොග වෙළඳුන් සහ ගොවීන් සඳහා AI මගින් නිර්දේශිත උපදෙස්'
                  : 'Actionable Buyer & Farmer Advice from AI'}
              </span>
            </div>

            <ul className="space-y-2">
              {(language === 'si' ? insight.buyerTipsSi : insight.buyerTipsEn).map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      ) : null}

    </div>
  );
};
