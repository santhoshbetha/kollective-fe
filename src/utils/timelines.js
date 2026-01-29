import { getIn } from "./immutableSafe";

export const shouldFilter = (
  status,
  columnSettings,
) => {
   // 1. Create a plain object for the status states
  const shows = new Map({
    reblog: status.reblog !== null,
    reply: status.in_reply_to_id !== null,
    direct: status.visibility === 'direct',
  });

  // 2. Check if any of the status states should be filtered based on the column settings
 // return shows.some((value, key) => {
  //  return getIn(columnSettings, ['shows', key]) === false && value;
 // });

  // 2. Iterate over the object entries to check filters
  // columnSettings?.shows?.[key] replaces columnSettings.getIn(['shows', key])
  return Object.entries(shows).some(([key, isStatusType]) => {
    const isHiddenInSettings = columnSettings?.shows?.[key] === false;
    return isHiddenInSettings && isStatusType;
  });

};
