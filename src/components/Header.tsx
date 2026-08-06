import React from 'react';
import { Language } from '../types';
import { RefreshCw, Bell, LineChart, TrendingDown, Sparkles, Calculator, Landmark, Globe, Settings, FileDown } from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: 'prices' | 'history' | 'sms' | 'ai' | 'calculator';
  onTabChange: (tab: 'prices' | 'history' | 'sms' | 'ai' | 'calculator') => void;
  lastUpdated: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  activeSmsCount: number;
  onOpenSettings?: () => void;
  onExportPdf?: () => void;
  isExportingPdf?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  activeTab,
  onTabChange,
  lastUpdated,
  isRefreshing,
  onRefresh,
  activeSmsCount,
  onOpenSettings,
  onExportPdf,
  isExportingPdf = false,
}) => {
  return (
    <header className="bg-emerald-900 text-white border-b border-emerald-800 shadow-md sticky top-0 z-40">
      {/* Top Banner with DEC Official Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo and Site Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-emerald-950 font-bold shadow-inner">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {language === 'si' ? 'දඹුල්ල විශේෂිත ආර්ථික මධ්‍යස්ථානය' : 'Dambulla Dedicated Economic Centre'}
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-200 border border-emerald-700">
                  dambulladec.com
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 flex items-center gap-2 mt-0.5">
                <span>{language === 'si' ? 'එළවළු දෛනික තොග සහ සිල්ලර මිල පුවරුව' : 'Daily Wholesale & Retail Vegetable Prices'}</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-300 font-mono text-[11px]">{lastUpdated}</span>
              </p>
            </div>
          </div>

          {/* Mobile Refresh, Export PDF & Settings Buttons */}
          <div className="flex items-center gap-2 md:hidden">
            {onExportPdf && (
              <button
                id="header-mobile-export-pdf"
                onClick={onExportPdf}
                disabled={isExportingPdf}
                className="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-amber-300 transition-colors"
                title={language === 'si' ? 'PDF වාර්තාව බාගන්න' : 'Export PDF Report'}
              >
                <FileDown className={`w-5 h-5 ${isExportingPdf ? 'animate-bounce text-amber-400' : ''}`} />
              </button>
            )}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-amber-300 transition-colors"
                title={language === 'si' ? 'SMS Gateway සැකසුම්' : 'SMS Gateway Settings'}
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 transition-colors"
              title={language === 'si' ? 'මිල ගණන් යාවත්කාලීන කරන්න' : 'Refresh Live Prices'}
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right side controls: Export PDF, Settings, Refresh, Language Switch */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          
          {/* PDF Export Button */}
          {onExportPdf && (
            <button
              id="header-desktop-export-pdf"
              onClick={onExportPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-800/90 hover:bg-emerald-700 border border-emerald-600/60 text-emerald-100 hover:text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
              title={language === 'si' ? 'වත්මන් දර්ශනයේ PDF වාර්තාව බාගන්න' : 'Export PDF of Current View'}
            >
              <FileDown className={`w-4 h-4 text-amber-300 ${isExportingPdf ? 'animate-bounce' : ''}`} />
              <span>{isExportingPdf ? (language === 'si' ? 'PDF සකසමින්...' : 'Exporting...') : (language === 'si' ? 'PDF ලබාගන්න' : 'Export PDF')}</span>
            </button>
          )}
          
          {/* SMS Gateway Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500/90 hover:bg-amber-400 text-emerald-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
              title={language === 'si' ? 'SMS Gateway සැකසුම්' : 'SMS Gateway Settings'}
            >
              <Settings className="w-4 h-4 text-emerald-950 animate-spin-slow" />
              <span>{language === 'si' ? 'SMS සැකසුම්' : 'SMS Settings'}</span>
            </button>
          )}

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-700/60 text-xs font-medium text-emerald-100 transition-all hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
            <span>{isRefreshing ? (language === 'si' ? 'යාවත්කාලීන වෙමින්...' : 'Syncing...') : (language === 'si' ? 'නැවුම් කරන්න' : 'Auto-Update')}</span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center bg-emerald-950/60 p-1 rounded-lg border border-emerald-800">
            <Globe className="w-3.5 h-3.5 text-emerald-300 ml-1.5 mr-1" />
            <button
              onClick={() => onLanguageChange('si')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                language === 'si'
                  ? 'bg-amber-500 text-emerald-950 shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              සිංහල
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                language === 'en'
                  ? 'bg-amber-500 text-emerald-950 shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-emerald-950/70 border-t border-emerald-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none items-center justify-between">
            
            <div className="flex space-x-1 sm:space-x-2">
              <button
                onClick={() => onTabChange('prices')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'prices'
                    ? 'bg-amber-500 text-emerald-950 shadow-md font-bold'
                    : 'text-emerald-200 hover:bg-emerald-900/80 hover:text-white'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>{language === 'si' ? 'දෛනික මිල ගණන්' : 'Daily Live Prices'}</span>
              </button>

              <button
                onClick={() => onTabChange('history')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'history'
                    ? 'bg-amber-500 text-emerald-950 shadow-md font-bold'
                    : 'text-emerald-200 hover:bg-emerald-900/80 hover:text-white'
                }`}
              >
                <LineChart className="w-4 h-4" />
                <span>{language === 'si' ? 'මිල ඉතිහාසය සහ වාර්තා' : 'Price History Reports'}</span>
              </button>

              <button
                onClick={() => onTabChange('sms')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all relative ${
                  activeTab === 'sms'
                    ? 'bg-amber-500 text-emerald-950 shadow-md font-bold'
                    : 'text-emerald-200 hover:bg-emerald-900/80 hover:text-white'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>{language === 'si' ? 'SMS මිල පහත වැටීම් දැනුම්දීම්' : 'SMS Price Drop Alerts'}</span>
                {activeSmsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-emerald-950">
                    {activeSmsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onTabChange('ai')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'ai'
                    ? 'bg-amber-500 text-emerald-950 shadow-md font-bold'
                    : 'text-emerald-200 hover:bg-emerald-900/80 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>{language === 'si' ? 'AI වෙළඳපොළ විග්‍රහය' : 'AI Market Insight'}</span>
              </button>

              <button
                onClick={() => onTabChange('calculator')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'calculator'
                    ? 'bg-amber-500 text-emerald-950 shadow-md font-bold'
                    : 'text-emerald-200 hover:bg-emerald-900/80 hover:text-white'
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>{language === 'si' ? 'තොග ලාභ ගණකය' : 'Wholesale Calculator'}</span>
              </button>
            </div>

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 hover:bg-emerald-900/80 border border-emerald-800 transition-all ml-2 whitespace-nowrap"
              >
                <Settings className="w-4 h-4" />
                <span>{language === 'si' ? '⚙️ SMS Gateway සැකසුම්' : '⚙️ SMS Gateway Config'}</span>
              </button>
            )}

          </nav>
        </div>
      </div>
    </header>
  );
};

