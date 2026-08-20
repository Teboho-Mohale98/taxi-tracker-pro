import { useState } from 'react';
import type { DailyEntry } from '../types';
import { dataStore } from '../store/DataStore';
import { generateId, formatCurrency, formatDate } from '../utils';

interface DailyEntriesProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

export function DailyEntries({ showNotification }: DailyEntriesProps) {
  const [entries, setEntries] = useState<DailyEntry[]>(dataStore.dailyEntries);
  const drivers = dataStore.drivers.filter(d => d.isActive);

  const [formData, setFormData] = useState({
    driverId: '',
    date: new Date().toISOString().split('T')[0],
    cashBrought: 0,
    amountMade: 0,
    fuelCost: 0,
    fuelType: 'petrol' as 'petrol' | 'diesel',
    notes: '',
  });

  const netProfit = formData.amountMade - formData.fuelCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const driver = drivers.find(d => d.id === formData.driverId);
    if (!driver) {
      showNotification('Please select a driver', 'error');
      return;
    }

    const newEntry: DailyEntry = {
      id: generateId(),
      driverId: driver.id,
      driverName: driver.name,
      taxiNumber: driver.taxiNumber,
      date: formData.date,
      cashBrought: formData.cashBrought,
      amountMade: formData.amountMade,
      fuelCost: formData.fuelCost,
      fuelType: formData.fuelType,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    const updated = [...entries, newEntry];
    dataStore.dailyEntries = updated;
    setEntries(updated);
    setFormData({
      driverId: '',
      date: new Date().toISOString().split('T')[0],
      cashBrought: 0,
      amountMade: 0,
      fuelCost: 0,
      fuelType: 'petrol',
      notes: '',
    });
    showNotification('Entry added successfully!');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    const updated = entries.filter(e => e.id !== id);
    dataStore.dailyEntries = updated;
    setEntries(updated);
    showNotification('Entry deleted successfully!');
  };

  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <>
      <div className="screen-header">
        <h2>Daily Entries</h2>
      </div>

      <div className="card form-card">
        <h3>Add Daily Entry</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Driver</label>
            <select required value={formData.driverId} onChange={e => setFormData({...formData, driverId: e.target.value})}>
              <option value="">Select Driver</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name} - {d.taxiNumber}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Cash Brought In (R)</label>
            <input type="number" step="0.01" required value={formData.cashBrought || ''} onChange={e => setFormData({...formData, cashBrought: parseFloat(e.target.value) || 0})} />
          </div>
          <div className="form-group">
            <label>Amount Made (R)</label>
            <input type="number" step="0.01" required value={formData.amountMade || ''} onChange={e => setFormData({...formData, amountMade: parseFloat(e.target.value) || 0})} />
          </div>
          <div className="form-group">
            <label>Fuel Cost (R)</label>
            <input type="number" step="0.01" required value={formData.fuelCost || ''} onChange={e => setFormData({...formData, fuelCost: parseFloat(e.target.value) || 0})} />
          </div>
          <div className="form-group">
            <label>Fuel Type</label>
            <select required value={formData.fuelType} onChange={e => setFormData({...formData, fuelType: e.target.value as 'petrol' | 'diesel'})}>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
            </select>
          </div>
          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Net Profit</label>
            <input type="text" readOnly value={formatCurrency(netProfit)} style={{ color: netProfit >= 0 ? 'var(--success-color)' : 'var(--error-color)' }} />
          </div>
          <button type="submit" className="btn btn-primary">Add Entry</button>
        </form>
      </div>

      <div className="card">
        <h3>Recent Entries</h3>
        {recentEntries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <p>No entries yet. Add your first daily entry above.</p>
          </div>
        ) : (
          recentEntries.map(entry => {
            const entryNetProfit = entry.amountMade - entry.fuelCost;
            return (
              <div key={entry.id} className="entry-item">
                <div className="entry-info">
                  <h4>{entry.driverName} - {entry.taxiNumber}</h4>
                  <div className="entry-details">Date: {formatDate(entry.date)}</div>
                  <div className="entry-details"><strong>Cash Brought In: {formatCurrency(entry.cashBrought)}</strong></div>
                  <div className="entry-details">Amount Made: {formatCurrency(entry.amountMade)} | Fuel: {formatCurrency(entry.fuelCost)} ({entry.fuelType})</div>
                  <div className="entry-details" style={{ color: entryNetProfit >= 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
                    Net Profit: {formatCurrency(entryNetProfit)}
                  </div>
                  {entry.notes && <div className="entry-details">Notes: {entry.notes}</div>}
                </div>
                <div className="entry-actions">
                  <button className="icon-btn" onClick={() => handleDelete(entry.id)} title="Delete">🗑️</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
