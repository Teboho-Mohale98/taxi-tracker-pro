export interface Driver {
  id: string;
  name: string;
  taxiNumber: string;
  totalKm: number;
  lastServiceKm: number;
  isActive: boolean;
  createdAt: string;
}

export interface DailyEntry {
  id: string;
  driverId: string;
  driverName: string;
  taxiNumber: string;
  date: string;
  cashBrought: number;
  amountMade: number;
  fuelCost: number;
  fuelType: 'petrol' | 'diesel';
  notes: string;
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  taxiId: string;
  taxiNumber: string;
  type: string;
  cost: number;
  date: string;
  notes: string;
  createdAt: string;
}

export interface WeeklyFee {
  id: string;
  weekStart: string;
  weekEnd: string;
  rankFee: number;
  notes: string;
  isApplied: boolean;
  createdAt: string;
}

export type Screen = 'dashboard' | 'drivers' | 'daily-entries' | 'maintenance' | 'reports';