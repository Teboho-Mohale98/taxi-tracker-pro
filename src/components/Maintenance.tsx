import { useState } from 'react';
import type { MaintenanceRecord } from '../types';
import { dataStore } from '../store/DataStore';
import { generateId, formatCurrency, formatDate } from '../utils';

interface MaintenanceProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

export function Maintenance({ showNotification }: MaintenanceProps) {
  const [records, setRecords] = useState<MaintenanceRecord[]>(dataStore.maintenance);
  const [showDialog, setShowDialog] = useState(false);
  const drivers = dataStore.drivers.filter(d => d.isActive);

  const [formData, setFormData] = useState({
    taxiId: '',
    type: 'Brake Pads',
    cost: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const driver = drivers.find(d => d.id === formData.taxiId);
    if (!driver) {
      showNotification('Please select a taxi', 'error');
      return;
    }

    const newRecord: MaintenanceRecord = {
      id: generateId(),
      taxiId: driver.id,
      taxiNumber: driver.taxiNumber,
      type: formData.type,
      cost: formData.cost,
      date: formData.date,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    const updated = [...records, newRecord];
    dataStore.maintenance = updated;
    setRecords(updated);
    setShowDialog(false);
    setFormData({ taxiId: '', type: 'Brake Pads', cost: 0, date: new Date().toISOString().split('T')[0], notes: '' });
    showNotification('Maintenance record added successfully!');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this maintenance record?')) return;
    const updated = records.filter(r => r.id !== id);
    dataStore.maintenance = updated;
    setRecords(updated);
    showNotification('Maintenance record deleted successfully!');
  };

  // Group by month
  const grouped: Record<string, MaintenanceRecord[]> = {};
  records.forEach(m => {
    const date = new Date(m.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(m);
  });

  const sortedMonths = Object.keys(grouped).sort().reverse();

  return (
    <>
      <div className="screen-header">
        <h2>Maintenance</h2>
        <button className="fab" onClick={() => setShowDialog(true)}>+ Add Maintenance</button>
      </div>

      {records.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🔧</div>
            <p>No maintenance records yet. Click "Add Maintenance" to get started.</p>
          </div>
        </div>
      ) : (
        sortedMonths.map(monthKey => {
          const items = grouped[monthKey].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const monthTotal = items.reduce((sum, item) => sum + item.cost, 0);
          const [year, month] = monthKey.split('-');
          const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

          return (
            <div key={monthKey} className="card maintenance-group">
              <h3>{monthName}</h3>
              {items.map(item => (
                <div key={item.id} className="maintenance-item">
                  <div className="maintenance-header">
                    <span className="maintenance-type">{item.type} - {item.taxiNumber}</span>
                    <span className="maintenance-cost">{formatCurrency(item.cost)}</span>
                  </div>
                  <div className="maintenance-details">Date: {formatDate(item.date)}</div>
                  {item.notes && <div className="maintenance-details">Notes: {item.notes}</div>}
                  <button className="icon-btn" onClick={() => handleDelete(item.id)} title="Delete" style={{ marginTop: 10 }}>🗑️ Delete</button>
                </div>
              ))}
              <div className="monthly-total">Monthly Total: {formatCurrency(monthTotal)}</div>
            </div>
          );
        })
      )}

      {showDialog && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Maintenance</h3>
              <button className="close-btn" onClick={() => setShowDialog(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Taxi</label>
                <select required value={formData.taxiId} onChange={e => setFormData({...formData, taxiId: e.target.value})}>
                  <option value="">Select Taxi</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.taxiNumber} - {d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Maintenance Type</label>
                <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="Brake Pads">Brake Pads</option>
                  <option value="Rear Wheel Liners">Rear Wheel Liners</option>
                  <option value="Brake Fluid">Brake Fluid</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Tire Replacement">Tire Replacement</option>
                  <option value="Engine Service">Engine Service</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Cost (R)</label>
                <input type="number" step="0.01" required value={formData.cost || ''} onChange={e => setFormData({...formData, cost: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDialog(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
