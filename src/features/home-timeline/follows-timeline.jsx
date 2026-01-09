import { useEffect, useRef } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import useBoundStore from "../../stores/boundStore";
import PullToRefresh from '../../components/PullToRefresh';

const messages = defineMessages({
  title: { id: 'column.home', defaultMessage: 'Home' },
});

const FollowsTimeline = () => {
  const intl = useIntl();
  const features = useFeatures();

  const polling = useRef(null);

  const isPartial = useBoundStore(state => state.timelines.get('home')?.isPartial === true);
  const next = useBoundStore(state => state.timelines.get('home')?.next);

  const handleLoadMore = (maxId) => {
    useBoundStore.getState().timelines.expandFollowsTimeline({ url: next, maxId });
  };

  // Mastodon generates the feed in Redis, and can return a partial timeline
  // (HTTP 206) for new users. Poll until we get a full page of results.
  const checkIfReloadNeeded = () => {
    if (isPartial) {
      polling.current = setInterval(() => {
        useBoundStore.getState().timelines.expandFollowsTimeline();
      }, 3000);
    } else {
      stopPolling();
    }
  };

  const stopPolling = () => {
    if (polling.current) {
      clearInterval(polling.current);
      polling.current = null;
    }
  };

  const handleRefresh = () => {
    return useBoundStore.getState().timelines.expandFollowsTimeline();
  };

  useEffect(() => {
    checkIfReloadNeeded();

    return () => {
      stopPolling();
    };
  }, [isPartial]);

  return (
    <Column label={intl.formatMessage(messages.title)} withHeader={false} slim>
      <PullToRefresh onRefresh={handleRefresh}>
        <Timeline
          scrollKey='home_timeline'
          onLoadMore={handleLoadMore}
          timelineId='home'
          emptyMessage={
            <Stack space={1}>
              <Text size='xl' weight='medium' align='center'>
                <FormattedMessage
                  id='empty_column.home.title'
                  defaultMessage="You're not following anyone yet"
                />
              </Text>

              <Text theme='muted' align='center'>
                <FormattedMessage
                  id='empty_column.home.subtitle'
                  defaultMessage='{siteTitle} gets more interesting once you follow other users.'
                  values={{ siteTitle: instance.title }}
                />
              </Text>

              {features.federating && (
                <Text theme='muted' align='center'>
                  <FormattedMessage
                    id='empty_column.home'
                    defaultMessage='Or you can visit {public} to get started and meet other users.'
                    values={{
                      public: (
                        <Link to='/timeline/local' className='text-primary-600 hover:underline dark:text-primary-400'>
                          <FormattedMessage id='empty_column.home.local_tab' defaultMessage='the {site_title} tab' values={{ site_title: instance.title }} />
                        </Link>
                      ),
                    }}
                  />
                </Text>
              )}
            </Stack>
          }
        />
      </PullToRefresh>
    </Column>
  );
};


export default FollowsTimeline;