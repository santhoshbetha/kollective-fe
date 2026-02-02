import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

//Domain Metadata Tooltips
//This hook fetches metadata for a remote domain.
export const useRemoteInstance = (domain) => {
  return useQuery({
    queryKey: ['instance', 'remote', domain],
    queryFn: async () => {
      // We hit the V2 instance endpoint of the remote domain
      const { data } = await axios.get(`https://${domain}/api/v2/instance`);
      return data;
    },
    enabled: !!domain,
    staleTime: 1000 * 60 * 60, // Cache instance info for 1 hour
    retry: 1, // Only retry once as remote instances might be down
  });
};

/*
// src/features/filters/components/DomainTooltip.jsx
import * as Tooltip from '@://radix-ui.com';
import { useRemoteInstance } from '@/features/instance/api/useRemoteInstance';

export const DomainTooltip = ({ domain, children }) => {
  const { data, isLoading, isError } = useRemoteInstance(domain);

  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={400}>
        <Tooltip.Trigger asChild>
          <span className="cursor-help border-b border-dotted border-gray-400">
            {children}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Content className="bg-white p-3 shadow-lg rounded-md border text-sm max-w-xs">
          {isLoading && <p className="animate-pulse">Loading instance info...</p>}
          {isError && <p className="text-red-500">Could not reach {domain}</p>}
          {data && (
            <div className="space-y-1">
              <h4 className="font-bold text-blue-600">{data.title}</h4>
              <p className="text-xs line-clamp-3 text-gray-600">{data.description}</p>
              <div className="flex justify-between pt-2 border-t text-[10px] text-gray-400">
                <span>Version: {data.version}</span>
                <span>Users: {data.usage?.users?.active_month?.toLocaleString()}</span>
              </div>
            </div>
          )}
          <Tooltip.Arrow className="fill-white" />
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

*/