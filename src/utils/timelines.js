import { getIn } from "./immutableSafe";

export const shouldFilter = (
  status,
  columnSettings,
) => {
  const shows = new Map({
    reblog: status.reblog !== null,
    reply: status.in_reply_to_id !== null,
    direct: status.visibility === 'direct',
  });
  return shows.some((value, key) => {
    return getIn(columnSettings, ['shows', key]) === false && value;
  });
};
