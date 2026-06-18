import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin } from "lucide-react";

// Fix for default Leaflet marker icons not showing in React
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export function EventsMap({ events, center = [51.505, -0.09] }) {
  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border shadow-sm">
      <MapContainer center={center} zoom={13} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {events.map((event) => (
          <Marker 
            key={event.id} 
            position={[event.latitude, event.longitude]} 
            icon={customIcon}
          >
            <Popup className="shadcn-popup">
              <div className="p-1 max-w-[200px]">
                <h3 className="font-bold text-sm leading-tight mb-1">{event.name}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <CalendarDays size={12} />
                  <span>{new Date(event.start_time).toLocaleDateString()}</span>
                </div>
                <Button size="sm" className="w-full h-7 text-xs">
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
