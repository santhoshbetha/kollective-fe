// src/features/accounts/hooks/useDomainBlocks.js
import { useBatchedEntities } from "@/hooks/useBatchedEntities";
import { api } from "../api/client";

export function useDomainBlocks(domains) {
  //const api = useApi();
  
  return useBatchedEntities(
    ['domainBlock'], // Global path in cache
    domains,
    (missingDomains) => api.get('/api/v1/domain_blocks', { params: { domains: missingDomains } }),
    { staleTime: 1000 * 60 * 60 } // Domains don't change often, cache for 1 hour
  );
}
