import React, { useState, useEffect } from 'react';
import { VegetablePrice, SMSAlertRule, SMSLog, Language, FitSMSConfig } from '../types';
import { Bell, Send, Trash2, Smartphone, ShieldCheck, Zap, CheckCircle2, RefreshCw, AlertCircle, MessageSquare, Key, Globe, Copy, Check, SlidersHorizontal } from 'lucide-react';

interface SMSAlertsManagerProps {
  vegetables: VegetablePrice[];
  language: Language;
  preselectedVeg?: VegetablePrice | null;
  onRuleAdded?: () => void;
}

export const SMSAlertsManager: React.FC<SMSAlertsManagerProps> = ({
  vegetables,
  language,
  preselectedVeg,
  onRuleAdded,
}) => {
  const [rules, setRules] = useState<SMSAlertRule[]>([]);
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // FitSMS Configuration state
  const [fitSMSConfig, setFitSMSConfig] = useState<FitSMSConfig>({
    apiToken: '544|dr3JYXmtfxEwes0ryc3MUY0k2U7zYAM0SkbCxEUTd58a01be',
    endpointMode: 'v4',
    senderId: 'AnandaSeya',
    baseUrl: 'https://app.fitsms.lk/api/v4/'
  });
  const [showToken, setShowToken] = useState<boolean>(false);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [configSavedSuccess, setConfigSavedSuccess] = useState<boolean>(false);

  // Helper to format multiple Sri Lanka phone numbers live for display
  const parseMultipleSLPhones = (input: string): string[] => {
    if (!input) return [];
    const parts = input.split(/[,;\s\n]+/);
    const result: string[] = [];
    parts.forEach((p) => {
      let cleaned = p.trim().replace(/[^\d+]/g, '');
      if (!cleaned) return;
      if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
      if (cleaned.startsWith('0') && cleaned.length === 10) cleaned = '94' + cleaned.substring(1);
      else if (cleaned.length === 9 && !cleaned.startsWith('94')) cleaned = '94' + cleaned;
      if (cleaned.length >= 9) result.push(cleaned);
    });
    return Array.from(new Set(result));
  };

  const formatSLPhone = (num: string) => {
    const list = parseMultipleSLPhones(num);
    return list.length > 0 ? list.join(', ') : '94762755190';
  };

  // Direct FitSMS Quick Sender State
  const [directRecipient, setDirectRecipient] = useState<string>('0762755190');
  const [directMessage, setDirectMessage] = useState<string>('[FitSMS Alert] Dambulla DEC Vegetable price drop alert: Carrot Rs. 200/kg!');
  const [isSendingDirect, setIsSendingDirect] = useState<boolean>(false);
  const [directSendResult, setDirectSendResult] = useState<any>(null);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  // Form State
  const [phone, setPhone] = useState<string>('0762755190');
  const [selectedVegId, setSelectedVegId] = useState<string>(preselectedVeg?.id || vegetables[0]?.id || 'carrot');
  const [triggerType, setTriggerType] = useState<'below_price' | 'percentage_drop'>('below_price');
  const [targetPrice, setTargetPrice] = useState<number>(preselectedVeg ? Math.round(preselectedVeg.wholesaleAvg * 0.9) : 200);
  const [percentageDrop, setPercentageDrop] = useState<number>(10);
  const [provider, setProvider] = useState<'fitsms' | 'dialog' | 'mobitel' | 'notifylk' | 'twilio' | 'webhook'>('fitsms');
  const [alertLang, setAlertLang] = useState<Language>(language);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Test Execution State
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  useEffect(() => {
    if (preselectedVeg) {
      setSelectedVegId(preselectedVeg.id);
      setTargetPrice(Math.round(preselectedVeg.wholesaleAvg * 0.9));
    }
  }, [preselectedVeg]);

  // Fetch Rules, Logs & FitSMS Config
  const fetchSmsData = () => {
    setLoading(true);
    fetch('/api/notifications/sms/rules')
      .then((res) => res.json())
      .then((data) => {
        setRules(data.rules || []);
        setLogs(data.logs || []);
        if (data.fitSMSConfig) {
          setFitSMSConfig(data.fitSMSConfig);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load SMS data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSmsData();
  }, []);

  // Save FitSMS Config
  const handleSaveFitSMSConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigSavedSuccess(false);

    fetch('/api/notifications/fitsms/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fitSMSConfig)
    })
      .then((res) => res.json())
      .then((data) => {
        setIsSavingConfig(false);
        if (data.success) {
          setConfigSavedSuccess(true);
          setTimeout(() => setConfigSavedSuccess(false), 3000);
          fetchSmsData();
        }
      })
      .catch((err) => {
        console.error('Failed to save FitSMS config:', err);
        setIsSavingConfig(false);
      });
  };

  // Direct FitSMS Send
  const handleSendDirectFitSMS = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingDirect(true);
    setDirectSendResult(null);

    fetch('/api/notifications/fitsms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: directRecipient,
        message: directMessage,
        apiToken: fitSMSConfig.apiToken,
        senderId: fitSMSConfig.senderId
      })
    })
      .then((res) => res.json())
      .then((data) => {
        setIsSendingDirect(false);
        setDirectSendResult(data);
        fetchSmsData();
      })
      .catch((err) => {
        console.error('Error sending direct FitSMS:', err);
        setIsSendingDirect(false);
      });
  };

  // Create new rule
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    fetch('/api/notifications/sms/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        vegetableId: selectedVegId,
        triggerType,
        targetPrice,
        percentageDrop,
        provider,
        language: alertLang,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsSubmitting(false);
        if (data.success) {
          fetchSmsData();
          if (onRuleAdded) onRuleAdded();
        }
      })
      .catch((err) => {
        console.error('Error creating SMS alert rule:', err);
        setIsSubmitting(false);
      });
  };

  // Delete Rule
  const handleDeleteRule = (id: string) => {
    fetch(`/api/notifications/sms/rules/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => fetchSmsData())
      .catch(console.error);
  };

  // Dispatch Test SMS Simulation / Real FitSMS
  const handleTestSMS = (ruleId?: string) => {
    setIsTesting(true);
    setTestResult(null);

    fetch('/api/notifications/sms/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ruleId,
        customPhone: directRecipient || phone || '0762755190',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsTesting(false);
        setTestResult(data);
        fetchSmsData();
      })
      .catch((err) => {
        console.error('Error testing SMS API:', err);
        setIsTesting(false);
      });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const selectedVegObj = vegetables.find((v) => v.id === selectedVegId) || vegetables[0];

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-400 text-emerald-950 font-bold">
              <Smartphone className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold tracking-tight">
              {language === 'si'
                ? 'FitSMS ශ්‍රී ලංකා Gateway සමග ක්ෂණික SMS (FIT SMS Integration)'
                : 'Send Instant SMS with FIT SMS Gateway (Sri Lanka API v4)'}
            </h2>
          </div>
          <p className="text-xs text-emerald-200 mt-1.5 leading-relaxed max-w-2xl">
            {language === 'si'
              ? 'FitSMS.lk (OAuth 2.0 API v4 & HTTP API) තාක්ෂණය හරහා දඹුල්ල එළවළු මිල පහත වැටීම් දැනුම්දීම් ඕනෑම Dialog, Mobitel, Airtel, Hutch අංකයකට තත්පර ගණනින් යවන්න.'
              : 'Direct integration with FitSMS.lk REST API v4 & HTTP endpoints. Send real-time price drop notifications to any mobile number in Sri Lanka.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleTestSMS()}
            disabled={isTesting}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Send className={`w-4 h-4 ${isTesting ? 'animate-bounce' : ''}`} />
            <span>
              {isTesting
                ? (language === 'si' ? 'FitSMS යවමින්...' : 'Dispatching FitSMS...')
                : (language === 'si' ? 'FitSMS පරීක්ෂණ API යවන්න' : 'Dispatch Test FitSMS')}
            </span>
          </button>
        </div>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Create SMS Alert Rule Form */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Bell className="w-5 h-5 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {language === 'si' ? 'නව SMS Alert එකක් සකසන්න' : 'Set New Price Drop Alert'}
            </h3>
          </div>

          <form onSubmit={handleCreateRule} className="space-y-4">
            {/* Phone Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  {language === 'si' ? 'දුරකථන අංක (Multiple Mobile Numbers)' : 'Mobile Phone Numbers'}
                </label>
                {parseMultipleSLPhones(phone).length > 0 && (
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {parseMultipleSLPhones(phone).length} {parseMultipleSLPhones(phone).length === 1 ? 'Number' : 'Numbers'}
                  </span>
                )}
              </div>
              <textarea
                rows={2}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0762755190, 0771234567, 0719876543"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {language === 'si' ? 'අංක කිහිපයක් සඳහා කොමා (,) හෝ හිස්තැනින් වෙන් කරන්න' : 'Enter multiple numbers separated by commas, spaces, or newlines'}
              </span>
              {parseMultipleSLPhones(phone).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {parseMultipleSLPhones(phone).map((num, i) => (
                    <span key={i} className="text-[10px] font-mono font-bold bg-slate-900 text-emerald-400 px-2 py-0.5 rounded-lg border border-slate-700">
                      +{num}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Select Vegetable */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'si' ? 'එළවළු හෝ අල වර්ගය (Select Item)' : 'Select Item'}
              </label>
              <select
                value={selectedVegId}
                onChange={(e) => {
                  setSelectedVegId(e.target.value);
                  const veg = vegetables.find((v) => v.id === e.target.value);
                  if (veg) setTargetPrice(Math.round(veg.wholesaleAvg * 0.9));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 focus:outline-hidden"
              >
                {vegetables.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nameSi} ({v.nameEn}) - Rs.{v.wholesaleAvg}/kg
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'si' ? 'දැනුම්දීමේ කොන්දේසිය' : 'Trigger Condition'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTriggerType('below_price')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    triggerType === 'below_price'
                      ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {language === 'si' ? 'මිල සීමාවට වඩා අඩු වූ විට' : 'Price Drops Below'}
                </button>
                <button
                  type="button"
                  onClick={() => setTriggerType('percentage_drop')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    triggerType === 'percentage_drop'
                      ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {language === 'si' ? '% කින් පහළ ගිය විට' : '% Percentage Drop'}
                </button>
              </div>
            </div>

            {/* Trigger Input Value */}
            {triggerType === 'below_price' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'si'
                    ? `ඉලක්ක තොග මිල (Target Price) - වත්මන්: Rs. ${selectedVegObj?.wholesaleAvg}`
                    : `Target Wholesale Price (Current: Rs.${selectedVegObj?.wholesaleAvg})`}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">
                    Rs.
                  </span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'si' ? 'අවම % පහත වැටීම (Drop Percentage)' : 'Minimum % Price Drop'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={percentageDrop}
                    onChange={(e) => setPercentageDrop(Number(e.target.value))}
                    className="w-full pr-8 pl-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">
                    %
                  </span>
                </div>
              </div>
            )}

            {/* Gateway Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'si' ? 'SMS Gateway සේවාව' : 'SMS Gateway Provider'}
              </label>
              <select
                value={provider}
                onChange={(e: any) => setProvider(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/30 bg-amber-50/50"
              >
                <option value="fitsms">⚡ FIT SMS (app.fitsms.lk) - Sri Lanka API v4</option>
                <option value="dialog">Dialog BizSMS API Gateway</option>
                <option value="mobitel">Mobitel Enterprise SMS API</option>
                <option value="notifylk">Notify.lk Sri Lanka SMS Gateway</option>
                <option value="twilio">Twilio Programmable SMS API</option>
                <option value="webhook">Custom Webhook Endpoint</option>
              </select>
            </div>

            {/* Language Preference */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'si' ? 'SMS භාෂාව (SMS Language)' : 'SMS Message Language'}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAlertLang('si')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                    alertLang === 'si' ? 'bg-amber-400 text-emerald-950 border-amber-500' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  සිංහල (Sinhala)
                </button>
                <button
                  type="button"
                  onClick={() => setAlertLang('en')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                    alertLang === 'en' ? 'bg-amber-400 text-emerald-950 border-amber-500' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4 text-amber-300" />
              <span>
                {isSubmitting
                  ? (language === 'si' ? 'ලියාපදිංචි වෙමින්...' : 'Saving Alert...')
                  : (language === 'si' ? 'FitSMS Alert එක සක්‍රිය කරන්න' : 'Activate Price Drop FitSMS Alert')}
              </span>
            </button>
          </form>
        </div>

        {/* 2. Active Rules & Live API Dispatch Log */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Test SMS Execution Output Drawer */}
          {testResult && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-emerald-500/50 shadow-lg space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {language === 'si'
                      ? 'FitSMS / Gateway API සාර්ථකව ක්‍රියාත්මක විය'
                      : 'SMS Gateway API Triggered Successfully'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{testResult.provider?.toUpperCase()} API</span>
              </div>

              <div className="text-xs space-y-1 font-mono">
                <p>
                  <span className="text-slate-400">Endpoint: </span>
                  <span className="text-emerald-300">{testResult.apiEndpointSimulated}</span>
                </p>
                <p>
                  <span className="text-slate-400">Recipient: </span>
                  <span className="text-amber-300">{testResult.deliveredTo}</span>
                </p>
                {testResult.fitSmsApiResult && (
                  <p>
                    <span className="text-slate-400">FitSMS HTTP Code: </span>
                    <span className="text-emerald-400 font-bold">{testResult.fitSmsApiResult.statusCode}</span>
                  </p>
                )}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-200 mt-2 font-sans">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
                    SMS Message Body:
                  </span>
                  "{testResult.payloadSent?.message}"
                </div>
              </div>
            </div>
          )}

          {/* Active Alert Subscriptions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {language === 'si' ? 'සක්‍රිය SMS දැනුම්දීම් ලැයිස්තුව' : 'Active SMS Alert Rules'}
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                {rules.length} {language === 'si' ? 'සක්‍රියයි' : 'Active'}
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs font-bold text-slate-500">Loading SMS rules...</div>
            ) : rules.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                {language === 'si' ? 'තවම SMS Alert නොමැත.' : 'No SMS alerts configured yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">{language === 'si' ? 'එළවළු' : 'Vegetable'}</th>
                      <th className="py-2.5 px-3">{language === 'si' ? 'දුරකථනය' : 'Phone'}</th>
                      <th className="py-2.5 px-3">{language === 'si' ? 'කොන්දේසිය' : 'Trigger Condition'}</th>
                      <th className="py-2.5 px-3">{language === 'si' ? 'Gateway' : 'Gateway'}</th>
                      <th className="py-2.5 px-3 text-center">{language === 'si' ? 'යැවූ ගණන' : 'Sent'}</th>
                      <th className="py-2.5 px-3 text-right">{language === 'si' ? 'ක්‍රියා' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {language === 'si' ? rule.vegetableNameSi : rule.vegetableNameEn}
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-700">{rule.phone}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            {rule.triggerType === 'below_price'
                              ? `Rs. ${rule.targetPrice} ට වඩා අඩු වූ විට`
                              : `Drop > ${rule.percentageDrop}%`}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold uppercase text-[10px] text-emerald-800">
                          {rule.provider === 'fitsms' ? '⚡ FIT SMS' : rule.provider}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                          {rule.triggerCount}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleTestSMS(rule.id)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition-colors"
                              title="Test trigger this rule"
                            >
                              <Zap className="w-3.5 h-3.5 text-emerald-700" />
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                              title="Delete rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SMS Dispatch History Logs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {language === 'si' ? 'SMS යැවීමේ සජීවී වාර්තාව (Delivery Logs)' : 'SMS Delivery History Logs'}
                </h3>
              </div>
            </div>

            {logs.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                {language === 'si' ? 'තවම SMS යවා නොමැත.' : 'No SMS messages sent yet.'}
              </div>
            ) : (
              <div className="space-y-2.5">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="font-bold text-slate-900">{log.vegetableName}</span>
                        <span className="font-mono text-slate-500">({log.phone})</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 font-sans leading-relaxed text-[11px] bg-white p-2 rounded-lg border border-slate-100">
                      {log.message}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Gateway: <strong className="uppercase text-emerald-700 font-bold">{log.provider}</strong></span>
                      <span className="text-emerald-700 font-bold uppercase">
                        Status: {log.status === 'sent' ? 'Delivered 🟢' : 'Attempted / Sent'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
