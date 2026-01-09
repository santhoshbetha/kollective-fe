// Lightweight zustand middleware for centralized error handling.
// Provides:
// - `handleError(err, meta)` to log and optionally surface errors to notifications
// - `wrapAsync(fn)` to wrap async functions so thrown/rejected errors are intercepted
// - exposes `errors` and `handleError` on the store API/state
import { HTTPError } from '../../api/HttpError.js';

const defaultNotify = (err) => {
  try {
    // Fallback lightweight in-app alert (non-blocking)
    if (typeof window !== 'undefined' && window?.console) {
      console.error('App error:', err);
    }
  } catch (e) {
    console.debug('defaultNotify error', e);
  }
};

export const errorsMiddleware = (config) => (set, get, api) => {
  /** Whether the action is considered a failure. */
  const isFailType = (type) => typeof type === 'string' && type.endsWith('_FAIL');

  /** Whether the action is a failure to fetch from browser storage. */
  const isRememberFailType = (type) => typeof type === 'string' && type.endsWith('_REMEMBER_FAIL');

  /** Whether the error contains an HTTP response. */
  const hasResponse = (error) => error instanceof HTTPError;

  /** Don't show 401's. */
  const authorized = (error) => error instanceof HTTPError && error.response && error.response.status !== 401;

  /** Whether the error should be shown to the user. */
  const shouldShowError = ({ type, skipAlert, error }) => {
    return !skipAlert && hasResponse(error) && authorized(error) && isFailType(type) && !isRememberFailType(type);
  };

  // Report an error. `meta` is optional extra context (could include action, route, etc.)
  const handleError = (err, meta = {}) => {
    try {
      // Allow custom reporters on global object (Sentry, etc.)
      if (typeof window !== 'undefined') {
        const reporter = window.__APP_ERROR_REPORTER__;
        if (reporter && typeof reporter === 'function') {
          try { reporter(err, meta); } catch (e) { console.error('reporter failed', e); }
        }
      }
      try {
        // `meta` may include an `action` object or be the action itself
        const action = meta?.action || meta;
        const show = shouldShowError({ type: action?.type, skipAlert: action?.skipAlert, error: err });
        if (show) {
            //TODO: add toast later
        }
      } catch (err) {
        console.debug('shouldShow/notifier check failed', err);
      }

      // Fallback console/report
      defaultNotify(err);
    } catch (err) {
      // log failures from error reporting itself
      console.error('handleError failed', err);
    }
  };

  // Wrap an async function so that thrown/rejected errors get reported
  const wrapAsync = (fn) => {
    if (typeof fn !== 'function') return fn;
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (err) {
        handleError(err, { args });
        throw err;
      }
    };
  };

  const extendedApi = { ...api, handleError, wrapAsync };

  const state = config(set, get, extendedApi) || {};

  return {
    ...state,
    // expose helpers on the state for convenience
    handleError,
    wrapAsync,
    errors: [],
  };
};

export default errorsMiddleware;
