import { Suspense } from 'react';
import { Route, Routes, useRouteMatch } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import useBoundStore from "../../stores/boundStore";
import { Tabs } from "@/components/ui/tabs"

const HomeTimeline = () => {
  const match = useRouteMatch();
  const notifications = useBoundStore((state) => state.notificationsTab);

  return (
    <>
      <div className='sticky top-11 z-50 bg-white black:bg-black dark:bg-primary-900 lg:top-0'>
        <Tabs
          items={[
            {
              to: '/',
              name: '/',
              text: <FormattedMessage id='tabs_bar.follows' defaultMessage='Follows' />,
              notification: notifications.home,
            },
            {
              to: '/trending/posts',
              name: '/trending/posts',
              text: <div className='block max-w-xs truncate'>Trending Posts</div>,
              notification: notifications.instance,
            },
            {
              to: '/trending/voices',
              name: '/trending/voices',
              text: <div className='block max-w-xs truncate'>Trending Voices</div>,
              notification: notifications.instance,
            },
          ]}
          activeItem={match.path}
        />
      </div>

      <Suspense fallback={<div className='p-4 text-center'><FormattedMessage id='loading_indicator.label' defaultMessage='Loading…' /></div>}>
        <Routes>
          <Route path='/' exact component={FollowsTimeline} />
          <Route path='/trending/posts' exact component={TrendingPosts} />
          <Route path='/trending/voices' exact component={TrendingVoices} />
        </Routes>
      </Suspense>
    </>
  );
};

export default HomeTimeline;