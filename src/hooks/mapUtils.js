// React: mapUtils.js
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { 
  Utensils, 
  Laptop, 
  ShoppingBag, 
  HardHat, 
  Globe, 
  Hammer 
} from 'lucide-react';

/*
Custom Markers, you can use Leaflet's L.divIcon. This allows you to use Lucide-React icons (or any SVG) directly inside the map pins,
 making it easy to distinguish between a "Food" business and a "Tech" startup at a glance.

1. React: Define Category Icons
Create a mapping of your business categories to specific icons and colors. 
This keeps your map visually organized and consistent with your Business Category pills.
*/

const categoryConfig = {
  food_beverage: { icon: <Utensils size={18} />, color: '#EF4444' }, // Red
  technology: { icon: <Laptop size={18} />, color: '#3B82F6' },    // Blue
  retail: { icon: <ShoppingBag size={18} />, color: '#10B981' },  // Green
  construction: { icon: <HardHat size={18} />, color: '#F59E0B' }, // Amber
  online: { icon: <Globe size={18} />, color: '#8B5CF6' },        // Purple
  other: { icon: <Hammer size={18} />, color: '#6B7280' }         // Gray
};

export const createCustomIcon = (category) => {
  const config = categoryConfig[category] || categoryConfig.other;
  
  // Render the Lucide icon to an SVG string
  const iconHTML = renderToStaticMarkup(
    <div style={{ 
      backgroundColor: config.color,
      color: 'white',
      padding: '6px',
      borderRadius: '50%',
      border: '2px solid white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {config.icon}
    </div>
  );

  return L.divIcon({
    html: iconHTML,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Pointy end of the pin
    popupAnchor: [0, -32]
  });
};
