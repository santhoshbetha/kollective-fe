/*
    code for the EventMap component to see how to abstract OpenStreetMap 
    logic into a single reusable file. This component can be used in both the Event and Location features without
    adding any heavy dependencies.
*/
/*
    To keep the Event and Location features lean, you should abstract 
    the map logic so that it doesn't rely on heavy third-party React wrappers.
    Using a "lightweight" approach with Leaflet or a simple iframe 
    embed (like OpenStreetMap) is the best way to reduce bundle size.
*/

/**
 * A reusable Map component.
 * @param {Object} location - Includes lat, lon, and name.
 */
export const EventMap = ({ location }) => {
  if (!location?.lat || !location?.lon) return null;

  // We use the OpenStreetMap Export/Embed URL pattern
  const mapUrl = `https://www.openstreetmap.org{
    location.lon - 0.01},${location.lat - 0.01},${
    location.lon + 0.01},${location.lat + 0.01
  }&layer=mapnik&marker=${location.lat},${location.lon}`;

  return (
    <div className="map-container" style={{ width: '100%', height: '250px', borderRadius: '8px', overflow: 'hidden' }}>
      <iframe
        title={`Map of ${location.name}`}
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight="0"
        marginWidth="0"
        src={mapUrl}
        style={{ border: '1px solid #eee' }}
      />
      <div style={{ marginTop: '8px' }}>
        <a 
          href={`https://www.openstreetmap.org{location.lat}&mlon=${location.lon}#map=15/${location.lat}/${location.lon}`}
          target="_blank" 
          rel="noopener noreferrer"
          style={{ fontSize: '12px', color: '#6366f1' }}
        >
          View Larger Map
        </a>
      </div>
    </div>
  );
};

/*
By using this component, you can delete:

    src/features/event/components/Map.js
    src/features/event/components/LeafletWrapper.js
    Any redundant .css files for maps.
*/

/*
This component abstracts the map logic. By using an iframe, you avoid importing a 
massive JavaScript library for a simple "view-only" map, which is a common
Soapbox 3.0 performance strategy.
*/
