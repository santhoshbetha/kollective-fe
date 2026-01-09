import { isIntegerId } from "./numbers";

/** Get the initial visibility of media attachments from user settings. */
export const defaultMediaVisibility = (
  status,
  displayMedia,
) => {
  if (!status) return false;
  status = getActualStatus(status);

  const isUnderReview = status.visibility === 'self';

  if (isUnderReview) {
    return false;
  }

  return (displayMedia !== 'hide_all' && !status.sensitive || displayMedia === 'show_all');
};

/** Grab the first external link from a status. */
export const getFirstExternalLink = (status) => {
  try {
    // Pulled from Pleroma's media parser
    const selector = 'a:not(.mention,.hashtag,.attachment,[rel~="tag"])';
    const element = document.createElement('div');
    element.innerHTML = status.content;
    return element.querySelector(selector);
  } catch {
    return null;
  }
};

/** Whether the status is expected to have a Card after it loads. */
export const shouldHaveCard = (status) => {
  return Boolean(getFirstExternalLink(status));
};

/** Whether the media IDs on this status have integer IDs (opposed to FlakeIds). */
// https://gitlab.com/soapbox-pub/soapbox/-/merge_requests/1087
export const hasIntegerMediaIds = (status) => {
  if (!status || !status.media_attachments) return false;
  try {
    const arr = Array.isArray(status.media_attachments)
      ? status.media_attachments
      : (status.media_attachments.toJS ? status.media_attachments.toJS() : Array.from(status.media_attachments || []));
    return arr.some((m) => isIntegerId(m && m.id));
  } catch {
    return false;
  }
};

/** Sanitize status text for use with screen readers. */
export const textForScreenReader = (
  intl,
  status,
  rebloggedByText,
) => {
  const { account } = status;
  if (!account || typeof account !== 'object') return '';

  const displayName = (account.display_name || '');
  const acctName = (account.acct || '').split('@')[0];

  const spoiler = (status && typeof status.spoiler_text === 'string') ? status.spoiler_text : '';
  const searchIndex = (status && typeof status.search_index === 'string') ? status.search_index : '';
  const snippet = (spoiler && status && status.hidden) ? spoiler : searchIndex.slice(spoiler.length || 0);

  const created = (status && status.created_at && intl && typeof intl.formatDate === 'function')
    ? intl.formatDate(status.created_at, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
    : '';

  const values = [
    displayName.length === 0 ? acctName : displayName,
    snippet || '',
    created,
    account.acct || '',
  ];

  if (rebloggedByText) {
    values.push(rebloggedByText);
  }

  return values.join(', ');
};

/** Get reblogged status if any, otherwise return the original status. */
export const getActualStatus = (status) => {
  if (status?.reblog && typeof status?.reblog === 'object') {
    return status.reblog;
  } else {
    return status;
  }
};
