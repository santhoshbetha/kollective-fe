import { useEntities } from "../../entity-store/hooks/useEntities";
import { useApi } from "../../hooks/useApi";
import { useFeatures } from "../../hooks/useFeatures";
import { useOwnAccount } from "../../hooks/useOwnAccount";
import { groupSchema } from "../../schemas";

function usePendingGroups() {
  const api = useApi();
  const { account } = useOwnAccount();
  const features = useFeatures();

  const { entities, ...result } = useEntities(
    ['Groups', account?.id, 'pending'],
    () => api.get('/api/v1/groups', {
      searchParams: {
        pending: true,
      },
    }),
    {
      schema: groupSchema,
      enabled: !!account && features.groupsPending,
    },
  );

  return {
    ...result,
    groups: entities,
  };
}

export { usePendingGroups };