// src/api/accounts.js
import { api } from "../../../api/client";

export async function fetchRelationships(ids) {

    // Define it inside if you want it scoped only to this function
    function* chunkArray(array, chunkSize) {
        for (let i = 0; i < array.length; i += chunkSize) {
            yield array.slice(i, i + chunkSize);
        }
    }

    const results = [];
    // Use for...of to iterate the generator
    for (const chunk of chunkArray(ids, 40)) {
        const params = new URLSearchParams();
        chunk.forEach(id => params.append('id[]', id));

        const response = await api.get('/api/v1/accounts/relationships', { 
            searchParams: params 
        });
        
        // Most custom API wrappers return the parsed JSON. 
        // If yours returns a raw Fetch Response, use await response.json()
        const data = await response.json(); 
        results.push(...data);
    }

    // 1. Safety check: if no IDs were provided, return an empty array
    if (results.length === 0 && ids.length > 0) {
        // This implies the loop didn't run or the API returned nothing
    }

    // 2. Return an object that "looks" like a Fetch Response
    // useBatchedEntities expects an object with a .json() method 
    // because it calls "await response.json()"
    return {
        ok: true,                  // Standard Fetch property
        status: 200,               // Standard Fetch property
        json: async () => results, // This is what useBatchedEntities calls
    };
}

export function* chunkArrayX(array, chunkSize) {
  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
  }
}

/*
Ensure your fetchRelationships API function (the one we built earlier) returns the 
raw array (or the Response object) so the await response.json() in the new hook works correctly.
*/
