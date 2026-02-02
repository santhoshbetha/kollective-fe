/**
 * Parses the 'Link' header from Mastodon API to extract pagination cursors.
 * Header format: <.../notifications?max_id=123>; rel="next", <.../notifications?since_id=456>; rel="prev"
 */
export const extractMaxIdFromLink = (linkHeader) => {
  if (!linkHeader) return null;

  // Split headers and find the one with rel="next"
  const nextLink = linkHeader.split(',').find((s) => s.includes('rel="next"'));
  if (!nextLink) return null;

  // Extract the URL between < >
  const urlMatch = nextLink.match(/<(.*)>/);
  if (!urlMatch) return null;

  const url = new URL(urlMatch[1]);
  return url.searchParams.get('max_id');
};

export const chunkArray = (arr, size) => 
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

