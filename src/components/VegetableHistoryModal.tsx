import React, { useState, useEffect } from 'react';
import { VegetablePrice, VegetableHistoryReport, Language } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { X, Calendar, Download, Printer, TrendingDown, Sparkles, Activity, FileSpreadsheet, Layers } from 'lucide-react';

interface VegetableHistoryModalProps {
  vegetables: VegetablePrice[];
  selectedVegId: string;
  onSelectVegId: (id: string) => void;
  onClose: () => void;
  language: Language;
}

export const VegetableHistoryModal: React.FC<VegetableHistoryModalProps> = ({
  vegetables,
  selectedVegId,
  onSelectVegId,
  onClose,
  language,
}) => {
  const [days, setDays] = useState<number>(30);
  const [report, setReport] = useState<VegetableHistoryReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch history report from server API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/prices/history?item=${selectedVegId}&days=${days}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setReport(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch vegetable history report:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedVegId, days]);

  const currentVeg = vegetables.find((v) => v.id === selectedVegId) || vegetables[0];

  // CSV Export
  const handleExportCSV = () => {
    if (!report || !report.history) return;

    const headers = ['Date', 'Vegetable', 'Wholesale Min (LKR)', 'Wholesale Max (LKR)', 'Wholesale Avg (LKR)', 'Retail Est (LKR)'];
    const rows = report.history.map((h) => [
      h.date,
      `"${currentVeg.nameEn} (${currentVeg.nameSi})"`,
      h.wholesaleMin,
      h.wholesaleMax,
      h.wholesaleAvg,
      h.retailEst,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dambulla_DEC_${currentVeg.id}_Price_History_${days}Days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-6 bg-emerald-900 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-emerald-950 font-bold text-lg shadow-inner shrink-0 border border-amber-300">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold">
                  {language === 'si'
                    ? `${currentVeg.nameSi} - තොග මිල ඉතිහාස වාර්තාව`
                    : `${currentVeg.nameEn} - Price History Report`}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400/90 text-emerald-950 border border-emerald-300 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-950 animate-pulse" />
                  {report?.isRealData ? 'Real Data (dambulladec.com)' : 'Dambulla DEC Data'}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                {language === 'si'
                  ? `දඹුල්ල විශේෂිත ආර්ථික මධ්‍යස්ථානයේ දින ${days} ක දෛනික මිල විශ්ලේෂණය`
                  : `Historical wholesale & retail price trends over the last ${days} days`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          
          {/* Vegetable Selector Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">
              {language === 'si' ? 'එළවළු තෝරන්න:' : 'Select Vegetable:'}
            </label>
            <select
              value={selectedVegId}
              onChange={(e) => onSelectVegId(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
            >
              {vegetables.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nameSi} ({v.nameEn}) - Rs.{v.wholesaleAvg}/kg
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-2">
            <div className="inline-flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold text-slate-700">
              {[7, 14, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    days === d ? 'bg-emerald-800 text-white shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  {d} {language === 'si' ? 'දින' : 'Days'}
                </button>
              ))}
            </div>

            {/* Export Buttons */}
            <button
              onClick={handleExportCSV}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">CSV Export</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-bold text-slate-600">
                {language === 'si' ? 'මිල වාර්තා සකස් වෙමින් පවතී...' : 'Generating Price History Report...'}
              </p>
            </div>
          ) : report ? (
            <>
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                
                <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    {language === 'si' ? 'දින 30 සාමාන්‍යය' : '30-Day Avg'}
                  </span>
                  <div className="text-xl font-extrabold font-mono text-emerald-950 mt-1">
                    Rs. {report.stat30DayAvg}
                    <span className="text-xs text-slate-500 font-sans"> /kg</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                    {language === 'si' ? 'තොග සාමාන්‍ය මිල' : 'Wholesale Average'}
                  </span>
                </div>

                <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200/80">
                  <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                    {language === 'si' ? 'අවම මිල (Low)' : 'Lowest Price'}
                  </span>
                  <div className="text-xl font-extrabold font-mono text-blue-950 mt-1">
                    Rs. {report.stat30DayMin}
                    <span className="text-xs text-slate-500 font-sans"> /kg</span>
                  </div>
                  <span className="text-[10px] text-blue-700 font-medium block mt-0.5">
                    {language === 'si' ? 'නිරීක්ෂිත අඩුම තොග මිල' : 'Minimum wholesale price'}
                  </span>
                </div>

                <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                    {language === 'si' ? 'උපරිම මිල (Peak)' : 'Highest Peak'}
                  </span>
                  <div className="text-xl font-extrabold font-mono text-amber-950 mt-1">
                    Rs. {report.stat30DayMax}
                    <span className="text-xs text-slate-500 font-sans"> /kg</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-medium block mt-0.5">
                    {language === 'si' ? 'නිරීක්ෂිත වැඩිම තොග මිල' : 'Peak wholesale price'}
                  </span>
                </div>

                <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    {language === 'si' ? 'මිල උච්චාවචනය' : 'Volatility Rating'}
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">
                    {report.volatilityRating}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                    {language === 'si' ? 'දෛනික වෙනස්වීම් මට්ටම' : 'Market stability factor'}
                  </span>
                </div>

              </div>

              {/* AI Forecast & Outlook */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 bg-amber-400 text-emerald-950 rounded-xl font-bold shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
                    {language === 'si' ? 'AI මිල ප්‍රවණතා පුරෝකථනය' : 'AI Market Outlook & Trend Forecast'}
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-100 mt-1 leading-relaxed">
                    {language === 'si' ? report.aiForecastSi : report.aiForecast}
                  </p>
                </div>
              </div>

              {/* Recharts Price History Chart */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>
                      {language === 'si'
                        ? `දින ${days} ක තොග සහ සිල්ලර මිල සටහන (LKR/kg)`
                        : `${days}-Day Price Trend Chart (LKR/kg)`}
                    </span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                      {language === 'si' ? 'අවම මිල (Min Price)' : 'Min Price'}
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-900">
                      <span className="w-3 h-3 rounded-full bg-emerald-800 inline-block"></span>
                      {language === 'si' ? 'උපරිම මිල (Max Price)' : 'Max Price'}
                    </span>
                    <span className="flex items-center gap-1.5 text-sky-700">
                      <span className="w-3 h-3 rounded-full bg-sky-600 inline-block"></span>
                      {language === 'si' ? 'තොග සාමාන්‍යය' : 'Wholesale Avg'}
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-600 hidden sm:flex">
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                      {language === 'si' ? 'සිල්ලර අනුමානය' : 'Retail Est.'}
                    </span>
                  </div>
                </div>

                <div className="h-64 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={report.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit=" Rs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                          border: 'none',
                        }}
                      />
                      <Line
                        type="linear"
                        dataKey="wholesaleMin"
                        name={language === 'si' ? 'අවම මිල' : 'Min Price'}
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 2 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="linear"
                        dataKey="wholesaleMax"
                        name={language === 'si' ? 'උපරිම මිල' : 'Max Price'}
                        stroke="#047857"
                        strokeWidth={2.5}
                        dot={{ r: 2 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="wholesaleAvg"
                        name={language === 'si' ? 'තොග සාමාන්‍යය' : 'Wholesale Avg'}
                        stroke="#0284c7"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="retailEst"
                        name={language === 'si' ? 'සිල්ලර අනුමානය' : 'Retail Est'}
                        stroke="#d97706"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Day-by-Day Historical Log Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'si' ? 'දෛනික මිල වාර්තා ලොගය' : 'Daily Price History Log'}</span>
                </h3>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <th className="py-2.5 px-4">{language === 'si' ? 'දිනය' : 'Date'}</th>
                        <th className="py-2.5 px-4 text-right">{language === 'si' ? 'තොග අවම (Min)' : 'Wholesale Min'}</th>
                        <th className="py-2.5 px-4 text-right">{language === 'si' ? 'තොග උපරිම (Max)' : 'Wholesale Max'}</th>
                        <th className="py-2.5 px-4 text-right">{language === 'si' ? 'තොග සාමාන්‍යය (Avg)' : 'Wholesale Avg'}</th>
                        <th className="py-2.5 px-4 text-right">{language === 'si' ? 'සිල්ලර අනුමානය' : 'Retail Est'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {[...report.history].reverse().map((h, idx) => (
                        <tr key={idx} className="hover:bg-emerald-50/30">
                          <td className="py-2 px-4 font-mono font-medium text-slate-600">{h.date}</td>
                          <td className="py-2 px-4 text-right font-mono">Rs. {h.wholesaleMin}</td>
                          <td className="py-2 px-4 text-right font-mono">Rs. {h.wholesaleMax}</td>
                          <td className="py-2 px-4 text-right font-mono font-bold text-emerald-950">
                            Rs. {h.wholesaleAvg}
                          </td>
                          <td className="py-2 px-4 text-right font-mono text-amber-900">Rs. {h.retailEst}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
