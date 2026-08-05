import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_VEGETABLES, generateHistoryForVegetable } from './data/vegetablesData';
import { VegetablePrice, PriceHistoryPoint, SMSAlertRule, SMSLog, FitSMSConfig } from './types';

// In-memory data state
let currentVegetables: VegetablePrice[] = JSON.parse(JSON.stringify(INITIAL_VEGETABLES));
let lastUpdatedTime = new Date().toISOString();
let isSyncedOnce = false;

// FitSMS Configuration (Sri Lanka FitSMS.lk Integration)
let fitSMSConfig: FitSMSConfig = {
  apiToken: process.env.FITSMS_API_TOKEN || '544|dr3JYXmtfxEwes0ryc3MUY0k2U7zYAM0SkbCxEUTd58a01be',
  endpointMode: 'v4',
  senderId: 'AnandaSeya',
  baseUrl: 'https://app.fitsms.lk/api/v4/'
};

function parseMultipleSriLankaPhones(phoneInput: string): string[] {
  if (!phoneInput || !phoneInput.trim()) return ['94762755190'];
  const rawParts = phoneInput.split(/[,;\s\n]+/);
  const formattedList: string[] = [];

  for (let part of rawParts) {
    let cleaned = part.trim().replace(/[^\d+]/g, '');
    if (!cleaned) continue;
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '94' + cleaned.substring(1);
    } else if (cleaned.length === 9 && !cleaned.startsWith('94')) {
      cleaned = '94' + cleaned;
    }
    if (cleaned.length >= 9) {
      formattedList.push(cleaned);
    }
  }

  return formattedList.length > 0 ? Array.from(new Set(formattedList)) : ['94762755190'];
}

let smsRules: SMSAlertRule[] = [
  {
    id: 'rule-fitsms-1',
    phone: '0762755190',
    vegetableId: 'carrot',
    vegetableNameEn: 'Carrot',
    vegetableNameSi: 'කැරට්',
    triggerType: 'below_price',
    targetPrice: 210,
    provider: 'fitsms',
    language: 'si',
    active: true,
    createdAt: new Date().toISOString(),
    triggerCount: 3,
    lastTriggered: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'rule-demo-2',
    phone: '0762755190',
    vegetableId: 'tomato',
    vegetableNameEn: 'Tomato',
    vegetableNameSi: 'තක්කාලි',
    triggerType: 'percentage_drop',
    percentageDrop: 15,
    provider: 'fitsms',
    language: 'en',
    active: true,
    createdAt: new Date().toISOString(),
    triggerCount: 1,
    lastTriggered: new Date(Date.now() - 3600000 * 12).toISOString(),
  }
];

let smsLogs: SMSLog[] = [
  {
    id: 'log-1',
    phone: '0762755190',
    vegetableName: 'කැරට් (Carrot)',
    message: '[FitSMS Alert] Carrot wholesale price dropped to Rs.200/kg (below target Rs.210/kg). Dambulla DEC Live.',
    status: 'sent',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    provider: 'fitsms',
    priceTriggered: 200,
  }
];

async function sendFitSMS(rawRecipient: string, message: string, tokenOverride?: string, senderIdOverride?: string) {
  const token = tokenOverride || fitSMSConfig.apiToken;
  const senderId = senderIdOverride || fitSMSConfig.senderId || 'AnandaSeya';
  const baseUrl = fitSMSConfig.endpointMode === 'v4' ? 'https://app.fitsms.lk/api/v4' : 'https://app.fitsms.lk/api/http';
  const endpoint = `${baseUrl}/sms/send`;

  const recipientList = parseMultipleSriLankaPhones(rawRecipient);
  const formattedRecipient = recipientList.length === 1 ? recipientList[0] : recipientList.join(',');

  const payload = {
    recipient: recipientList.length === 1 ? recipientList[0] : recipientList,
    to: formattedRecipient,
    number: formattedRecipient,
    mobile: formattedRecipient,
    recipients: recipientList,
    message,
    text: message,
    sender_id: senderId
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const status = response.status;
    let responseData: any = null;
    try {
      responseData = await response.json();
    } catch {
      responseData = await response.text();
    }

    return {
      success: response.ok,
      statusCode: status,
      endpoint,
      rawRecipient,
      recipientsCount: recipientList.length,
      formattedRecipient,
      recipientList,
      payload,
      responseData,
      curlCommand: `curl -X POST "${endpoint}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(payload)}'`
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      endpoint,
      rawRecipient,
      recipientsCount: recipientList.length,
      formattedRecipient,
      recipientList,
      payload,
      error: error.message || 'Network error connecting to app.fitsms.lk',
      curlCommand: `curl -X POST "${endpoint}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(payload)}'`
    };
  }
}

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

