// Action-only slice for composing statuses. No local state — only actions.
import { getFeatures } from "../../utils/features";

export function createComposeStatusSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    setComposeToStatus(status, rawText, spoilerText, contentType, withRedraft) {
      // 1. In your new Bound Store, all actions are spread onto the root.
      const actions = rootGet();
      
      // 2. Retrieve features/settings
      const { explicitAddressing } = getFeatures();

      // 3. Call the core composeSetStatus action directly from the root.
      // We no longer use root.compose.composeSetStatus.
      actions.composeSetStatus(
        'compose-modal',
        status,
        rawText,
        explicitAddressing,
        spoilerText,
        contentType,
        withRedraft
      );
    }
  };
}

export default createComposeStatusSlice;
