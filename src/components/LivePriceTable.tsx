import React, { useState } from 'react';
import { VegetablePrice, VegetableCategory, Language } from '../types';
import { Search, ArrowDownRight, ArrowUpRight, Bell, LineChart, Grid, List, ShieldAlert, Sparkles, Filter } from 'lucide-react';

interface LivePriceTableProps {
  vegetables: VegetablePrice[];
  language: Language;
  onOpenHistory: (vegId: string) => void;
  onOpenSmsAlert: (veg: VegetablePrice) => void;
}

export const LivePriceTable: React.FC<LivePriceTableProps> = ({
  vegetables,
  language,
  onOpenHistory,
  onOpenSmsAlert,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VegetableCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [priceType, setPriceType] = useState<'wholesale' | 'retail'>('wholesale');
  const [sortBy, setSortBy] = useState<'name' | 'price_low' | 'price_high' | 'biggest_drop' | 'biggest_rise'>('biggest_drop');

  // Filter logic
  const filtered = vegetables.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      item.nameEn.toLowerCase().includes(term) ||
      item.nameSi.includes(term) ||
      item.id.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') {
      return language === 'si' ? a.nameSi.localeCompare(b.nameSi) : a.nameEn.localeCompare(b.nameEn);
    }
    if (sortBy === 'price_low') {
      return (priceType === 'wholesale' ? a.wholesaleAvg : a.retailEst) - (priceType === 'wholesale' ? b.wholesaleAvg : b.retailEst);
    }
    if (sortBy === 'price_high') {
      return (priceType === 'wholesale' ? b.wholesaleAvg : b.retailEst) - (priceType === 'wholesale' ? a.wholesaleAvg : a.retailEst);
    }
    if (sortBy === 'biggest_drop') {
      return a.changePercent - b.changePercent;
    }
    if (sortBy === 'biggest_rise') {
      return b.changePercent - a.changePercent;
    }
    return 0;
  });

  const categories = [
    { id: 'all', nameEn: 'All Items', nameSi: 'සියලුම එළවළු සහ අල වර්ග' },
    { id: 'upcountry', nameEn: 'Upcountry Vegetables', nameSi: 'උඩරට එළවළු' },
    { id: 'lowcountry', nameEn: 'Lowcountry Vegetables', nameSi: 'පහතරට එළවළු' },
    { id: 'tubers_yams', nameEn: 'Tubers & Yams (Ala Warga)', nameSi: 'අල වර්ග (Tubers)' },
    { id: 'imported', nameEn: 'Imported Stocks', nameSi: 'ආනයනික තොග' },
    { id: 'spices_other', nameEn: 'Spices & Essential', nameSi: 'කුළුබඩු සහ වෙනත්' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      
      {/* Controls Header */}
      <div className="p-4 sm:p-6 bg-slate-50/70 border-b border-slate-200/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                language === 'si'
                  ? 'එළවළු නම සොයන්න (උදා: කැරට්, บෝංචි, Carrot)...'
                  : 'Search vegetable by name (e.g., Carrot, Beans, තක්කාලි)...'
              }
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Toggle Switches: Wholesale vs Retail & Grid vs Table */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Wholesale / Retail Toggle */}
            <div className="inline-flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold text-slate-700">
              <button
                onClick={() => setPriceType('wholesale')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  priceType === 'wholesale'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {language === 'si' ? 'තොග මිල (Wholesale)' : 'Wholesale Rates'}
              </button>
              <button
                onClick={() => setPriceType('retail')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  priceType === 'retail'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {language === 'si' ? 'සිල්ලර මිල (Retail Est)' : 'Retail Estimate'}
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden"
              >
                <option value="biggest_drop">
                  {language === 'si' ? 'වැඩිම මිල පහළ බැසීම' : 'Biggest Price Drop'}
                </option>
                <option value="biggest_rise">
                  {language === 'si' ? 'වැඩිම මිල ඉහළ යාම' : 'Biggest Price Rise'}
                </option>
                <option value="price_low">
                  {language === 'si' ? 'මිල: අඩුම සිට වැඩිම' : 'Price: Low to High'}
                </option>
                <option value="price_high">
                  {language === 'si' ? 'මිල: වැඩිම සිට අඩුම' : 'Price: High to Low'}
                </option>
                <option value="name">
                  {language === 'si' ? 'නම අනුව (A-Z)' : 'Name (Alphabetical)'}
                </option>
              </select>
            </div>

            {/* View Mode Buttons */}
            <div className="hidden sm:inline-flex bg-slate-200/80 p-1 rounded-xl text-slate-600">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto mt-4 pt-3 border-t border-slate-200/70 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {language === 'si' ? cat.nameSi : cat.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Prices Display */}
      {sorted.length === 0 ? (
        <div className="p-12 text-center">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">
            {language === 'si' ? 'එළවළු හමු නොවීය' : 'No vegetables match your filter'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'si' ? 'කරුණාකර සෙවුම් පදය හෝ කාණ්ඩය වෙනස් කරන්න.' : 'Please clear your search query or change category filter.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 sm:px-6">{language === 'si' ? 'එළවළු නම' : 'Vegetable Name'}</th>
                <th className="py-3 px-4">{language === 'si' ? 'කාණ්ඩය' : 'Category'}</th>
                <th className="py-3 px-4 text-right">
                  {priceType === 'wholesale'
                    ? (language === 'si' ? 'තොග මිල (Min - Max)' : 'Wholesale (Min - Max)')
                    : (language === 'si' ? 'තොග සාමාන්‍යය' : 'Wholesale Avg')}
                </th>
                <th className="py-3 px-4 text-right">
                  {priceType === 'wholesale'
                    ? (language === 'si' ? 'තොග සාමාන්‍යය (LKR)' : 'Wholesale Avg (LKR)')
                    : (language === 'si' ? 'සිල්ලර අනුමානය (LKR)' : 'Est. Retail (LKR)')}
                </th>
                <th className="py-3 px-4 text-right">{language === 'si' ? 'දෛනික වෙනස' : '24h Change'}</th>
                <th className="py-3 px-4 text-center">{language === 'si' ? 'ක්‍රියාමාර්ග' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-xs sm:text-sm font-medium text-slate-800">
              {sorted.map((item) => {
                const isDrop = item.changePercent < 0;
                const isRise = item.changePercent > 0;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-emerald-50/40 transition-colors group"
                  >
                    {/* Vegetable Name */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-emerald-900 transition-colors flex items-center gap-2">
                          <span>{language === 'si' ? item.nameSi : item.nameEn}</span>
                          <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
                            ({language === 'si' ? item.nameEn : item.nameSi})
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block sm:hidden">
                          {language === 'si' ? item.nameEn : item.nameSi}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/70">
                        {item.category === 'upcountry' && (language === 'si' ? 'උඩරට' : 'Upcountry')}
                        {item.category === 'lowcountry' && (language === 'si' ? 'පහතරට' : 'Lowcountry')}
                        {item.category === 'tubers_yams' && (language === 'si' ? 'අල වර්ග' : 'Tubers')}
                        {item.category === 'imported' && (language === 'si' ? 'ආනයනික' : 'Imported')}
                        {item.category === 'spices_other' && (language === 'si' ? 'කුළුබඩු' : 'Spices')}
                      </span>
                    </td>

                    {/* Wholesale Range */}
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-500">
                      Rs. {item.wholesaleMin} - {item.wholesaleMax}
                    </td>

                    {/* Display Price */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-base font-extrabold font-mono text-slate-900">
                        Rs. {priceType === 'wholesale' ? item.wholesaleAvg : item.retailEst}
                      </span>
                      <span className="text-[11px] text-slate-400 font-sans"> /{item.unit}</span>
                    </td>

                    {/* % Change Pill */}
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-black font-mono ${
                          isDrop
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isRise
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isDrop && <ArrowDownRight className="w-3.5 h-3.5 text-emerald-700" />}
                        {isRise && <ArrowUpRight className="w-3.5 h-3.5 text-rose-700" />}
                        {item.changePercent > 0 ? `+${item.changePercent}%` : `${item.changePercent}%`}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* History Button */}
                        <button
                          onClick={() => onOpenHistory(item.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-all"
                          title={language === 'si' ? 'මිල ඉතිහාස වාර්තාව බලන්න' : 'View Price History Report'}
                        >
                          <LineChart className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="hidden md:inline">{language === 'si' ? 'ඉතිහාසය' : 'History'}</span>
                        </button>

                        {/* Set SMS Alert Button */}
                        <button
                          onClick={() => onOpenSmsAlert(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all"
                          title={language === 'si' ? 'මිල පහත වැටීම් SMS Alert තබන්න' : 'Set Price Drop SMS Alert'}
                        >
                          <Bell className="w-3.5 h-3.5 text-amber-700" />
                          <span className="hidden md:inline">{language === 'si' ? 'SMS Alert' : 'SMS Alert'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((item) => {
            const isDrop = item.changePercent < 0;
            const isRise = item.changePercent > 0;

            return (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-900 transition-colors">
                        {language === 'si' ? item.nameSi : item.nameEn}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {language === 'si' ? item.nameEn : item.nameSi}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-black font-mono shrink-0 ${
                        isDrop
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isRise
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isDrop && <ArrowDownRight className="w-3.5 h-3.5 text-emerald-700" />}
                      {isRise && <ArrowUpRight className="w-3.5 h-3.5 text-rose-700" />}
                      {item.changePercent > 0 ? `+${item.changePercent}%` : `${item.changePercent}%`}
                    </span>
                  </div>

                  {/* Price Box */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        {priceType === 'wholesale' ? (language === 'si' ? 'තොග සාමාන්‍යය' : 'Wholesale Avg') : (language === 'si' ? 'සිල්ලර අනුමානය' : 'Est. Retail')}
                      </span>
                      <div className="text-xl font-extrabold font-mono text-slate-900 mt-0.5">
                        Rs. {priceType === 'wholesale' ? item.wholesaleAvg : item.retailEst}
                        <span className="text-xs text-slate-500 font-sans font-normal"> /{item.unit}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block">
                        {language === 'si' ? 'පරාසය' : 'Range'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-600">
                        Rs. {item.wholesaleMin} - {item.wholesaleMax}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenHistory(item.id)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <LineChart className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'si' ? 'මිල ඉතිහාසය' : 'History'}</span>
                  </button>

                  <button
                    onClick={() => onOpenSmsAlert(item)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-700" />
                    <span>{language === 'si' ? 'SMS Alert' : 'SMS Alert'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
