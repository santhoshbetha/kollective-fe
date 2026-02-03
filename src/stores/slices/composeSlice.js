// import update from 'lodash/fp/update';
// Import only the specific function from lodash you need for efficiency
import _update from "lodash/update";
import throttle from "lodash/throttle";
import * as AttachmentNormalizer from "../../normalizers/attachment.js";
import { htmlToPlaintext } from "../../utils/html.js";
import { asPlain, getProp, asArray, getIn, setIn } from "../../utils/immutableSafe.js";
import { getFeatures } from "../../utils/features.js";
import { selectOwnAccount, selectAccount } from "../../selectors/index.js";
import tagHistory from "../../settings.js";
import { isLoggedIn } from "../../utils/auth.js";
import emojiSearch from "../../features/emoji/search.js";
import { isNativeEmoji } from "../../features/emoji/index.js";

const getResetFileKey = () => Math.floor(Math.random() * 0x10000);

const statusToTextMentions = (status, account) => {
  // Plain-JS implementation to build a mentions string like "@bob @alice "
  const author = (status && status.account && status.account.acct) || "";
  const accountAcct = account?.acct || "";

  const mentions = Array.isArray(status?.mentions)
    ? status.mentions.map((m) => m.acct)
    : [];

  const combined = [author, ...mentions].filter(
    (acct) => acct && acct !== accountAcct,
  );
  const deduped = Array.from(new Set(combined));
  const text = deduped.map((m) => `@${m} `).join("");
  return text; // strings are immutable in JS
};

const statusToMentionsArray = (status, account) => {
  // Plain-JS implementation: extract author and mentions from plain objects
  const author = (status && status.account && status.account.acct) || "";
  const accountAcct = account?.acct || "";

  const mentions = Array.isArray(status?.mentions)
    ? status.mentions.map((m) => m.acct)
    : [];

  const combined = [author, ...mentions].filter(
    (acct) => acct && acct !== accountAcct,
  );
  const deduped = Array.from(new Set(combined));
  return Object.freeze(deduped);
};

// Replaces statusToTextMentions & statusToMentionsArray
const getMentionsData = (status, account) => {
  const author = status?.account?.acct || "";
  const myAcct = account?.acct || "";
  
  const mentions = (status?.mentions || []).map(m => m.acct);
  const deduped = [...new Set([author, ...mentions])].filter(a => a && a !== myAcct);
  
  return {
    array: deduped,
    text: deduped.map(m => `@${m} `).join("")
  };
};

const privacyPreference = (a, b) => {
  const order = ["public", "unlisted", "private", "direct"];

  if (a === "group") return a;

  return order[Math.max(order.indexOf(a), order.indexOf(b), 0)];
};

const domParser = new DOMParser();

// Shared defensive helpers imported from `utils/immutableSafe`.

const expandMentions = (status) => {
  // Use safe getters to support Immutable Maps or plain objects
  const contentHTML = getProp(status, "content") || "";
  const fragment = domParser.parseFromString(
    contentHTML,
    "text/html",
  ).documentElement;

  const mentions = asArray(getProp(status, "mentions"));

  mentions.forEach((mention) => {
    const mentionUrl = getProp(mention, "url") || mention.url;
    const mentionAcct = getProp(mention, "acct") || mention.acct;

    const node = fragment.querySelector(`a[href="${mentionUrl}"]`);

    if (node) {
      node.textContent = `@${mentionAcct}`;
    }
  });

  return fragment.innerHTML;
};

const getExplicitMentions = (me, status) => {
  // We access properties using standard dot notation
  const fragment = domParser.parseFromString(
    getProp(status, "content") || "",
    "text/html",
  ).documentElement;

  // Accept Immutable-like collections for mentions and coerce to array
  const mentionsList = asArray(getProp(status, "mentions") || getProp(status, "mentions") || status.mentions);

  const mentions = mentionsList
    .filter((mention) => {
      const url = getProp(mention, "url") || mention.url;
      const id = getProp(mention, "id") || mention.id;
      const linkNodeExists = fragment.querySelector(`a[href="${url}"]`);
      return !(linkNodeExists || id === me);
    })
    .map((m) => getProp(m, "acct") || m.acct);

  // Replace ImmutableOrderedSet with a standard JavaScript Set.
  // Sets maintain insertion order in modern JavaScript engines (ES2015+).
  return new Set(mentions);
};

// `getIn` / `setIn` are imported from the shared helpers.

const getInitialComposeState = () => ({
  caretPosition: null,
  content_type: "text/plain",
  editorState: null,
  focusDate: null,
  group_id: null,
  idempotencyKey: crypto.randomUUID(),
  id: null,
  in_reply_to: null,
  is_changing_upload: false,
  is_composing: false,
  is_submitting: false,
  is_uploading: false,
  media_attachments: [],
  poll: null,
  privacy: "public",
  progress: 0,
  quote: null,
  resetFileKey: Math.floor(Math.random() * 0x10000),
  schedule: null,
  sensitive: false,
  spoiler: false,
  spoiler_text: "",
  suggestions: [],
  suggestion_token: null,
  tagHistory: [],
  text: "",
  to: [], // Use standard array for 'to'
  group_timeline_visible: false,
});

