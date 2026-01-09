const mergeDefined = (oldVal, newVal) => {
  // If the newVal is defined (not null/undefined), use it; otherwise keep the old value.
  return newVal !== undefined && newVal !== null ? newVal : oldVal;
};

const normalizeUrls = (attachment) => {
  // Find the first available, truthy URL among the possible options
  const url =
    [attachment.url, attachment.preview_url, attachment.remote_url].find(
      (item) => item,
    ) || ""; // Fallback to an empty string

  // Create the 'base' object we want to merge in (equivalent to ImmutableMap base)
  const updates = {
    url: url,
    preview_url: url,
  };

  // Merge the existing attachment data with our new updates, using the 'mergeDefined' logic.
  // This ensures we only change 'url' and 'preview_url', keeping all other existing
  // properties from the original `attachment` object intact.
  const out = { ...attachment };
  for (const key of Object.keys(updates)) {
    out[key] = mergeDefined(out[key], updates[key]);
  }
  return out;
};

const getMetaCopy = (attachment) => {
  // Check if attachment.meta exists and is an object, then create a shallow copy
  if (
    attachment &&
    typeof attachment.meta === "object" &&
    attachment.meta !== null
  ) {
    const meta = { ...attachment.meta };
    return meta;
  }
  // Return a default empty object if 'meta' isn't present
  return {};
};

const normalizeMeta = (attachment) => {
  const meta = getMetaCopy(attachment);
  const out = { ...(attachment || {}) };
  out.meta = meta;
  return out;
};

export const normalizeAttachment = (attachment) => {
  // 1. We create a mutable copy to work with, mimicking the behavior of
  //    ImmutableMap(fromJS(attachment)) starting the normalization process.
  let normalizedObject = { ...(attachment || {}) };

  // 2. Run normalization steps and accept returned plain objects
  normalizedObject = normalizeUrls(normalizedObject) || normalizedObject;
  normalizedObject = normalizeMeta(normalizedObject) || normalizedObject;

  // 3. Return the final, normalized, plain JavaScript object.
  return normalizedObject;
};
