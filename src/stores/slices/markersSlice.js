// Action-only slice for markers (marks users/statuses/items). No local state — only actions.

export function createMarkersSlice(setScoped, getScoped, rootSet, rootGet) {

  return {

    async fetchMarker(timeline) {
      
      try {
        const res = await fetch('/api/v1/markers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timeline }) // Simplified: matching standard API expectations
        });

        if (!res.ok) throw new Error(`Failed to fetch marker (${res.status})`);
        
        const marker = await res.json();
        rootGet()?.fetchorSaveMarker?.(marker);
        return marker;
      } catch (e) {
        // Silent fail for best-effort fetch
        return null;
      }
    },

    async saveMarker(marker) {
      
      try {
        const res = await fetch('/api/v1/markers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(marker)
        });

        if (!res.ok) throw new Error(`Failed to save marker (${res.status})`);
        
        const savedMarker = await res.json();
        rootGet()?.fetchorSaveMarker?.(savedMarker);
        return savedMarker;
      } catch (e) {
        console.error('markersSlice.saveMarker failed', e);
        return null;
      }
    }
    
  };
}

export default createMarkersSlice;
