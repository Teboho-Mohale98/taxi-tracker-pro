import { useState } from 'react';
import type { Driver } from '../types';
import { dataStore } from '../store/DataStore';
import { generateId, isServiceDue, kmUntilService } from '../utils';

interface DriversProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

export function Drivers({ showNotification }: DriversProps) {
  const [drivers, setDrivers] = useState<Driver[]>(dataStore.drivers);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    taxiNumber: '',
    totalKm: 0,
    lastServiceKm: 0,
  });

  const activeDrivers = drivers.filter(d => d.isActive);

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const newDriver: Driver = {
      id: generateId(),
      ...formData,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [...drivers, newDriver];
    dataStore.drivers = updated;
    setDrivers(updated);
    setShowAddDialog(false);
    setFormData({ name: '', taxiNumber: '', totalKm: 0, lastServiceKm: 0 });
    showNotification('Driver added successfully!');
  };

  const handleEditDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;
    const updated = drivers.map(d =>
      d.id === editingDriver.id ? { ...d, ...formData } : d
    );
    dataStore.drivers = updated;
    setDrivers(updated);
    setShowEditDialog(false);
    setEditingDriver(null);
    showNotification('Driver updated successfully!');
  };

  const handleDeleteDriver = (id: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;
    const updated = drivers.map(d =>
      d.id === id ? { ...d, isActive: false } : d
    );
    dataStore.drivers = updated;
    setDrivers(updated);
    showNotification('Driver deleted successfully!');
  };

  const handleMarkServiced = (id: string) => {
    const updated = drivers.map(d =>
      d.id === id ? { ...d, lastServiceKm: d.totalKm } : d
    );
    dataStore.drivers = updated;
    setDrivers(updated);
    showNotification('Vehicle marked as serviced!');
  };

  const openEditDialog = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      taxiNumber: driver.taxiNumber,
      totalKm: driver.totalKm,
      lastServiceKm: driver.lastServiceKm,
    });
    setShowEditDialog(true);
  };

  return (
    <>
      <div className="screen-header">
        <h2>Drivers</h2>
        <button className="fab" onClick={() => setShowAddDialog(true)}>+ Add Driver</button>
      </div>

      <div className="drivers-list">
        {activeDrivers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p>No drivers added yet. Click "Add Driver" to get started.</p>
          </div>
        ) : (
          activeDrivers.map(driver => {
            const serviceDue = isServiceDue(driver.totalKm, driver.lastServiceKm);
            const kmLeft = kmUntilService(driver.totalKm, driver.lastServiceKm);

            return (
              <div key={driver.id} className="driver-card">
                {serviceDue && <div className="service-badge">Service Due</div>}
                <div className="driver-avatar">{driver.name.charAt(0).toUpperCase()}</div>
                <div className="driver-info">
                  <div className="driver-name">{driver.name}</div>
                  <div className="driver-details">Taxi: {driver.taxiNumber}</div>
                  <div className="driver-km">Total KM: {driver.totalKm.toLocaleString()} km</div>
                  <div className="driver-km" style={{ color: serviceDue ? 'var(--warning-color)' : 'var(--text-secondary)' }}>
                    {serviceDue ? 'Service overdue!' : `${Math.max(0, kmLeft).toFixed(0)} km until service`}
                  </div>
                </div>
                <div className="driver-actions">
                  {serviceDue && (
                    <button className="mark-serviced-btn" onClick={() => handleMarkServiced(driver.id)}>
                      Mark Serviced
                    </button>
                  )}
                  <button className="icon-btn" onClick={() => openEditDialog(driver)} title="Edit">✏️</button>
                  <button className="icon-btn" onClick={() => handleDeleteDriver(driver.id)} title="Delete">🗑️</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAddDialog && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Driver</h3>
              <button className="close-btn" onClick={() => setShowAddDialog(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddDriver}>
              <div className="form-group">
                <label>Driver Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Taxi Number</label>
                <input type="text" required value={formData.taxiNumber} onChange={e => setFormData({...formData, taxiNumber: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Total Kilometers</label>
                <input type="number" step="0.1" required value={formData.totalKm || ''} onChange={e => setFormData({...formData, totalKm: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="form-group">
                <label>Last Service KM</label>
                <input type="number" step="0.1" required value={formData.lastServiceKm || ''} onChange={e => setFormData({...formData, lastServiceKm: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddDialog(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditDialog && editingDriver && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Driver</h3>
              <button className="close-btn" onClick={() => setShowEditDialog(false)}>&times;</button>
            </div>
            <form onSubmit={handleEditDriver}>
              <div className="form-group">
                <label>Driver Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Taxi Number</label>
                <input type="text" required value={formData.taxiNumber} onChange={e => setFormData({...formData, taxiNumber: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Total Kilometers</label>
                <input type="number" step="0.1" required value={formData.totalKm || ''} onChange={e => setFormData({...formData, totalKm: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="form-group">
                <label>Last Service KM</label>
                <input type="number" step="0.1" required value={formData.lastServiceKm || ''} onChange={e => setFormData({...formData, lastServiceKm: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditDialog(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
