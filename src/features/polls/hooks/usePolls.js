// src/features/polls/hooks/usePolls.js
import { useBatchedEntities } from "@/hooks/useBatchedEntities";
import { api } from "../../../api/client";
import { pollSchema } from "../../../schemas";

export function usePolls(pollIds) {
  //const api = useApi();
  
  return useBatchedEntities(
    ['poll'],
    pollIds,
    (ids) => api.get('/api/v1/polls/batch', { params: { ids } }),
    { 
       schema: pollSchema,
       refetchInterval: 30000 // Automatically refresh live polls every 30 seconds
    }
  );
}
