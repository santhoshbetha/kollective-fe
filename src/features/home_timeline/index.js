import { Timeline } from "../../components/Timeline";
import { useTimeline } from "../../hooks/useTimeline";

export const HomeTimeline = () => {
    const { items, isLoading, loadMore } = useTimeline('/api/v1/timelines/home');
    return (
        <Timeline items={items} isLoading={isLoading} onLoadMore={loadMore} />
    );
};