export const createComposeSlice = (
  setScoped,
  getScoped,
  rootSet,
  rootGet,
) => {
  // Keep an internal `set` alias so existing code can remain unchanged.
  const getActions = () => rootGet();

  let cancelFetchComposeSuggestions = null;

  // Internal helper to ensure a specific compose key exists
  const ensureCompose = (state, key) => {
    const k = key || "default";
    if (!state[k]) state[k] = getInitialComposeState();
    return state[k];
  };

  // Internal helper to handle the common logic of resetting IDs/Privacy
  const applyResetIdentifiers = (compose, id) => {
    // Standard JS string parsing
    compose.in_reply_to = id.startsWith("reply:") ? id.slice(6) : null;
    
    if (id.startsWith("group:")) {
      compose.privacy = "group";
      compose.group_id = id.slice(6);
    }
    
    // Cycle the key to prevent accidental duplicate submissions
    compose.idempotencyKey = crypto.randomUUID();
  };

  return {
    ...getInitialComposeState(),

    composeTypeChange: (key, content_type) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.content_type = content_type;
        compose.idempotencyKey = crypto.randomUUID();
      });
    },

    composeSpoilernessChange: (key) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.sensitive = !compose.sensitive;
        compose.spoiler = !compose.spoiler;
        compose.spoiler_text = "";
        compose.idempotencyKey = crypto.randomUUID();
      });
    },

    composeSpoilerTextChange: (key, text) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.spoiler_text = text;
        compose.idempotencyKey = crypto.randomUUID();
      });
    },

    composeVisibilityChange: (key, value) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.privacy = value;
        compose.idempotencyKey = crypto.randomUUID();
      });
    },

    composeChange: (key, text) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.text = text;
        compose.idempotencyKey = crypto.randomUUID();
      });
    },

    composeReply: (key, status, account, explicitAddressing) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        const { array, text } = getMentionsData(status, account);

        compose.group_id = status?.group?.id || null;
        compose.in_reply_to = status?.id || null;
        compose.to = explicitAddressing ? array : [];
        compose.text = explicitAddressing ? "" : text;
        compose.focusDate = new Date();
        compose.idempotencyKey = crypto.randomUUID();
        
        // Handle privacy preference
        const statusPrivacy = status?.visibility || "public";
        compose.privacy = privacyPreference(statusPrivacy, "public");
      });
    },

    composeEventReply: (key, status, account) => {
      setScoped((state) => {
        // 1. Get the specific compose instance (default, modal, etc.)
        const compose = ensureCompose(state, key);

        // 2. Direct Immer mutations
        compose.in_reply_to = status?.id || null;
        
        // 3. Use the plain JS helper for mentions
        const { array } = getMentionsData(status, account);
        compose.to = array;

        // 4. Regenerate idempotency key
        compose.idempotencyKey = crypto.randomUUID();
      });
    },

    composeQuote: (key, status) => {
      setScoped((state) => {
        // 1. Default to 'compose-modal' for quotes as per your original logic
        const k = key || "compose-modal";
        const compose = ensureCompose(state, k);
        const author = status?.account?.acct || "";

        // 2. Apply Base Quote properties
        compose.quote = status?.id || null;
        compose.to = author ? [author] : [];
        compose.text = "";
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.spoiler = false;
        compose.spoiler_text = "";
        compose.idempotencyKey = crypto.randomUUID();

        // 3. Handle Privacy Logic
        const defaultPrivacy = "public"; // or getInitialComposeState().privacy
        compose.privacy = privacyPreference(status?.visibility || defaultPrivacy, defaultPrivacy);

        // 4. Group-Specific Visibility logic
        if (status?.visibility === "group" && status.group) {
          const visibility = status.group.group_visibility;
          
          if (visibility === "everyone") {
            compose.privacy = privacyPreference("public", defaultPrivacy);
          } else if (visibility === "members_only") {
            compose.group_id = status.group.id || null;
            compose.privacy = "group";
          }
        }
      });
    },

    composeSubmitRequest: (key) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.is_submitting = true;
      });
    },

    composeUploadChangeRequest: (key) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        // Direct mutation: Immer tracks this and updates the store immutably
        compose.is_changing_upload = true;
      });
    },

    composeReplyOrQuoteCancel: (key, id) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        
        // 1. Reset specific identifiers
        // Replicates the logic of slicing the "reply:" or "group:" prefix
        compose.in_reply_to = id.startsWith("reply:") ? id.slice(6) : null;
        
        // 2. Handle Group-specific logic
        if (id.startsWith("group:")) {
          compose.privacy = "group";
          compose.group_id = id.slice(6);
        }

        // 3. Cycle the idempotency key to prevent submission collisions
        compose.idempotencyKey = crypto.randomUUID();
      });
    },

    composeReset: (key, id) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        applyResetIdentifiers(compose, id);
      });
    },
    
    composeSubmitSuccess: (key, id) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        // Clear submitting state and reset identifiers
        compose.is_submitting = false; 
        applyResetIdentifiers(compose, id);
      });
    },

    composeSubmitFail: (key) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.is_submitting = false;
      });
    },

   composeUploadChangeFail: (key) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.is_changing_upload = false;
      });
    }, //san till here

    composeUploadRequest: (key) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.is_uploading = true;
      });
    },

    composeUploadSuccess: (key, media) => {
      if (!media) return;

      setScoped((state) => {
        const compose = ensureCompose(state, key);
        
        // 1. Normalize into a Plain Old JavaScript Object (POJO)
        const normalized = AttachmentNormalizer.normalizeAttachment(media);
        if (!normalized) return;

        // 2. Deduplicate using standard Array logic
        const newId = normalized.id || normalized.url || normalized.preview_url;
        const exists = compose.media_attachments.some(item => (item.id || item) === newId);

        if (!exists) {
          // Standard Array push (Immer handles the immutability)
          compose.media_attachments.push(normalized);
        }

        // 3. Reset UI states
        compose.is_uploading = false;
        compose.resetFileKey = Math.floor(Math.random() * 0x10000);
        compose.idempotencyKey = crypto.randomUUID();

        // 4. Handle Sensitivity Logic
        // If this is the first attachment and the post was marked as spoiler/sensitive
        if (compose.media_attachments.length === 1 && (compose.spoiler || compose.sensitive)) {
          compose.sensitive = true;
        }
      });
    },

    composeUploadFail: (key) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.is_uploading = false;
      });
    },

    composeUploadUndo: (key, mediaId) => {
      if (mediaId == null) return;

      setScoped((state) => {
        const compose = ensureCompose(state, key);
        const originalLength = compose.media_attachments.length;

        // 1. Native filter replaces manual array conversion and getProp
        compose.media_attachments = compose.media_attachments.filter(
          (item) => item.id !== mediaId
        );

        // 2. Only update if something was actually removed
        if (compose.media_attachments.length !== originalLength) {
          compose.idempotencyKey = crypto.randomUUID();

          // 3. Auto-clear sensitivity if no media left
          if (compose.media_attachments.length === 0) {
            compose.sensitive = false;
          }
        }
      });
    },

    composeUploadProgress: (key, loaded, total) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.progress = Math.round((loaded / total) * 100);
      });
    },

    composeMention: (key, text, account) => {
      setScoped((state) => {
        const k = key || "compose-modal";
        const compose = ensureCompose(state, k);

        // Build new text using standard array join
        const parts = [text.trim(), `@${account.acct} `].filter(s => s.length > 0);
        
        compose.text = parts.join(" ");
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
      });
    },

    composeDirect: (key, text, account) => {
      setScoped((state) => {
        const k = key || "compose-modal";
        const compose = ensureCompose(state, k);

        const parts = [text.trim(), `@${account.acct} `].filter(s => s.length > 0);
        
        compose.text = parts.join(" ");
        compose.privacy = "direct"; // Explicitly set to direct message
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
      });
    },

    composeGroupPost: (key, group_id) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.privacy = "group"; // Note: changed from 'direct' to 'group' to match context
        compose.group_id = group_id;
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.idempotencyKey = crypto.randomUUID();
      });
    },

    composeSuggestionsClear: (key) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.suggestions = []; // Use empty array instead of null for better UI iteration
        compose.suggestion_token = null;
      });
    },

    composeSuggestionsReady: (key, accounts, emojis, token) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);

        // 1. Prepare logic using standard JS
        if (accounts) {
          compose.suggestions = accounts.map((item) => item.id);
        } else if (emojis) {
          compose.suggestions = emojis;
        } else {
          compose.suggestions = [];
        }

        compose.suggestion_token = token || null;
      });
    },

    composeSuggestionSelect: (key, position, token, completion, path) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        const tokenLength = token?.length ?? 0;

        // 2. Standard String manipulation replaces 'getIn'/'setIn'
        // 'path' is usually ['text'] or ['spoiler_text']
        const fieldName = path[path.length - 1]; 
        const oldText = String(compose[fieldName] || "");
        
        const updatedText = `${oldText.slice(0, position)}${completion} ${oldText.slice(
          position + tokenLength
        )}`;

        // 3. Direct Mutation
        compose[fieldName] = updatedText;
        compose.suggestions = [];
        compose.suggestion_token = null;
        compose.idempotencyKey = crypto.randomUUID();

        // 4. Handle UI focus/caret for main text field
        if (fieldName === "text") {
          compose.focusDate = new Date();
          compose.caretPosition = position + completion.length + 1;
        }
      });
    },

    composeSuggestionTagsUpdate: (key, token, tags) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);

        // 1. Validation check
        if (!token || typeof token !== "string" || !Array.isArray(tags)) {
          compose.suggestions = [];
          compose.suggestion_token = null;
          return;
        }

        const prefix = token.slice(1).toLowerCase();

        // 2. Filter and Map using standard JS
        // No need for Object.freeze as Immer produces an immutable state
        compose.suggestions = tags
          .filter(tag => tag?.name?.toLowerCase().startsWith(prefix))
          .slice(0, 4)
          .map(tag => `#${tag.name}`);

        compose.suggestion_token = token;
      });
    },

    composeTagHistoryUpdate: (key, tags) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.tagHistory = tags || [];
      });
    },

    composeTimelineDelete: (key, id) => {
      setScoped((state) => {
        const k = key || "compose-modal";
        const compose = state[k];
        
        // Only modify if the deleted ID matches a reference in this compose instance
        if (!compose) return;

        if (id === compose.in_reply_to) {
          compose.in_reply_to = null;
        } else if (id === compose.quote) {
          compose.quote = null;
        }
      });
    },

    composeEmojiInsert: (key, position, emoji, needsSpace) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        
        const oldText = compose.text || "";
        const emojiText = emoji.native !== undefined ? emoji.native : emoji.colons;
        const emojiData = needsSpace ? ` ${emojiText}` : emojiText;

        // 3. String manipulation and Caret update
        compose.text = `${oldText.slice(0, position)}${emojiData} ${oldText.slice(position)}`;
        compose.focusDate = new Date();
        // +1 for the space we add after the emoji
        compose.caretPosition = position + emojiData.length + 1;
        compose.idempotencyKey = crypto.randomUUID();
      });
    },

    composeUploadChangeSuccess: (key, media) => {
      if (!media) return;

      setScoped((state) => {
        const compose = ensureCompose(state, key);
        
        // Use standard JS .map() to replace the specific attachment
        compose.media_attachments = compose.media_attachments.map((item) => {
          if (item.id === media.id) {
            return AttachmentNormalizer.normalizeAttachment(media);
          }
          return item;
        });

        compose.is_changing_upload = false;
      });
    },

    composeSetStatus: (key, status, rawText, explicitAddressing, spoilerText, contentType, withRedraft) => {
      setScoped((state) => {
        const k = key || "compose-modal";
        const compose = ensureCompose(state, k);

        // 1. Extract IDs and Properties using Optional Chaining
        const accountId = status?.account?.id;
        const quoteId = status?.quote?.id || null;
        const groupId = status?.group?.id || null;
        const inReplyTo = status?.in_reply_to_id || status?.in_reply_to?.id || null;

        // 2. Handle Text & Mentions
        // Replaces the DOMParser 'expandMentions' and 'htmlToPlaintext' logic
        const text = rawText || htmlToPlaintext(expandMentions(status));
        const to = explicitAddressing ? [...getExplicitMentions(accountId, status)] : [];

        // 3. Metadata and Privacy
        const statusSpoilerText = (typeof spoilerText === "string" && spoilerText.length > 0)
          ? spoilerText
          : (status?.spoiler_text || "");

        // 4. Update the Compose State directly via Immer
        if (withRedraft && status) {
          compose.id = status.id;
        }

        compose.text = text;
        compose.to = to;
        compose.in_reply_to = inReplyTo;
        compose.privacy = status?.visibility || compose.privacy;
        compose.focusDate = new Date();
        compose.caretPosition = null;
        compose.spoiler = Boolean(statusSpoilerText.length > 0);
        compose.spoiler_text = statusSpoilerText;
        compose.content_type = contentType || "text/plain";
        compose.quote = quoteId;
        compose.group_id = groupId;
        compose.media_attachments = status?.media_attachments || [];
        compose.idempotencyKey = crypto.randomUUID();

        // 5. Handle Polls
        if (status?.poll) {
          const p = status.poll;
          // Standard JS map() for poll options
          const opts = (p.options || []).map(o => o.title ?? o);

          compose.poll = {
            options: opts,
            multiple: Boolean(p.multiple),
            expires_in: 24 * 3600,
          };
        }
      });
    },

    composePollAdd: (key) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        if (compose.poll) return;

        compose.poll = {
          options: ["", ""],
          multiple: false,
          expires_in: 24 * 3600,
        };
      });
    },

    composePollRemove: (key) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.poll = null;
      });
    },

    composeScheduleAdd: (key) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        if (compose.schedule) return;
        // Default to 10 minutes in the future
        compose.schedule = new Date(Date.now() + 10 * 60 * 1000);
      });
    },

    composeScheduleSet: (key, date) => {
      if (date === undefined) return;
      
      const d = date instanceof Date ? date : new Date(date);
      if (Number.isNaN(d.getTime())) return;

      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.schedule = d;
      });
    },

    composeScheduleRemove: (key) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.schedule = null;
      });
    },

    composePollOptionAdd: (key, title) => {
      if (typeof title !== "string" || !title.trim()) return;
      const trimmed = title.trim();

      setScoped((state) => {
        const compose = ensureCompose(state, key);
        
        // 1. Ensure poll object exists
        if (!compose.poll) {
          compose.poll = {
            options: [],
            multiple: false,
            expires_in: 24 * 3600,
          };
        }

        // 2. Add option if it doesn't already exist (dedupe)
        if (!compose.poll.options.includes(trimmed)) {
          // Standard JS push works perfectly with Immer
          compose.poll.options.push(trimmed);
        }
      });
    },

    composePollOptionChange: (key, index, title) => {
      if (typeof title !== "string" || typeof index !== "number" || index < 0) return;
      
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        const options = compose.poll?.options;
        if (!options || index >= options.length) return;

        const trimmed = title.trim();
        if (trimmed.length === 0 || options[index] === trimmed) return;

        // Direct array mutation via Immer
        options[index] = trimmed;
      });
    },

    composePollOptionRemove: (key, title) => {
      if (typeof title !== "string") return;

      setScoped((state) => {
        const compose = ensureCompose(state, key);
        if (!compose.poll?.options) return;

        // Standard JS filter
        const originalLength = compose.poll.options.length;
        compose.poll.options = compose.poll.options.filter(o => o !== title);
        
        // Immer only triggers a re-render if the length actually changed
      });
    },

    composePollSettingsChange: (key, expiresIn, isMultiple) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        if (!compose.poll) return;

        if (expiresIn != null) {
          compose.poll.expires_in = expiresIn;
        }
        if (typeof isMultiple === "boolean") {
          compose.poll.multiple = isMultiple;
        }
      });
    },

    composeAddToMentions: (key, account) => {
      if (!account) return;
      const acct = typeof account === "string" ? account : (account?.acct ?? account?.id);
      if (!acct) return;

      setScoped((state) => {
        const compose = ensureCompose(state, key);
        
        // Ensure 'to' is an array (replacing Set logic)
        if (!Array.isArray(compose.to)) compose.to = [];
        
        if (!compose.to.includes(acct)) {
          compose.to.push(acct);
        }
      });
    },

    composeRemoveFromMentions: (key, account) => {
      if (!account) return;
      const acct = typeof account === "string" ? account : (account?.acct ?? account?.id);
      if (!acct) return;

      setScoped((state) => {
        const compose = ensureCompose(state, key);
        if (!Array.isArray(compose.to)) return;

        compose.to = compose.to.filter(x => x !== acct);
      });
    },

    composeSetGroupTimelineVisible: (key, groupTimelineVisible) => {
      if (groupTimelineVisible === undefined) return;

      setScoped((state) => {
        const compose = ensureCompose(state, key);
        compose.group_timeline_visible = Boolean(groupTimelineVisible);
      });
    },

    fetchMeSuccess(me) {
      // 1. Standard JS access replaces getIn for nested settings
      const settings = me?.kollective_settings_store?.['kollective-fe'] || {};
      const { defaultPrivacy, defaultContentType } = settings;

      setScoped((state) => {
        const compose = ensureCompose(state, 'default');

        // 2. Direct mutation based on incoming user preferences
        if (defaultPrivacy) compose.privacy = defaultPrivacy;
        if (defaultContentType) compose.content_type = defaultContentType;

        // 3. Sync tag history from your persisted settings utility
        // Replaces .get(id) with standard JS property access or Map.get()
        if (me?.id) {
          compose.tagHistory = tagHistory.get?.(me.id) || tagHistory[me.id] || [];
        }
      });
    },

    // In Zustand, patchMeSuccess usually shares the same logic as fetchMeSuccess
    patchMeSuccess(me) {
      return this.fetchMeSuccess(me);
    },

    changeSetting: (path, value) => {
      setScoped((state) => {
        const compose = ensureCompose(state, 'default');
        const pathString = Array.isArray(path) ? path.join(',') : path;

        // 4. Update compose defaults when user changes global settings
        switch (pathString) {
          case 'defaultPrivacy':
            compose.privacy = value;
            break;
          case 'defaultContentType':
            compose.content_type = value;
            break;
        }
      });
    },

    composeEditorStateSet: (key, editorState) => {
      if (editorState === undefined) return;

      setScoped((state) => {
        const compose = ensureCompose(state, key);
        // Supports rich text editor state (e.g., Draft.js or Lexical)
        compose.editorState = editorState;
      });
    },

    eventComposeCancel: (key) => {
      setScoped((state) => {
        const k = key || "event-compose-modal";
        const compose = ensureCompose(state, k);
        compose.text = ""; 
      });
    },

    eventformSet: (key, text) => {
      setScoped((state) => {
        const k = key || "event-compose-modal";
        const compose = ensureCompose(state, k);
        compose.text = text;
      });
    },
    
    composeChangeMediaOrder: (key, a, b) => {
      setScoped((state) => {
        const compose = ensureCompose(state, key);
        const current = compose.media_attachments;

        if (!current || current.length === 0) return;

        // Helper to find index by number or by attachment ID
        const findIndex = (val) => {
          if (typeof val === "number") {
            return (val >= 0 && val < current.length) ? val : -1;
          }
          return current.findIndex((it) => (it.id ?? it) === val);
        };

        const indexA = findIndex(a);
        const indexB = findIndex(b);

        if (indexA < 0 || indexB < 0 || indexA === indexB) return;

        // Immer allows direct mutation of the array via splice
        const [item] = current.splice(indexA, 1);
        current.splice(indexB, 0, item);
      });
    },

    setComposeToStatus(status, rawText, spoilerText, contentType, withRedraft) {
      // Use getActions() to call the sibling action via the root store
      getActions().composeSetStatus(
        "compose-modal",
        status,
        rawText,
        true, // explicitAddressing
        spoilerText,
        contentType,
        withRedraft,
      );
    },

    async replyCompose(status) {
      const state = rootGet();
      const actions = getActions();
      
      // 1. Get features and settings from root state
      const { explicitAddressing } = getFeatures();
      const preserveSpoilers = state.settings?.preserveSpoilers ?? false;
      
      // 2. Use your existing selector logic (assuming it's a pure util)
      const account = selectOwnAccount(state);
      if (!account) return;

      // 3. Call uniquely named actions from the root
      actions.composeReply(
        "compose-modal",
        status,
        account,
        explicitAddressing,
        preserveSpoilers
      );

      // 4. Open the modal via the modal slice action
      actions.openModalAction("COMPOSE");
    },

    async quoteCompose(status) {
      const state = rootGet();
      const actions = getActions();
      
      const { explicitAddressing } = getFeatures();
      const account = selectOwnAccount(state);
      if (!account) return;

      actions.composeQuote(
        "compose-modal", 
        status,
        account,
        explicitAddressing
      );

      actions.openModalAction("COMPOSE");  
    },

    groupComposeModal(group) {
      const actions = getActions();
      const composeId = `group:${group.id}`;

      actions.composeGroupPost(
        "compose-modal",
        group.id
      );

      // Pass the specific group context to the modal action
      actions.openModalAction("COMPOSE", { composeId });
    },

    mentionCompose(account) {
      const actions = getActions();

      actions.composeMention(
        "compose-modal",
        "", // Initial empty text
        account
      );

      actions.openModalAction("COMPOSE");  
    },

    directCompose(account) {
      const actions = getActions();

      actions.composeDirect(
        "compose-modal",
        "",
        account
      );

      actions.openModalAction("COMPOSE");  
    },

    directComposeById(accountId) {
      const state = rootGet();
      const actions = getActions();
      
      // Use your selector with the plain JS state
      const account = selectAccount(state, accountId);
      if (!account) return;

      actions.composeDirect(
        "compose-modal",
        "",
        account
      );

      actions.openModalAction("COMPOSE");
    },

    insertIntoTagHistory(composeId, recognizedTags, text) {
      const state = rootGet();
      const actions = getActions();
      
      const oldHistory = state.compose?.[composeId]?.tagHistory || [];
      const me = state.auth?.me;
      if (!me) return;

      // 1. Filter tags actually present in the text
      const names = recognizedTags
        .filter(tag => new RegExp(`#${tag.name}`, 'i').test(text))
        .map(tag => tag.name);

      // 2. Merge with old history, removing duplicates (Case-Insensitive)
      const intersectedOldHistory = oldHistory.filter(
        oldName => !names.some(newName => newName.toLowerCase() === oldName.toLowerCase())
      );

      // 3. Combine and truncate to 1000 items
      const newHistory = [...names, ...intersectedOldHistory].slice(0, 1000);

      // 4. Persist to your external storage utility (tagHistory)
      tagHistory.set(me, newHistory);

      // 5. Update the store state
      actions.composeTagHistoryUpdate(composeId, newHistory);
    },
      
    handleComposeSubmit(composeId, data, statusText) {
      const actions = getActions();

      // 1. Update tag history based on submitted content
      actions.insertIntoTagHistory(
        composeId,
        data.tags || [],
        statusText
      );

      // 2. Mark submission as successful and reset the compose instance
      // Using a plain object spread for data
      actions.composeSubmitSuccess(
        composeId,
        { ...data }
      );

      // Note: You can now trigger a toast here via:
      // actions.showToast("Post submitted successfully!");
    },

    needsDescriptions(composeId) {
      const state = rootGet();
      const compose = state.compose?.[composeId];
      const media = compose?.media_attachments || [];
      const missingDescriptionModal = state.settings?.missingDescriptionModal;

      const hasMissing = media.some(item => !item.description);
      return hasMissing && missingDescriptionModal;
    },

    validateSchedule(composeId) {
      const state = rootGet();
      const compose = state.compose?.[composeId];
      if (!compose?.schedule) return true;

      // 5 minutes from now check
      const threshold = Date.now() + 300000;
      return compose.schedule.getTime() > threshold;
    },

    async submitCompose(composeId, opts = {}) {
      const state = rootGet();
      const actions = getActions();
      const { history, force = false } = opts;

      if (!isLoggedIn(state)) return;

      const compose = state.compose?.[composeId];
      if (!compose) return;

      // 1. Validation Checks
      if (!actions.validateSchedule(composeId)) {
        actions.showToast?.("Schedule must be at least 5 minutes in the future.");
        return;
      }

      if (!force && actions.needsDescriptions(composeId)) {
        actions.openModalAction("MISSING_DESCRIPTION", { 
          onContinue: () => {
            actions.closeModalAction("MISSING_DESCRIPTION");
            actions.submitCompose(composeId, { history, force: true });
          }
        });
        return;
      }

      // 2. Mentions Extraction (Standard JS Set for union)
      const statusText = compose.text;
      const mentions = statusText.match(/(?:^|\s)@([^@\s]+(?:@[^@\s]+)?)/gi);
      let to = Array.isArray(compose.to) ? [...compose.to] : [];
      
      if (mentions) {
        const extracted = mentions.map(m => m.trim().slice(1));
        to = [...new Set([...to, ...extracted])]; // Replaces .union()
      }

      // 3. UI State: Requesting
      actions.composeSubmitRequest(composeId);
      actions.closeModal?.();

      // 4. API Params Construction
      const params = {
        status: statusText,
        in_reply_to_id: compose.in_reply_to,
        quote_id: compose.quote,
        media_ids: (compose.media_attachments || []).map(item => item.id),
        sensitive: compose.sensitive,
        spoiler_text: compose.spoiler_text,
        visibility: compose.privacy,
        content_type: compose.content_type,
        poll: compose.poll,
        scheduled_at: compose.schedule,
        to,
      };

      if (compose.privacy === 'group') {
        params.group_id = compose.group_id;
        params.group_timeline_visible = compose.group_timeline_visible;
      }

      try {
        const data = await actions.createStatus(params, compose.idempotencyKey, compose.id);
        
        // Navigation Logic
        if (!compose.id && data.visibility === 'direct' && state.conversations?.mounted <= 0 && history) {
          history.push('/messages');
        }

        actions.handleComposeSubmit(composeId, data, statusText);
      } catch (err) {
        console.error("Submission failed", err);
        actions.composeSubmitFail(composeId);
      }
    },

    uploadCompose(composeId, files, intl) {
      const state = rootGet();
      const actions = getActions();
      if (!isLoggedIn(state) || !files?.length) return;

      const attachmentLimit = 4;
      const media = state.compose?.[composeId]?.media_attachments || [];
      const mediaCount = media.length;

      if (files.length + mediaCount > attachmentLimit) {
        actions.showToast?.(`Maximum ${attachmentLimit} attachments allowed.`);
        return;
      }

      actions.composeUploadRequest(composeId);

      // Track individual file progress in an array
      const progressTracker = new Array(files.length).fill(0);

      Array.from(files).forEach((file, i) => {
        if (mediaCount + i >= attachmentLimit) return;

        actions.uploadFile(
          file,
          intl,
          (data) => actions.composeUploadSuccess(composeId, data),
          (error) => {
            console.error(error);
            actions.composeUploadFail(composeId);
          },
          (event) => {
            progressTracker[i] = event.loaded;
            const totalLoaded = progressTracker.reduce((a, v) => a + v, 0);
            actions.composeUploadProgress(composeId, totalLoaded, event.total);
          }
        );
      });
    },

    async changeUploadCompose(composeId, id, params) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return;

      actions.composeUploadChangeRequest(composeId);

      try {
        const response = await actions.updateMedia(id, params);
        const data = await response.json();
        actions.composeUploadChangeSuccess(composeId, data);
      } catch (error) {
        console.error("Media update failed", error);
        actions.composeUploadChangeFail(composeId);
      }
    },

    clearComposeSuggestions(composeId) {
      getActions().composeSuggestionsClear(composeId);
    },

    // 1. Throttled Account Search
    // Note: Use a regular function (not arrow) if you need 'this' or pass it to throttle
    fetchComposeSuggestionsAccounts: throttle(async (composeId, token) => {
      cancelFetchComposeSuggestions?.abort();
      cancelFetchComposeSuggestions = new AbortController();

      const actions = getActions();

      try {
        const query = new URLSearchParams({
          q: token.slice(1),
          resolve: false,
          limit: 10,
        }).toString();

        const response = await fetch(`/api/v1/accounts/search?${query}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: cancelFetchComposeSuggestions.signal,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        // Import fetched account entities
        actions.importFetchedAccounts?.(data);
        
        // Notify the slice the suggestions are ready
        actions.composeSuggestionsReady(composeId, token, data);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching suggestions accounts:', error);
      }
    }, 200),

    // 2. Local Emoji Search
    fetchComposeSuggestionsEmojis(composeId, token, customEmojis) {
      // emojiSearch is a local utility (standard JS)
      const results = emojiSearch(token.replace(':', ''), { maxResults: 10 }, customEmojis);

      getActions().composeSuggestionsReady(
        composeId,
        token,
        results
      );
    },

   // 3. Tag/Trend Search
    async fetchComposeSuggestionsTags(composeId, token) {
      cancelFetchComposeSuggestions?.abort();
      cancelFetchComposeSuggestions = new AbortController();

      const state = rootGet();
      const actions = getActions();
      const { trends } = getFeatures();

      // If trends are enabled, use the ones already in the store
      if (trends) {
        const currentTrends = state.trends?.items || [];
        actions.composeSuggestionTagsUpdate(composeId, token, currentTrends);
        return;
      }

      try {
        const query = new URLSearchParams({
          q: token.slice(1),
          limit: 10,
          type: 'hashtags',
        }).toString();

        const response = await fetch(`/api/v1/search?${query}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: cancelFetchComposeSuggestions.signal,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        // Assuming the API returns a 'hashtags' array
        actions.composeSuggestionTagsUpdate(composeId, token, data.hashtags || []);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching suggestions tags:', error);
      }
    },

    // 4. Main Entry Point for Suggestions
    fetchComposeSuggestions(composeId, token, customEmojis) {
      const firstChar = token.charAt(0);
      const actions = getActions();

      if (firstChar === '@') {
        actions.fetchComposeSuggestionsAccounts(composeId, token);
      } else if (firstChar === ':') {
        actions.fetchComposeSuggestionsEmojis(composeId, token, customEmojis);
      } else if (firstChar === '#') {
        actions.fetchComposeSuggestionsTags(composeId, token);
      } else {
        actions.fetchComposeSuggestionsAccounts(composeId, token);
      } 
    },

    // 5. Handling Selection
    selectCompositionSuggestion(composeId, position, token, suggestion, path) {
      const state = rootGet();
      const actions = getActions();
      let completion = '';
      let startPosition = position;

      // Handle Emoji Object
      if (typeof suggestion === 'object' && suggestion.id) {
        completion = isNativeEmoji(suggestion) ? suggestion.native : suggestion.colons;
        startPosition = position - 1;
        actions.chooseEmoji?.(suggestion);
      } 
      // Handle Hashtag String
      else if (typeof suggestion === 'string' && suggestion[0] === '#') {
        completion = suggestion;
        startPosition = position - 1;
      } 
      // Handle Account ID String
      else if (typeof suggestion === 'string') {
        const account = state.accounts?.[suggestion];
        completion = account?.acct || suggestion;
        startPosition = position;
      }

      actions.composeSuggestionSelect(
        composeId,
        startPosition,
        token,
        completion,
        path
      );
    },

    openComposeWithText(composeId, text) {
      const actions = getActions();
      
      // 1. Reset the specific compose instance
      actions.composeReset(composeId);
      
      // 2. Open the modal via the modal slice
      actions.openModalAction("COMPOSE");
      
      // 3. Set the initial text
      actions.composeChange(composeId, text);
    },

    addToMentions(composeId, accountId) {
      const state = rootGet();
      const actions = getActions();
      
      // Look up account in normalized JS state
      const account = state.accounts?.[accountId];
      if (!account) return;

      actions.composeAddToMentions(
        composeId,
        account.acct
      );
    },

    removeFromMentions(composeId, accountId) {
      const state = rootGet();
      const actions = getActions();
      
      const account = state.accounts?.[accountId];
      if (!account) return;

      actions.composeRemoveFromMentions(
        composeId,
        account.acct
      );
    },

    eventDiscussionCompose(composeId, status) {
      const state = rootGet();
      const actions = getActions();
      const { explicitAddressing } = getFeatures();

      // Coordinate with own account data and features
      actions.composeEventReply(
        composeId,
        status,
        selectOwnAccount(state), // Assuming selector is updated for JS
        explicitAddressing
      );
    },

    setEditorState(composeId, editorState) {
      // Direct pass-through to the internal setter
      getActions().composeEditorStateSet(
        composeId,
        editorState
      );
    },

    changeMediaOrder(composeId, a, b) {
      // Direct pass-through to the internal setter
      getActions().composeChangeMediaOrder(
        composeId,
        a,
        b
      );
    }

  };
};
