/*
 "Clustering" so that if there are 50 pins in one city, they appear as a single "50" bubble until the user zooms in?

 1. Installation
Install the required clustering library for React-Leaflet:
npm install @changey/react-leaflet-markercluster.

2. Implementation in React
Wrap your existing Marker loop inside the <MarkerClusterGroup /> component. This automatically detects markers that
 are close to each other and consolidates them into a single bubble.
*/
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';

const BusinessMap = ({ businesses, userLocation }) => {
  return (
    <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={11}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* 1. Wrap markers in a cluster group */}
      <MarkerClusterGroup
        chunkedLoading // Improves performance for 1000+ pins
        maxClusterRadius={50} // Distance in pixels before clustering
      >
        {businesses.map(biz => (
          <Marker 
            key={biz.id} 
            position={biz.coordinates}
            icon={createCustomIcon(biz.category)}
          >
            <Popup>{biz.name}</Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

/*
3. Customizing the Cluster Bubble
You can customize the appearance of the cluster bubble (the "bubble") using the iconCreateFunction. This allows you to style the count 
bubble to match your app's brand, such as using a blue circle with a white number.
*/
const createClusterIcon = (cluster) => {
  return L.divIcon({
    html: `<div class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 border-white shadow-lg">
             ${cluster.getChildCount()}
           </div>`,
    className: 'custom-cluster-icon',
    iconSize: [32, 32]
  });
};

// Usage
<MarkerClusterGroup iconCreateFunction={createClusterIcon}>
  {/* markers... */}
</MarkerClusterGroup>

/*
Why this is a Discovery Powerhouse:

    Reduced Clutter: Instead of a "sea of pins" in high-density areas like your City or Federal District, users see clear clusters of activity.
    Performance: chunkedLoading prevents the React UI from freezing when rendering hundreds of local businesses simultaneously.
    Intuitive Navigation: Clicking a cluster automatically zooms the map to fit all the markers within that group, providing a fluid exploration experience. 

Final System Review:
You have now built a high-performance Local Economy Engine:

    Backend: PostGIS radius search (60 miles) + Legislative District matching.
    UI: React Dynamic Cards (Physical vs. Online) + Interactive Map.
    Performance: Marker Clustering + Custom Category Icons.
*/

