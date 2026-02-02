import { useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// /"Automatic OLED Mode"
// /Create src/features/settings/hooks/useBatterySaver.js.
//  This hook listens for battery changes and overrides the theme if autoOled is enabled.
export const useBatterySaver = () => {
  const { theme, autoOled, setTheme } = useSettingsStore();

  useEffect(() => {
    if (!autoOled || !('getBattery' in navigator)) return;

    let batteryInstance;

    const checkBattery = (battery) => {
      // Logic: If battery < 20% and not charging, force OLED
      if (battery.level <= 0.20 && !battery.charging && theme !== 'oled') {
        setTheme('oled');
      }
    };

    navigator.getBattery().then((battery) => {
      batteryInstance = battery;
      checkBattery(battery);
      
      battery.addEventListener('levelchange', () => checkBattery(battery));
      battery.addEventListener('chargingchange', () => checkBattery(battery));
    });

    return () => {
      if (batteryInstance) {
        batteryInstance.removeEventListener('levelchange', () => checkBattery(batteryInstance));
        batteryInstance.removeEventListener('chargingchange', () => checkBattery(batteryInstance));
      }
    };
  }, [autoOled, theme, setTheme]);
};

/*
function App() {
  useBatterySaver(); // Monitor battery for OLED switching

  const theme = useSettingsStore((s) => s.theme);

  return (
    <div className={`app-root theme-${theme}`}>
      <Routes />
    </div>
  );

  .theme-oled {
  --bg-color: #000000;
  --text-color: #ffffff;
  --accent-color: #1DA1F2;
  --card-bg: #0a0a0a;
}

*/
