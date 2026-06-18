/*
Custom Markers, you can use Leaflet's L.divIcon. This allows you to use Lucide-React icons (or any SVG) directly inside the map pins,
 making it easy to distinguish between a "Food" business and a "Tech" startup at a glance.

2. Update the Map Component
Pass the category to the createCustomIcon function inside your Marker loop.
*/
// React: BusinessMap.js
import { createCustomIcon } from './mapUtils';

const BusinessMap = ({ businesses, userLocation }) => {
  return (
    <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={11}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {businesses.map(biz => (
        <Marker 
          key={biz.id} 
          position={biz.coordinates}
          icon={createCustomIcon(biz.category)} // Dynamic Icon
        >
          <Popup>
            <div className="font-bold">{biz.name}</div>
            <div className="text-xs uppercase">{biz.category}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

/*
Why this is a Discovery Win:

    Instant Recognition: Users can scan the 60-mile radius map and immediately spot Food vs. Tech clusters without clicking every pin.
    High Quality: Using Lucide-React icons via renderToStaticMarkup ensures your pins stay crisp on high-resolution mobile screens.
    Visual Discovery: A high density of "Tech" markers in a specific Federal District can signal a burgeoning local tech hub, encouraging more local investment. 
*?

