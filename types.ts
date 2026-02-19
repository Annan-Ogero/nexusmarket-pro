
export enum UserRole {
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER'
}

export type SubscriptionPlan = 'BASIC' | 'PRO' | 'ENTERPRISE';

export interface MarketStore {
  id: string;
  name: string;
  location: string;
  licenseKey: string;
  currency: string;
  status: 'ACTIVE' | 'SUSPENDED';
  plan: SubscriptionPlan;
  terminalCount: number;
  maxTerminals: number;
  subscriptionExpiry: string; // ISO String
  isTrialUsed: boolean;
}

export interface PerformanceMetrics {
  itemsPerMinute: number;
  accuracy: number; // 0-100
  customerSatisfaction: number; // 0-5
  totalTransactions: number;
  shiftSales: number;
  badges: string[];
  integrityScore: number; // 0-100 (AI calculated)
}

export interface User {
  id: string;
  storeId: string;
  name: string;
  role: UserRole;
  avatar: string;
  pin: string; // 6-digit secret PIN
  station?: string;
  metrics?: PerformanceMetrics;
}

export interface AuditEvent {
  type: 'SCAN' | 'VOID' | 'CANCEL_POST_TOTAL' | 'DRAWER_OPEN' | 'LOGIN';
  timestamp: string;
  details: string;
  riskWeight: number;
  cashierId: string;
}

export interface Transaction {
  id: string;
  storeId: string;
  timestamp: string;
  cashierId: string;
  cashierName: string;
  stationId: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    priceAtSale: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE';
  auditTrail: AuditEvent[];
}
