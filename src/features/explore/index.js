import React, { useState } from 'react';
import { Timeline } from '../../components/Timeline';
import { EntityCard } from '../../components/EntityCard';
import { TagCard } from './components/TagCard';

const ExplorePage = () => {
  const [tab, setTab] = useState('posts');

  const renderContent = () => {
    switch (tab) {
      case 'people':
        return <Timeline endpoint="/api/v1/trending/accounts" component={EntityCard} />;
      case 'tags':
        return <Timeline endpoint="/api/v1/trending/tags" component={TagCard} />;
      default:
        return <Timeline endpoint="/api/v1/trending/statuses" />;
    }
  };

  return (
    <div className="explore-container">
      <div className="tabs">
        <button onClick={() => setTab('posts')}>Trending</button>
        <button onClick={() => setTab('people')}>People</button>
        <button onClick={() => setTab('tags')}>Tags</button>
      </div>
      {renderContent()}
    </div>
  );
};

export default ExplorePage;