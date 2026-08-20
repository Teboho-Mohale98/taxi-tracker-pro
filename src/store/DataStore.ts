import type { Driver, DailyEntry, MaintenanceRecord, WeeklyFee } from '../types';

class DataStore {
  private loadData<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }

  get drivers(): Driver[] {
    return this.loadData<Driver>('drivers');
  }

  set drivers(value: Driver[]) {
    this.saveData('drivers', value);
  }

  get dailyEntries(): DailyEntry[] {
    return this.loadData<DailyEntry>('dailyEntries');
  }

  set dailyEntries(value: DailyEntry[]) {
    this.saveData('dailyEntries', value);
  }

  get maintenance(): MaintenanceRecord[] {
    return this.loadData<MaintenanceRecord>('maintenance');
  }

  set maintenance(value: MaintenanceRecord[]) {
    this.saveData('maintenance', value);
  }

  get weeklyFees(): WeeklyFee[] {
    return this.loadData<WeeklyFee>('weeklyFees');
  }

  set weeklyFees(value: WeeklyFee[]) {
    this.saveData('weeklyFees', value);
  }
}

export const dataStore = new DataStore();
