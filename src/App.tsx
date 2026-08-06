import React, { useState, useEffect } from 'react';
import { VegetablePrice, Language } from './types';
import { Header } from './components/Header';
import { PriceOverviewCards } from './components/PriceOverviewCards';
import { LivePriceTable } from './components/LivePriceTable';
import { VegetableHistoryModal } from './components/VegetableHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { SMSAlertsManager } from './components/SMSAlertsManager';
import { AIMarketSummary } from './components/AIMarketSummary';
import { PriceCalculator } from './components/PriceCalculator';
import { INITIAL_VEGETABLES } from './data/vegetablesData';
import { ExternalLink, RefreshCw, AlertCircle, Sparkles, Landmark } from 'lucide-react';

export default function App() {
  const [vegetables, setVegetables] = useState<VegetablePrice[]>(INITIAL_VEGETABLES);
  const [lastUpdated, setLastUpdated] = useState<string>('Today, 06:00 AM');
  const [language, setLanguage] = useState<Language>('si'); // Default to Sinhala
  const [activeTab, setActiveTab] = useState<'prices' | 'history' | 'sms' | 'ai' | 'calculator'>('prices');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Settings Modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // History Modal state
  const [historyVegId, setHistoryVegId] = useState<string | null>(null);

  // SMS Modal or Pre-selection state
  const [smsVegPreselect, setSmsVegPreselect] = useState<VegetablePrice | null>(null);

  // Fetch live prices from server
  const fetchLivePrices = (manualRefresh: boolean = false) => {
    setIsRefreshing(true);
    fetch(`/api/prices/today${manualRefresh ? '?refresh=true' : ''}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.vegetables) && data.vegetables.length > 0) {
          setVegetables(data.vegetables);
          if (data.lastUpdated) {
            setLastUpdated(
              new Date(data.lastUpdated).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            );
          }
        } else {
          setVegetables(INITIAL_VEGETABLES);
        }
      })
      .catch((err) => {
        console.warn('Error fetching daily prices from API, using built-in market data fallback:', err);
        setVegetables(INITIAL_VEGETABLES);
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    fetchLivePrices();
  }, []);

  // Handlers
  const handleOpenHistory = (vegId: string) => {
    setHistoryVegId(vegId);
  };

  const handleOpenSmsForVeg = (veg: VegetablePrice) => {
    setSmsVegPreselect(veg);
    setActiveTab('sms');
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 font-sans flex flex-col">
      
      {/* Navigation Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchLivePrices(true)}
        activeSmsCount={2}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Dashboard Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Price Metrics Bar (Visible on 'prices' and 'history' tabs) */}
        {(activeTab === 'prices' || activeTab === 'history') && (
          <PriceOverviewCards
            vegetables={vegetables}
            language={language}
            onSelectVegetableForHistory={handleOpenHistory}
            onOpenSmsForVeg={handleOpenSmsForVeg}
          />
        )}

        {/* Tab 1: Live Daily Prices */}
        {activeTab === 'prices' && (
          <LivePriceTable
            vegetables={vegetables}
            language={language}
            onOpenHistory={handleOpenHistory}
            onOpenSmsAlert={handleOpenSmsForVeg}
          />
        )}

        {/* Tab 2: History & Trends Report */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  {language === 'si' ? 'එළවළු දෛනික මිල ඉතිහාස වාර්තා' : 'Daily Vegetable Price History Reports'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'si'
                    ? 'දඹුල්ල ආර්ථික මධ්‍යස්ථානයේ ඕනෑම එළවළුවක දින 30ක මිල ප්‍රවණතා විශ්ලේෂණය කිරීමට පහතින් එළවළුවක් තෝරන්න.'
                    : 'Select any vegetable below to inspect detailed 7, 30, or 90-day price movement charts.'}
                </p>
              </div>

              <button
                onClick={() => setHistoryVegId(vegetables[0]?.id || 'carrot')}
                className="px-4 py-2 rounded-xl bg-emerald-900 text-white font-bold text-xs hover:bg-emerald-800 transition-all shadow-xs"
              >
                {language === 'si' ? 'විශේෂිත වාර්තාව බලන්න' : 'Open Detailed Report'}
              </button>
            </div>

            <LivePriceTable
              vegetables={vegetables}
              language={language}
              onOpenHistory={handleOpenHistory}
              onOpenSmsAlert={handleOpenSmsForVeg}
            />
          </div>
        )}

        {/* Tab 3: SMS Price Drop Alerts */}
        {activeTab === 'sms' && (
          <SMSAlertsManager
            vegetables={vegetables}
            language={language}
            preselectedVeg={smsVegPreselect}
          />
        )}

        {/* Tab 4: Gemini AI Market Insights */}
        {activeTab === 'ai' && (
          <AIMarketSummary language={language} />
        )}

        {/* Tab 5: Profit & Investment Calculator */}
        {activeTab === 'calculator' && (
          <PriceCalculator vegetables={vegetables} language={language} />
        )}

      </main>

      {/* FitSMS Gateway Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
      />

      {/* History Report Modal */}
      {historyVegId && (
        <VegetableHistoryModal
          vegetables={vegetables}
          selectedVegId={historyVegId}
          onSelectVegId={setHistoryVegId}
          onClose={() => setHistoryVegId(null)}
          language={language}
        />
      )}

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-200/80 text-xs py-8 border-t border-emerald-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Landmark className="w-5 h-5 text-amber-400" />
            <div>
              <p className="font-bold text-white">
                {language === 'si' ? 'දඹුල්ල විශේෂිත ආර්ථික මධ්‍යස්ථානය' : 'Dambulla Dedicated Economic Centre'}
              </p>
              <p className="text-[11px] text-emerald-300/80">
                Data reference from <a href="https://dambulladec.com/home-dailyprice" target="_blank" rel="noreferrer" className="underline hover:text-amber-300">dambulladec.com/home-dailyprice</a>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-emerald-300">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Auto-Sync Active
            </span>
            <span>•</span>
            <span>SMS API Gateways: FitSMS, Dialog, Mobitel, NotifyLK</span>
            <span>•</span>
            <span>Powered by Gemini 2.5 AI</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

