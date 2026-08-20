import { useState } from 'react';
import { dataStore } from '../store/DataStore';
import { formatCurrency, formatDate, getStartOfWeek, getEndOfWeek } from '../utils';

interface ReportsProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

export function Reports({ showNotification }: ReportsProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getStartOfWeek(new Date()));

  const weekEnd = getEndOfWeek(currentWeekStart);
  const activeDrivers = dataStore.drivers.filter(d => d.isActive);

  const weekEntries = dataStore.dailyEntries.filter(e => {
    const entryDate = new Date(e.date);
    return entryDate >= currentWeekStart && entryDate <= weekEnd;
  });

  const weekMaintenance = dataStore.maintenance.filter(m => {
    const maintenanceDate = new Date(m.date);
    return maintenanceDate >= currentWeekStart && maintenanceDate <= weekEnd;
  });

  const totalCashBrought = weekEntries.reduce((sum, e) => sum + (e.cashBrought || 0), 0);
  const totalEarnings = weekEntries.reduce((sum, e) => sum + e.amountMade, 0);
  const totalFuel = weekEntries.reduce((sum, e) => sum + e.fuelCost, 0);
  const totalMaintenance = weekMaintenance.reduce((sum, m) => sum + m.cost, 0);
  const netProfit = totalEarnings - totalFuel - totalMaintenance;

  const previousWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getStartOfWeek(new Date()));
  };

  const exportToCSV = () => {
    if (weekEntries.length === 0) {
      showNotification('No data to export for this week', 'error');
      return;
    }

    const csvContent = [
      ['Driver Name', 'Taxi Number', 'Date', 'Cash Brought In', 'Amount Made', 'Fuel Cost', 'Fuel Type', 'Net Profit', 'Notes'],
      ...weekEntries.map(e => [
        e.driverName,
        e.taxiNumber,
        formatDate(e.date),
        String(e.cashBrought || 0),
        String(e.amountMade),
        String(e.fuelCost),
        e.fuelType,
        String(e.amountMade - e.fuelCost),
        e.notes || '',
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taxi-tracker-report-${formatDate(currentWeekStart)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification('CSV exported successfully!');
  };

  return (
    <>
      <div className="screen-header">
        <h2>Weekly Reports</h2>
      </div>

      <div className="card week-selector">
        <button onClick={previousWeek}>◀ Previous</button>
        <span>{formatDate(currentWeekStart)} - {formatDate(weekEnd)}</span>
        <button onClick={nextWeek}>Next ▶</button>
        <button onClick={goToCurrentWeek}>Current Week</button>
      </div>

      <div className="card">
        <h3>Weekly Summary</h3>
        <div className="summary-row">
          <span className="summary-label">Total Cash Brought In:</span>
          <span className="summary-value" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{formatCurrency(totalCashBrought)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Total Earnings:</span>
          <span className="summary-value" style={{ color: 'var(--success-color)' }}>{formatCurrency(totalEarnings)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Total Fuel:</span>
          <span className="summary-value">{formatCurrency(totalFuel)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Total Maintenance:</span>
          <span className="summary-value">{formatCurrency(totalMaintenance)}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Net Profit:</span>
          <span className="summary-value" style={{ color: netProfit >= 0 ? 'var(--success-color)' : 'var(--error-color)' }}>{formatCurrency(netProfit)}</span>
        </div>
      </div>

      <div className="card">
        <h3>Driver Performance</h3>
        {activeDrivers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p>No drivers to display.</p>
          </div>
        ) : (
          activeDrivers.map(driver => {
            const driverEntries = weekEntries.filter(e => e.driverId === driver.id);
            const daysWorked = new Set(driverEntries.map(e => e.date)).size;
            const driverCashBrought = driverEntries.reduce((sum, e) => sum + (e.cashBrought || 0), 0);
            const driverEarnings = driverEntries.reduce((sum, e) => sum + e.amountMade, 0);
            const driverFuel = driverEntries.reduce((sum, e) => sum + e.fuelCost, 0);
            const driverNet = driverEarnings - driverFuel;
            const avgPerDay = daysWorked > 0 ? driverEarnings / daysWorked : 0;

            return (
              <details key={driver.id} className="driver-performance">
                <summary className="driver-header">
                  <div className="driver-header-info">
                    <h4>{driver.name} - {driver.taxiNumber}</h4>
                    <p>Cash Brought: {formatCurrency(driverCashBrought)} | Days: {daysWorked} | Net: {formatCurrency(driverNet)}</p>
                  </div>
                </summary>
                <div className="driver-details-content">
                  <div className="detail-row">
                    <span>Total Cash Brought In:</span>
                    <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{formatCurrency(driverCashBrought)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Total Earnings:</span>
                    <span style={{ color: 'var(--success-color)' }}>{formatCurrency(driverEarnings)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Total Fuel:</span>
                    <span>{formatCurrency(driverFuel)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Net Profit:</span>
                    <span style={{ color: driverNet >= 0 ? 'var(--success-color)' : 'var(--error-color)' }}>{formatCurrency(driverNet)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Days Worked:</span>
                    <span>{daysWorked}</span>
                  </div>
                  <div className="detail-row">
                    <span>Average per Day:</span>
                    <span>{formatCurrency(avgPerDay)}</span>
                  </div>
                </div>
              </details>
            );
          })
        )}
      </div>

      <div className="export-buttons">
        <button className="btn btn-secondary" onClick={exportToCSV}>📊 Export to CSV</button>
      </div>
    </>
  );
}
