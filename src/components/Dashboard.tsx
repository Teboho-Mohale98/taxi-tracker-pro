import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { dataStore } from '../store/DataStore';
import { formatCurrency, getStartOfWeek, getEndOfWeek, isServiceDue } from '../utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DashboardProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

export function Dashboard({ showNotification }: DashboardProps) {
  const [, forceUpdate] = useState(0);

  const weekStart = getStartOfWeek(new Date());
  const weekEnd = getEndOfWeek(weekStart);

  const activeDrivers = dataStore.drivers.filter(d => d.isActive);
  const serviceDueCount = activeDrivers.filter(d => isServiceDue(d.totalKm, d.lastServiceKm)).length;

  const weekEntries = dataStore.dailyEntries.filter(e => {
    const entryDate = new Date(e.date);
    return entryDate >= weekStart && entryDate <= weekEnd;
  });

  const weekMaintenance = dataStore.maintenance.filter(m => {
    const maintenanceDate = new Date(m.date);
    return maintenanceDate >= weekStart && maintenanceDate <= weekEnd;
  });

  const totalEarnings = weekEntries.reduce((sum, e) => sum + e.amountMade, 0);
  const totalFuel = weekEntries.reduce((sum, e) => sum + e.fuelCost, 0);
  const totalMaintenance = weekMaintenance.reduce((sum, m) => sum + m.cost, 0);
  const netProfit = totalEarnings - totalFuel - totalMaintenance;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const current = new Date(weekStart);
  const earnings = days.map(() => {
    const dayEntries = dataStore.dailyEntries.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate.toDateString() === current.toDateString();
    });
    const dayEarnings = dayEntries.reduce((sum, e) => sum + e.amountMade, 0);
    current.setDate(current.getDate() + 1);
    return dayEarnings;
  });

  const chartData = {
    labels: days,
    datasets: [{
      label: 'Daily Earnings (R)',
      data: earnings,
      backgroundColor: 'rgba(255, 215, 0, 0.6)',
      borderColor: 'rgba(255, 215, 0, 1)',
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value: string | number) => `R${value}` },
      },
    },
  };

  const serviceDueDrivers = activeDrivers.filter(d => isServiceDue(d.totalKm, d.lastServiceKm));

  const markAsServiced = (driverId: string) => {
    const drivers = dataStore.drivers;
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      driver.lastServiceKm = driver.totalKm;
      dataStore.drivers = [...drivers];
      forceUpdate(n => n + 1);
      showNotification('Vehicle marked as serviced!', 'success');
    }
  };

  return (
    <>
      <div className="screen-header">
        <h2>Dashboard</h2>
        <button className="refresh-btn" onClick={() => forceUpdate(n => n + 1)}>🔄 Refresh</button>
      </div>

      <div className="summary-cards">
        <div className="card stat-card">
          <div className="stat-label">Active Drivers</div>
          <div className="stat-value">{activeDrivers.length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Service Due</div>
          <div className="stat-value warning">{serviceDueCount}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Total Earnings</div>
          <div className="stat-value success">{formatCurrency(totalEarnings)}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Fuel Costs</div>
          <div className="stat-value">{formatCurrency(totalFuel)}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Maintenance</div>
          <div className="stat-value">{formatCurrency(totalMaintenance)}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Net Profit</div>
          <div className={`stat-value ${netProfit >= 0 ? 'success' : 'error'}`}>{formatCurrency(netProfit)}</div>
        </div>
      </div>

      <div className="card chart-card">
        <h3>Weekly Performance</h3>
        <Bar data={chartData} options={chartOptions} />
      </div>

      {serviceDueDrivers.length > 0 && (
        <div className="card">
          <h3>⚠️ Service Reminders</h3>
          {serviceDueDrivers.map(driver => (
            <div key={driver.id} className="service-reminder-item">
              <div className="service-reminder-header">
                <div className="reminder-info">
                  <h4>{driver.name} - {driver.taxiNumber}</h4>
                  <p>Service overdue! Total KM: {driver.totalKm.toLocaleString()} km</p>
                  <p>Last service: {driver.lastServiceKm.toLocaleString()} km</p>
                </div>
                <button className="mark-serviced-btn" onClick={() => markAsServiced(driver.id)}>
                  Mark Serviced
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
