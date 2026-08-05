export type Language = 'si' | 'en';

export type VegetableCategory = 'upcountry' | 'lowcountry' | 'tubers_yams' | 'imported' | 'spices_other';

export interface VegetablePrice {
  id: string;
  nameEn: string;
  nameSi: string;
  category: VegetableCategory;
  imageUrl?: string;
  dambullaProductId?: number;
  wholesaleMin: number; // LKR per kg
  wholesaleMax: number; // LKR per kg
  wholesaleAvg: number; // LKR per kg
  retailEst: number;    // LKR per kg
  unit: string;
  previousAvg: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  grade: string;
  arrivalVolumeTonnes?: number;
}

export interface PriceHistoryPoint {
  date: string;
  wholesaleMin: number;
  wholesaleMax: number;
  wholesaleAvg: number;
  retailEst: number;
}

export interface VegetableHistoryReport {
  vegetable: VegetablePrice;
  history: PriceHistoryPoint[];
  dataSource?: string;
  isRealData?: boolean;
  stat7DayAvg: number;
  stat30DayAvg: number;
  stat30DayMin: number;
  stat30DayMax: number;
  volatilityRating: 'Low' | 'Moderate' | 'High';
  aiForecast: string;
  aiForecastSi: string;
}

export interface FitSMSConfig {
  apiToken: string;
  endpointMode: 'v4' | 'http';
  senderId: string;
  baseUrl: string;
}

export interface SMSAlertRule {
  id: string;
  phone: string;
  vegetableId: string;
  vegetableNameEn: string;
  vegetableNameSi: string;
  triggerType: 'below_price' | 'percentage_drop';
  targetPrice?: number;
  percentageDrop?: number;
  provider: 'fitsms' | 'dialog' | 'mobitel' | 'notifylk' | 'twilio' | 'webhook';
  language: Language;
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface SMSLog {
  id: string;
  phone: string;
  vegetableName: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  timestamp: string;
  provider: string;
  priceTriggered: number;
}

export interface MarketInsight {
  date: string;
  summaryEn: string;
  summarySi: string;
  topGainer: string;
  topLoser: string;
  arrivalStatus: string;
  buyerTipsEn: string[];
  buyerTipsSi: string[];
}
