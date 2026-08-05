import React, { useState, useEffect } from 'react';
import { Language, FitSMSConfig } from '../types';
import { Settings, X, Key, Check, Send, Copy, ShieldCheck, CheckCircle2, Globe, Sliders, Smartphone, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, language }) => {
  const [config, setConfig] = useState<FitSMSConfig>({
    apiToken: '544|dr3JYXmtfxEwes0ryc3MUY0k2U7zYAM0SkbCxEUTd58a01be',
    endpointMode: 'v4',
    senderId: 'AnandaSeya',
    baseUrl: 'https://app.fitsms.lk/api/v4/'
  });

  const [showToken, setShowToken] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Connection Test state
  const [testPhone, setTestPhone] = useState<string>('0762755190');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  // Format Sri Lanka phone numbers for preview (supports comma-separated multiple numbers)
  const parseMultipleSLPhones = (num: string): string[] => {
    if (!num) return [];
    const parts = num.split(/[,;\s\n]+/);
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

  // Load current settings on mount
  useEffect(() => {
    if (isOpen) {
      fetch('/api/notifications/fitsms/config')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.config) {
            setConfig(data.config);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    fetch('/api/notifications/fitsms/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
      .then((res) => res.json())
      .then((data) => {
        setIsSaving(false);
        if (data.success) {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      })
      .catch((err) => {
        console.error('Failed to save config:', err);
        setIsSaving(false);
      });
  };

  const handleSendTestSMS = () => {
    setIsTesting(true);
    setTestResult(null);

    fetch('/api/notifications/fitsms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: testPhone,
        message: '[Dambulla DEC] FitSMS Gateway Settings Test: Connection Verified!',
        apiToken: config.apiToken,
        senderId: config.senderId
      })
    })
      .then((res) => res.json())
      .then((data) => {
        setIsTesting(false);
        setTestResult(data);
      })
      .catch((err) => {
        console.error('Error testing FitSMS:', err);
        setIsTesting(false);
      });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-emerald-950 flex items-center justify-center font-bold shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-white">
                {language === 'si' ? 'FitSMS.lk SMS Gateway සැකසුම් (SMS Settings)' : 'FitSMS.lk Gateway Configuration Settings'}
              </h3>
              <p className="text-xs text-emerald-300">
                {language === 'si' ? 'ශ්‍රී ලංකා FitSMS REST API v4 / HTTP API අක්තපත්‍ර' : 'Manage your Sri Lanka FitSMS API tokens and senders'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Credentials Form */}
          <form onSubmit={handleSaveConfig} className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Key className="w-4 h-4 text-emerald-700" />
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                1. FitSMS Gateway Credentials
              </h4>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                FitSMS API Token
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  required
                  value={config.apiToken}
                  onChange={(e) => setConfig({ ...config, apiToken: e.target.value })}
                  placeholder="544|dr3JYX..."
                  className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/30 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                >
                  {showToken ? 'Hide' : 'Show'}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 mt-1.5 block">
                Get token from developer menu at <a href="https://app.fitsms.lk/v4" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">app.fitsms.lk/v4</a>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Endpoint Protocol
                </label>
                <select
                  value={config.endpointMode}
                  onChange={(e: any) => setConfig({
                    ...config,
                    endpointMode: e.target.value,
                    baseUrl: e.target.value === 'v4' ? 'https://app.fitsms.lk/api/v4/' : 'https://app.fitsms.lk/api/http/'
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="v4">OAuth 2.0 REST API v4 (Recommended)</option>
                  <option value="http">Standard HTTP API Endpoint</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sender ID (Optional)
                </label>
                <input
                  type="text"
                  value={config.senderId}
                  onChange={(e) => setConfig({ ...config, senderId: e.target.value })}
                  placeholder="AnandaSeya"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-600">
                Target URL: <strong className="text-emerald-800">{config.baseUrl}sms/send</strong>
              </span>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>Configuration Saved!</span>
                  </>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>
            </div>
          </form>

          {/* Connection Test Panel */}
          <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  2. Test FitSMS Connection (Single or Multi-Numbers)
                </h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                {parseMultipleSLPhones(testPhone).length > 1 
                  ? `${parseMultipleSLPhones(testPhone).length} Numbers: ${formatSLPhone(testPhone)}` 
                  : `Target: ${formatSLPhone(testPhone)}`}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-2/3">
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="0762755190, 0771234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 bg-white"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestSMS}
                disabled={isTesting}
                className="w-full sm:w-1/3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-bounce' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Send Test SMS'}</span>
              </button>
            </div>

            {testResult && (
              <div className="p-3.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] space-y-2 border border-slate-800 mt-2">
                <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Status Code: {testResult.apiResult?.statusCode || 200}
                  </span>
                  <button
                    onClick={() => copyToClipboard(testResult.apiResult?.curlCommand || '')}
                    className="text-[10px] text-amber-300 hover:underline flex items-center gap-1 font-sans font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedCurl ? 'Copied cURL!' : 'Copy cURL'}</span>
                  </button>
                </div>

                <p className="text-slate-300">
                  <span className="text-slate-500">Sent To: </span>
                  <strong className="text-amber-300">{testResult.apiResult?.formattedRecipient || testResult.deliveredTo}</strong>
                </p>

                <p className="text-slate-300 truncate">
                  <span className="text-slate-500">Response: </span>
                  <span className="text-emerald-300">{JSON.stringify(testResult.apiResult?.responseData || 'OK')}</span>
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 px-6 flex items-center justify-between border-t border-slate-200">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            FitSMS.lk API Integration Active
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
          >
            {language === 'si' ? 'වසා දමන්න' : 'Close Settings'}
          </button>
        </div>

      </div>
    </div>
  );
};
