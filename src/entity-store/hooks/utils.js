function parseEntitiesPath(expandedPath) {
  const [entityType, ...listKeys] = expandedPath;
  const listKey = (listKeys || []).join(':');
  const path = [entityType, listKey];

  return {
    entityType,
    listKey,
    path,
  };
}

export { parseEntitiesPath };
