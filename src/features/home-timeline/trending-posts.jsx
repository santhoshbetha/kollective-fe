import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import useBoundStore from "../../stores/boundStore";
import { useCommunityStream } from '../../api/streaming/useCommunityStream';

const TrendingPosts = () => {
  const settings = useSettings();
  const onlyMedia = settings.community.other.onlyMedia;
  //const next = useAppSelector(state => state.timelines.get('community')?.next);
  const next = useBoundStore.getState().timelines.get('community')?.next;

  const timelineId = 'community';

  const handleLoadMore = (maxId) => {
    useBoundStore.getState().timelines.expandCommunityTimeline({ url: next, maxId, onlyMedia });
  };

  const handleRefresh = () => {
    return useBoundStore.getState().timelines.expandCommunityTimeline({ onlyMedia });
  };

  useCommunityStream({ onlyMedia });

  useEffect(() => {
    useBoundStore.getState().timelines.expandCommunityTimeline({ onlyMedia });
  }, [onlyMedia]);

  return (
    <Column label={instance.domain} slim withHeader={false}>
      <PullToRefresh onRefresh={handleRefresh}>
        <Timeline
          className='black:p-4 black:sm:p-5'
          scrollKey={`${timelineId}_timeline`}
          timelineId={`${timelineId}${onlyMedia ? ':media' : ''}`}
          prefix='home'
          onLoadMore={handleLoadMore}
          emptyMessage={<FormattedMessage id='empty_column.community' 
            defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!' 
          />}
        />
      </PullToRefresh>
    </Column>
  );
};

export default TrendingPosts;
