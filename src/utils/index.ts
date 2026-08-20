import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}

export function formatCurrency(amount: number): string {
  return `R ${parseFloat(String(amount)).toFixed(2)}`;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-ZA');
}

export function formatDateInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfWeek(startDate: Date): Date {
  const end = new Date(startDate);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function isServiceDue(totalKm: number, lastServiceKm: number): boolean {
  return (totalKm - lastServiceKm) >= 10000;
}

export function kmUntilService(totalKm: number, lastServiceKm: number): number {
  return 10000 - (totalKm - lastServiceKm);
}