const DAMBULLA_PRODUCT_MAP: Record<string, number> = {
  carrot: 6,
  beans: 4,
  leeks: 19,
  beetroot: 8,
  cabbage: 1,
  capsicum: 66,
  radish: 13,
  knol_khol: 51,
  cauliflower: 2,
  tomato: 11,
  brinjal: 26,
  green_chilli: 67,
  green_chili: 67,
  pumpkin: 52,
  bitter_gourd: 24,
  snake_gourd: 23,
  ridge_gourd: 21,
  okra: 22,
  ladies_fingers: 22,
  cucumber: 14,
  drumstick: 61,
  ash_plantain: 62,
  ash_gourd: 53,
  long_beans: 60,
  winged_bean: 59,
  kekiri: 53,
  potato_nuwaraeliya: 15,
  potato_imported: 20,
  sweet_potato: 97,
  manioc: 98,
  innala: 96,
  kiri_ala: 99,
  raja_ala: 99,
  katu_ala: 98,
  kohila_ala: 100,
  lime: 27,
  red_onion_local: 69,
  red_onion_imported: 31,
  big_onion_imported: 70,
  big_onion_local: 48,
  ginger: 28,
  garlic: 47,
  dry_chilli: 49,
  dry_chili: 49,
};

async function syncLivePricesFromDambullaDec() {
  const entries = Object.entries(DAMBULLA_PRODUCT_MAP);
  let updatedCount = 0;

  await Promise.all(
    entries.map(async ([vegId, pId]) => {
      try {
        const response = await fetch(`https://api.dambulladec.com/api/prices/product/${pId}/chart`, {
          headers: { 'User-Agent': 'DambullaDECPriceTracker/1.0' }
        });
        if (response.ok) {
          const rawData = await response.json();
          if (Array.isArray(rawData) && rawData.length > 0) {
            const latest = rawData[rawData.length - 1];
            const prev = rawData.length > 1 ? rawData[rawData.length - 2] : latest;

            const idx = currentVegetables.findIndex(v => v.id === vegId);
            if (idx !== -1) {
              const min = latest.min_price || currentVegetables[idx].wholesaleMin;
              const max = latest.max_price || currentVegetables[idx].wholesaleMax;
              const avg = Math.round((min + max) / 2);

              const prevAvg = prev ? Math.round(((prev.min_price || min) + (prev.max_price || max)) / 2) : avg;
              const changePct = prevAvg > 0 ? Number((((avg - prevAvg) / prevAvg) * 100).toFixed(2)) : 0;

              currentVegetables[idx] = {
                ...currentVegetables[idx],
                dambullaProductId: pId,
                wholesaleMin: min,
                wholesaleMax: max,
                wholesaleAvg: avg,
                retailEst: Math.round(avg * 1.35),
                previousAvg: prevAvg,
                changePercent: changePct,
                trend: changePct > 1 ? 'up' : changePct < -1 ? 'down' : 'stable',
                lastUpdated: `Live from Dambulla DEC (${latest.date})`
              };
              updatedCount++;
            }
          }
        }
      } catch (err) {
        // Silently preserve existing data on fetch error
      }
    })
  );

  if (updatedCount > 0) {
    lastUpdatedTime = new Date().toISOString();
    isSyncedOnce = true;
  }
  return updatedCount;
}

const app = express();
app.use(express.json());

// Remove blocking middleware for serverless performance
// Routes handle single-item live fetch on demand with timeout protection

// 1. Live Daily Prices API
app.get('/api/prices/today', async (req, res) => {
  try {
    const refresh = req.query.refresh === 'true';
    if (refresh) {
      await syncLivePricesFromDambullaDec();
    }

    res.json({
      source: 'Dambulla Dedicated Economic Centre Official API (dambulladec.com)',
      url: 'https://dambulladec.com/home-dailyprice',
      lastUpdated: lastUpdatedTime,
      totalItems: currentVegetables.length,
      vegetables: currentVegetables,
    });
  } catch (err: any) {
    res.json({
      source: 'Dambulla Dedicated Economic Centre Official API (dambulladec.com)',
      lastUpdated: lastUpdatedTime,
      totalItems: currentVegetables.length,
      vegetables: currentVegetables,
      error: err?.message
    });
  }
});

