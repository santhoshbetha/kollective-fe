
import { useState } from 'react';
import { PullToRefreshify } from 'react-pull-to-refreshify';

function renderText(pullStatus, percent) {
    switch (pullStatus) {
        case "pulling":
            return (
                <div>
                    {`Pull down `}
                    <span style={{ color: "green" }}>{`${percent.toFixed(0)}%`}</span>
                </div>
            );

        case "canRelease":
            return "Release";

        case "refreshing":
            return "Loading...";

        case "complete":
            return "Refresh succeed";

        default:
            return "";
    }
}
/**
 * PullToRefresh:
 * Wrapper around a third-party PTR component with Soapbox defaults.
 */
const PullToRefresh = ({ children, onRefresh, ...rest }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    if (onRefresh) {
      return onRefresh();
    } else {
      // If not provided, do nothing
      return Promise.resolve();
    }
  };

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
        setRefreshing(false);
    }, 2000);
  }

  return (
    <PullToRefreshify
      refreshing={refreshing}
      onRefresh={handleRefresh}
      renderText={renderText}
      threshold={66}
      resistance={2}
      {...rest}
    >
      {/* This thing really wants a single JSX element as its child (TypeScript), so wrap it in one */}
      <>{children}</>
    </PullToRefreshify>
  );
};

export default PullToRefresh;
