import { queryClient } from "../queries/client";

const isEntity = (object) => {
  return object && typeof object === 'object' && 'id' in object;
};

/** Deduplicate an array of entities by their ID. */
const deduplicateById = (entities) => {
  const map = entities.reduce((result, entity) => {
    return result.set(entity.id, entity);
  }, new Map());

  return Array.from(map.values());
};

/** Flatten paginated results into a single array. */
const flattenPages = (queryData) => {
  const data = queryData?.pages.reduce(
    (prev, curr) => [...prev, ...curr.result],
    [],
  );

  if (data && data.every(isEntity)) {
    return deduplicateById(data);
  } else if (data) {
    return data;
  }
};

/** Traverse pages and update the item inside if found. */
const updatePageItem = (queryKey, newItem, isItem) => {
  queryClient.setQueriesData({ queryKey }, (data) => {
    if (data) {
      const pages = data.pages.map(page => {
        const result = page.result.map(item => isItem(item, newItem) ? newItem : item);
        return { ...page, result };
      });
      return { ...data, pages };
    }
  });
};

/** Insert the new item at the beginning of the first page. */
const appendPageItem = (queryKey, newItem) => {
  queryClient.setQueryData(queryKey, (data) => {
    if (data) {
      const pages = [...data.pages];
      pages[0] = { ...pages[0], result: [newItem, ...pages[0].result] };
      return { ...data, pages };
    }
  });
};

/** Remove an item inside if found. */
const removePageItem = (queryKey, itemToRemove, isItem) => {
  queryClient.setQueriesData({ queryKey }, (data) => {
    if (data) {
      const pages = data.pages.map(page => {
        const result = page.result.filter(item => !isItem(item, itemToRemove));
        return { ...page, result };
      });
      return { ...data, pages };
    }
  });
};

const paginateQueryData = (array) => {
  return array?.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / 20);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);
};

const sortQueryData = (queryKey, comparator) => {
  queryClient.setQueryData(queryKey, (prevResult) => {
    if (prevResult) {
      const nextResult = { ...prevResult };
      const flattenedQueryData = flattenPages(nextResult);
      const sortedQueryData = flattenedQueryData?.sort(comparator);
      const paginatedPages = paginateQueryData(sortedQueryData);
      const newPages = paginatedPages.map((page, idx) => ({
        ...prevResult.pages[idx],
        result: page,
      }));

      nextResult.pages = newPages;
      return nextResult;
    }
  });
};

export {
  flattenPages,
  updatePageItem,
  appendPageItem,
  removePageItem,
  sortQueryData,
};