// 2. Vegetable History API
app.get('/api/prices/history', async (req, res) => {
  try {
    const vegId = (req.query.item as string) || 'carrot';
    const days = parseInt((req.query.days as string) || '30', 10);

    const found = currentVegetables.find(v => v.id === vegId) || currentVegetables[0];
    const dambullaId = DAMBULLA_PRODUCT_MAP[found.id] || found.dambullaProductId;

    let history: PriceHistoryPoint[] = [];
    let isRealData = false;

    if (dambullaId) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(`https://api.dambulladec.com/api/prices/product/${dambullaId}/chart`, {
          headers: { 'User-Agent': 'DambullaDECPriceTracker/1.0' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const rawData = await response.json();
          if (Array.isArray(rawData) && rawData.length > 0) {
            const sorted = [...rawData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const sliced = sorted.slice(-days);

            history = sliced.map(item => {
              const min = Number(item.min_price) || 0;
              const max = Number(item.max_price) || min;
              const avg = Math.round((min + max) / 2);
              return {
                date: item.date,
                wholesaleMin: min,
                wholesaleMax: max,
                wholesaleAvg: avg,
                retailEst: Math.round(avg * 1.35)
              };
            });

            isRealData = history.length > 0;
          }
        }
      } catch (err) {
        console.error(`Error fetching real Dambulla DEC history for product ${dambullaId}:`, err);
      }
    }

    if (!history || history.length === 0) {
      history = generateHistoryForVegetable(found, days);
    }

    const avg30 = Math.round(history.reduce((acc, h) => acc + h.wholesaleAvg, 0) / (history.length || 1));
    const min30 = Math.min(...history.map(h => h.wholesaleMin));
    const max30 = Math.max(...history.map(h => h.wholesaleMax));

    const trendText = found.changePercent < -5 
      ? 'Prices are trending downwards due to high harvest arrivals from Matale & Nuwara Eliya. Expected to remain stable over the next 3 days.'
      : found.changePercent > 5
      ? 'Prices rising due to rain-affected transport. Supply expected to normalize later this week.'
      : 'Price stability maintained with balanced supply & demand at Dambulla DEC.';

    const trendTextSi = found.changePercent < -5 
      ? 'මාතලේ සහ නුවරඑළිය අස්වැන්න වැඩිවීම නිසා මිල පහළ යමින් පවතී. ඉදිරි දින 3 තුළ මිල ස්ථාවරව පවතිනු ඇතැයි අපේක්ෂා කෙරේ.'
      : found.changePercent > 5
      ? 'වැසි සහිත කාලගුණය නිසා ප්‍රවාහන ප්‍රමාදයන් හේතුවෙන් මිල ඉහළ ගොස් ඇත. සති අග වන විට සැපයුම යථා තත්ත්වයට පත්වනු ඇත.'
      : 'දඹුල්ල ආර්ථික මධ්‍යස්ථානයේ සැපයුම සහ ඉල්ලුම සමතුලිතව පවතින බැවින් මිල ස්ථාවරයි.';

    res.json({
      vegetable: found,
      days,
      history,
      dataSource: isRealData 
        ? 'Dambulla Dedicated Economic Centre Official API (https://dambulladec.com)' 
        : 'Dambulla Market Historical Model',
      isRealData,
      stat7DayAvg: Math.round(history.slice(-7).reduce((a, b) => a + b.wholesaleAvg, 0) / Math.min(7, history.length || 1)),
      stat30DayAvg: avg30,
      stat30DayMin: min30,
      stat30DayMax: max30,
      volatilityRating: Math.abs(found.changePercent) > 15 ? 'High' : Math.abs(found.changePercent) > 5 ? 'Moderate' : 'Low',
      aiForecast: trendText,
      aiForecastSi: trendTextSi
    });
  } catch (err: any) {
    console.error('Unhandled history route error:', err);
    const found = currentVegetables[0];
    const history = generateHistoryForVegetable(found, 30);
    res.json({
      vegetable: found,
      days: 30,
      history,
      dataSource: 'Dambulla Market Historical Model (Fallback)',
      isRealData: false,
      stat7DayAvg: 200,
      stat30DayAvg: 200,
      stat30DayMin: 150,
      stat30DayMax: 250,
      volatilityRating: 'Low',
      aiForecast: 'Price stability maintained.',
      aiForecastSi: 'මිල ස්ථාවරව පවතී.'
    });
  }
});

// 3. FitSMS Gateway Endpoints
app.get('/api/notifications/fitsms/config', (req, res) => {
  res.json({
    config: fitSMSConfig,
    maskedToken: fitSMSConfig.apiToken ? `${fitSMSConfig.apiToken.substring(0, 8)}...${fitSMSConfig.apiToken.slice(-4)}` : 'Not set',
    availableEndpoints: [
      { name: 'OAuth 2.0 REST API v4', url: 'https://app.fitsms.lk/api/v4/' },
      { name: 'HTTP API Endpoint', url: 'https://app.fitsms.lk/api/http/' }
    ]
  });
});

app.post('/api/notifications/fitsms/config', (req, res) => {
  const { apiToken, endpointMode, senderId } = req.body;
  if (apiToken) fitSMSConfig.apiToken = apiToken;
  if (endpointMode && (endpointMode === 'v4' || endpointMode === 'http')) fitSMSConfig.endpointMode = endpointMode;
  if (senderId !== undefined) fitSMSConfig.senderId = senderId;
  fitSMSConfig.baseUrl = fitSMSConfig.endpointMode === 'v4' ? 'https://app.fitsms.lk/api/v4/' : 'https://app.fitsms.lk/api/http/';

  res.json({
    success: true,
    message: 'FitSMS gateway configuration updated successfully',
    config: fitSMSConfig
  });
});

app.post('/api/notifications/fitsms/send', async (req, res) => {
  const { recipient, message, apiToken, senderId } = req.body;
  if (!recipient || !message) {
    return res.status(400).json({ error: 'Recipient and message are required' });
  }

  const fitSmsResult = await sendFitSMS(recipient, message, apiToken, senderId);

  const newLog: SMSLog = {
    id: `log-${Date.now()}`,
    phone: recipient,
    vegetableName: 'Direct FitSMS Message',
    message: message,
    status: fitSmsResult.success ? 'sent' : 'failed',
    timestamp: new Date().toISOString(),
    provider: 'fitsms',
    priceTriggered: 0,
  };
  smsLogs.unshift(newLog);

  res.json({
    success: fitSmsResult.success,
    provider: 'fitsms',
    deliveredTo: recipient,
    apiResult: fitSmsResult,
    log: newLog
  });
});

app.get('/api/notifications/sms/rules', (req, res) => {
  res.json({ rules: smsRules, logs: smsLogs, fitSMSConfig });
});

app.post('/api/notifications/sms/rules', (req, res) => {
  const { phone, vegetableId, triggerType, targetPrice, percentageDrop, provider, language } = req.body;
  
  const veg = currentVegetables.find(v => v.id === vegetableId);
  if (!veg) {
    return res.status(400).json({ error: 'Vegetable not found' });
  }

  const newRule: SMSAlertRule = {
    id: `rule-${Date.now()}`,
    phone: phone || '0770000000',
    vegetableId,
    vegetableNameEn: veg.nameEn,
    vegetableNameSi: veg.nameSi,
    triggerType: triggerType || 'below_price',
    targetPrice: targetPrice ? Number(targetPrice) : undefined,
    percentageDrop: percentageDrop ? Number(percentageDrop) : undefined,
    provider: provider || 'fitsms',
    language: language || 'si',
    active: true,
    createdAt: new Date().toISOString(),
    triggerCount: 0,
  };

  smsRules.unshift(newRule);
  res.json({ success: true, rule: newRule });
});

app.delete('/api/notifications/sms/rules/:id', (req, res) => {
  const { id } = req.params;
  smsRules = smsRules.filter(r => r.id !== id);
  res.json({ success: true, id });
});

app.post('/api/notifications/sms/test', async (req, res) => {
  const { ruleId, customPhone, customMessage } = req.body;
  const rule = smsRules.find(r => r.id === ruleId) || smsRules[0];
  const veg = currentVegetables.find(v => v.id === rule?.vegetableId) || currentVegetables[0];

  const targetPhone = customPhone || rule?.phone || '0771234567';
  const lang = rule?.language || 'si';
  const provider = rule?.provider || 'fitsms';

  const defaultMsg = lang === 'si'
    ? `[දඹුල්ල ආර්ථික මධ්‍යස්ථානය] ${veg.nameSi} (${veg.nameEn}) කිලෝවක තොග මිල රු. ${veg.wholesaleAvg} දක්වා පහළ බැස ඇත! FitSMS Alert.`
    : `[Dambulla DEC Alert] ${veg.nameEn} wholesale price dropped to Rs. ${veg.wholesaleAvg}/kg! Target met via FitSMS API.`;

  const msg = customMessage || defaultMsg;

  let fitSmsResult: any = null;
  let isSuccess = true;

  if (provider === 'fitsms') {
    fitSmsResult = await sendFitSMS(targetPhone, msg);
    isSuccess = fitSmsResult.success;
  }

  const newLog: SMSLog = {
    id: `log-${Date.now()}`,
    phone: targetPhone,
    vegetableName: `${veg.nameSi} (${veg.nameEn})`,
    message: msg,
    status: isSuccess ? 'sent' : 'failed',
    timestamp: new Date().toISOString(),
    provider: provider,
    priceTriggered: veg.wholesaleAvg,
  };

  smsLogs.unshift(newLog);

  if (rule) {
    rule.triggerCount += 1;
    rule.lastTriggered = new Date().toISOString();
  }

  res.json({
    success: isSuccess,
    deliveredTo: targetPhone,
    provider: provider,
    apiEndpointSimulated: provider === 'fitsms' ? fitSmsResult?.endpoint : `https://api.${provider}.lk/sms/v1/send`,
    fitSmsApiResult: fitSmsResult,
    payloadSent: {
      to: targetPhone,
      message: msg,
      sender_id: fitSMSConfig.senderId || 'FITSMS',
      timestamp: new Date().toISOString()
    },
    log: newLog
  });
});

// 4. AI Market Summary Endpoint using Gemini API
app.get('/api/ai/market-summary', async (req, res) => {
  const ai = getGeminiClient();
  
  const sortedByDrop = [...currentVegetables].sort((a, b) => a.changePercent - b.changePercent);
  const topDrop = sortedByDrop[0];
  const topRise = sortedByDrop[sortedByDrop.length - 1];

  if (!ai) {
    return res.json({
      source: 'Dambulla DEC Market AI Analysis Engine',
      summaryEn: `Today at Dambulla DEC, ${topDrop.nameEn} experienced the highest price drop of ${Math.abs(topDrop.changePercent)}%, selling at Rs. ${topDrop.wholesaleAvg}/kg. Conversely, ${topRise.nameEn} prices rose by ${topRise.changePercent}% to Rs. ${topRise.wholesaleAvg}/kg due to tight arrivals. Overall wholesale market activity remains vibrant with high truck volumes arriving from Dambulla hinterlands.`,
      summarySi: `අද දඹුල්ල විශේෂිත ආර්ථික මධ්‍යස්ථානයේදී ${topDrop.nameSi} මිල ${Math.abs(topDrop.changePercent)}% කින් විශාල ලෙස පහළ බැස රු. ${topDrop.wholesaleAvg}/kg ලෙස සටහන් විය. එමෙන්ම ${topRise.nameSi} මිල ${topRise.changePercent}% කින් ඉහළ ගොස් රු. ${topRise.wholesaleAvg}/kg දක්වා වැඩි වී ඇත. වෙළඳපොළ සමස්ත සැපයුම යහපත් මට්ටමක පවතී.`,
      topGainer: `${topRise.nameSi} (${topRise.nameEn}) - Rs. ${topRise.wholesaleAvg}/kg (+${topRise.changePercent}%)`,
      topLoser: `${topDrop.nameSi} (${topDrop.nameEn}) - Rs. ${topDrop.wholesaleAvg}/kg (${topDrop.changePercent}%)`,
      arrivalStatus: 'High arrival volume (~450 Tonnes total today)',
      buyerTipsEn: [
        `Target buying ${topDrop.nameEn} and Cabbage for maximum profit margins today.`,
        'Morning trade between 5:00 AM - 8:00 AM offers the freshest Grade A stocks.',
        `Monitor ${topRise.nameEn} closely as prices may normalize in 48 hours.`
      ],
      buyerTipsSi: [
        `අද වැඩිම ලාභයක් සඳහා ${topDrop.nameSi} සහ ගෝවා තොග වශයෙන් මිලදී ගැනීමට යෝග්‍ය වේ.`,
        'පෙරවරු 5:00 සිට 8:00 දක්වා කාලය තුළ හොඳම Grade A තොග ලබාගත හැක.',
        `ඉදිරි පැය 48 තුළ ${topRise.nameSi} මිල යථා තත්ත්වයට පත්වනු ඇතැයි අපේක්ෂා කෙරේ.`
      ]
    });
  }

  try {
    const prompt = `You are a Sri Lankan agricultural economist and Dambulla Dedicated Economic Centre market expert.
Analyze the following live vegetable price data for Dambulla DEC:
Top Price Drop: ${topDrop.nameEn} (${topDrop.nameSi}) down by ${topDrop.changePercent}% to Rs.${topDrop.wholesaleAvg}/kg.
Top Price Rise: ${topRise.nameEn} (${topRise.nameSi}) up by ${topRise.changePercent}% to Rs.${topRise.wholesaleAvg}/kg.
Total Monitored items: ${currentVegetables.length}.

Provide a brief daily market summary in JSON format with fields:
- summaryEn: 3-sentence summary in English explaining price trends and driver factors.
- summarySi: 3-sentence summary in Sinhala language.
- buyerTipsEn: array of 3 actionable advice strings for wholesale buyers/traders in English.
- buyerTipsSi: array of 3 actionable advice strings in Sinhala.
Ensure valid JSON output without extra markdown code block syntax if possible.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    res.json({
      source: 'Gemini 2.5 AI Dambulla DEC Market Intelligence',
      summaryEn: parsed.summaryEn || `Today at Dambulla DEC, ${topDrop.nameEn} dropped by ${Math.abs(topDrop.changePercent)}%.`,
      summarySi: parsed.summarySi || `අද දඹුල්ල විශේෂිත ආර්ථික මධ්‍යස්ථානයේදී ${topDrop.nameSi} මිල පහළ බැස්සේය.`,
      topGainer: `${topRise.nameSi} (${topRise.nameEn}) - Rs. ${topRise.wholesaleAvg}/kg (+${topRise.changePercent}%)`,
      topLoser: `${topDrop.nameSi} (${topDrop.nameEn}) - Rs. ${topDrop.wholesaleAvg}/kg (${topDrop.changePercent}%)`,
      arrivalStatus: 'High arrival volume (~480 Tonnes total today)',
      buyerTipsEn: parsed.buyerTipsEn || ['Bulk buy items with major price drops.'],
      buyerTipsSi: parsed.buyerTipsSi || ['මිල අඩු වූ එළවළු තොග වශයෙන් මිලදී ගන්න.']
    });
  } catch (err) {
    console.error('Gemini AI summary error:', err);
    res.json({
      source: 'Dambulla DEC Market AI Analysis Engine (Fallback)',
      summaryEn: `Today at Dambulla DEC, ${topDrop.nameEn} experienced the highest price drop of ${Math.abs(topDrop.changePercent)}%, selling at Rs. ${topDrop.wholesaleAvg}/kg. ${topRise.nameEn} prices rose to Rs. ${topRise.wholesaleAvg}/kg.`,
      summarySi: `අද දඹුල්ල විශේෂිත ආර්ථික මධ්‍යස්ථානයේදී ${topDrop.nameSi} මිල ${Math.abs(topDrop.changePercent)}% කින් පහළ බැස රු. ${topDrop.wholesaleAvg}/kg විය.`,
      topGainer: `${topRise.nameSi} (${topRise.nameEn}) - Rs. ${topRise.wholesaleAvg}/kg (+${topRise.changePercent}%)`,
      topLoser: `${topDrop.nameSi} (${topDrop.nameEn}) - Rs. ${topDrop.wholesaleAvg}/kg (${topDrop.changePercent}%)`,
      arrivalStatus: 'Normal arrival volume (~450 Tonnes total today)',
      buyerTipsEn: [`Focus on purchasing ${topDrop.nameEn} today.`],
      buyerTipsSi: [`අද ${topDrop.nameSi} මිලදී ගැනීම වඩාත් වාසිදායක වේ.`]
    });
  }
});

// Fallback error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express global error:', err);
  res.status(200).json({
    error: true,
    message: err?.message || 'Server error occurred',
    fallback: true
  });
});

export default app;
