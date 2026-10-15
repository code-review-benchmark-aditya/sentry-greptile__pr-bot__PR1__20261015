import {lazy, Suspense, useState} from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {wrapCreateBrowserRouterV6} from '@sentry/react';

import {AppQueryClientProvider} from 'sentry/appQueryClient';
import {OnboardingContextProvider} from 'sentry/components/onboarding/onboardingContext';
import {ThemeAndStyleProvider} from 'sentry/components/themeAndStyleProvider';
import {USE_REACT_QUERY_DEVTOOL} from 'sentry/constants';
import {routes} from 'sentry/routes';
import {DANGEROUS_SET_REACT_ROUTER_6_HISTORY} from 'sentry/utils/browserHistory';

import {buildReactRouter6Routes} from './utils/reactRouter6Compat/router';

// The devtools (and the devtools runtime they depend on) are only ever useful
// when USE_REACT_QUERY_DEVTOOL is set, so they are loaded lazily: this keeps
// them out of the entry bundle and out of the production chunk.
const ReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools').then(module => ({
    default: module.ReactQueryDevtools,
  }))
);

function buildRouter(SentryHooksProvider?: React.ComponentType<React.PropsWithChildren>) {
  const sentryCreateBrowserRouter = wrapCreateBrowserRouterV6(createBrowserRouter);
  const router = sentryCreateBrowserRouter(
    buildReactRouter6Routes(routes(SentryHooksProvider))
  );
  DANGEROUS_SET_REACT_ROUTER_6_HISTORY(router);

  return router;
}

function Main(props: {
  SentryHooksProvider?: React.ComponentType<React.PropsWithChildren>;
}) {
  const [router] = useState(() => buildRouter(props.SentryHooksProvider));

  return (
    <AppQueryClientProvider>
      <ThemeAndStyleProvider>
        <OnboardingContextProvider>
          <RouterProvider router={router} />
        </OnboardingContextProvider>
        {USE_REACT_QUERY_DEVTOOL && (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
          </Suspense>
        )}
      </ThemeAndStyleProvider>
    </AppQueryClientProvider>
  );
}

export default Main;
