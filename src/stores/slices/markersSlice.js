// Action-only slice for markers (marks users/statuses/items). No local state — only actions.

export function createMarkersSlice(setScoped, getScoped, rootSet, rootGet) {
  return {

    async fetchMarker(timeline) {
        try {
            const root = rootGet();
            const res = await fetch('/api/v1/markers', {
                method: 'POST',
                body: JSON.stringify({ searchParams: { timeline } }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) throw new Error(`Failed to fetch marker (${res.status})`);
            const marker = await res.json();
            root.notifications?.fetchorSaveMarker?.(marker);
            return marker;
        } catch (e) {
            // swallow any errors from best-effort fetch
        }
    },

    async saveMarker(marker) {
        try {
            const root = rootGet();
            const res = await fetch('/api/v1/markers', {
                method: 'POST',
                body: JSON.stringify(marker),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) throw new Error(`Failed to save marker (${res.status})`);
            const savedMarker = await res.json();
            root.notifications?.fetchorSaveMarker?.(savedMarker);
            return savedMarker;
        } catch (e) {
            console.error('markersSlice.saveMarker failed', e);
            return null;
        }
    }


    


    
 
    

    
  };
}

export default createMarkersSlice;
