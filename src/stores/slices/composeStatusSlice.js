// Action-only slice for composing statuses. No local state — only actions.
import { getFeatures } from "../../utils/features";

export function createComposeStatusSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    setComposeToStatus(status, rawText, spoilerText, contentType, withRedraft) {
        const root = rootGet();
        const { explicitAddressing } = getFeatures();

        root.compose.composeSetStatus(
            'compose-modal',
            status,
            rawText,
            explicitAddressing,
            spoilerText,
            contentType,
            withRedraft,
        );
    }
  };
}

export default createComposeStatusSlice;
