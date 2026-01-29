import { Suspense, useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Route, useLocation, useParams } from 'react-router-dom';

import Layout from '../../../components/Layout.jsx';

import ColumnLoading from '../../../components/ColumnLoading.jsx';
import ErrorColumn from '../../../components/ErrorColumn.jsx';

//san this
const WrappedRoute = ({
  component: _Component,
  page: _Page,
  content,
  componentParams = {},
  layout,
  _publicRoute = false,
  _staffOnly = false,
  _adminOnly = false,
  _developerOnly = false
}) => {
  const params = useParams();

  const Page = _Page;
  const Component = _Component;

 const renderComponent = () => (
    <ErrorBoundary FallbackComponent={FallbackError}>
      <Suspense fallback={<FallbackLoading />}>
        <Page params={params} layout={layout} {...componentParams}>
          {Component ? (
            <Component params={params} {...componentParams}>
              {content}
            </Component>
          ) : (
            content
          )}
        </Page>
      </Suspense>
    </ErrorBoundary>
  );

  return renderComponent();
};

const FallbackLayout = ({ children }) => (
  <>
    <Layout.Main>
      {children}
    </Layout.Main>

    <Layout.Aside />
  </>
);

const FallbackLoading = () => (
  <FallbackLayout>
    <ColumnLoading />
  </FallbackLayout>
);

const FallbackError = ({ error, resetErrorBoundary }) => {
  const location = useLocation();
  const firstUpdate = useRef(true);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
    } else {
      resetErrorBoundary();
    }
  }, [location, resetErrorBoundary]);

  return (
    <FallbackLayout>
      <ErrorColumn error={error} onRetry={resetErrorBoundary} />
    </FallbackLayout>
  );
};

export {
  WrappedRoute,
};
