export const GroupRelationshipRecord = {
  id: "",
  blocked_by: false,
  member: false,
  notifying: null,
  requested: false,
  muting: false,
  role: "user",
  pending_requests: false,
};

import { asPlain } from "../utils/immutableSafe";

export const normalizeGroupRelationship = (relationship) => {
  const raw = asPlain(relationship) || {};

  const normalized = {
    id: raw.id || raw._id || String(raw.id || "") || "",
    blocked_by: !!(raw.blocked_by || raw.blockedBy || raw.blocked),
    member: !!raw.member,
    notifying: raw.notifying !== undefined ? raw.notifying : null,
    requested: !!raw.requested,
    muting: !!raw.muting,
    role: raw.role || raw.position || "user",
    pending_requests: !!raw.pending_requests || !!raw.pendingRequests,
  };

  return Object.freeze({ ...GroupRelationshipRecord, ...normalized });
};

export default normalizeGroupRelationship;
