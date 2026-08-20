import type { Screen } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

const navItems: { screen: Screen; icon: string; label: string }[] = [
  { screen: 'dashboard', icon: '📊', label: 'Dashboard' },
  { screen: 'drivers', icon: '👥', label: 'Drivers' },
  { screen: 'daily-entries', icon: '📝', label: 'Daily Entry' },
  { screen: 'maintenance', icon: '🔧', label: 'Maintenance' },
  { screen: 'reports', icon: '📈', label: 'Reports' },
];

export function BottomNav({ activeScreen, onScreenChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.screen}
          className={`nav-item ${activeScreen === item.screen ? 'active' : ''}`}
          onClick={() => onScreenChange(item.screen)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
