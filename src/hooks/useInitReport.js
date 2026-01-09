
import useBoundStore from '../stores/boundStore';
import { useGetState } from './useGetState';

/** TODO: support fully the 'ReportedEntity' type, for now only status is supported. */
export function useInitReport() {
  const getState = useGetState();
  const reports = useBoundStore((state) => state.reports);

  const initReport = (entityType, account, entities) => {
    const { statusId } = entities || {};

    if (!statusId) return;

    const status = getState().statuses.get(statusId);
    if (status) {
      reports.initReportAction(entityType, account, { status });
    }
  };

  return { initReport };
}
