import { useState } from 'react';
import type { Screen } from '../types';
import { useNotification } from '../utils/useNotification';
import { Dashboard } from './Dashboard';
import { Drivers } from './Drivers';
import { DailyEntries } from './DailyEntries';
import { Maintenance } from './Maintenance';
import { Reports } from './Reports';
import { Notification } from './Notification';
import { BottomNav } from './BottomNav';

export function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const { notification, showNotification } = useNotification();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <Dashboard showNotification={showNotification} />;
      case 'drivers':
        return <Drivers showNotification={showNotification} />;
      case 'daily-entries':
        return <DailyEntries showNotification={showNotification} />;
      case 'maintenance':
        return <Maintenance showNotification={showNotification} />;
      case 'reports':
        return <Reports showNotification={showNotification} />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🚕 Taxi Tracker Pro</h1>
      </header>
      <main className="main-content">
        {renderScreen()}
      </main>
      <BottomNav activeScreen={activeScreen} onScreenChange={setActiveScreen} />
      {notification && <Notification message={notification.message} type={notification.type} />}
    </div>
  );
}
