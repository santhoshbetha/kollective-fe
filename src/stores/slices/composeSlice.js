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

const initialState = {
  default: {
    caretPosition: null,
    content_type: "text/plain",
    editorState: null,
    focusDate: null,
    group_id: null,
    idempotencyKey: crypto.randomUUID() || String(Date.now()),
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
    resetFileKey: getResetFileKey(),
    schedule: null,
    sensitive: false,
    spoiler: false,
    spoiler_text: "",
    suggestions: [],
    suggestion_token: null,
    tagHistory: [],
    text: "",
    to: new Set(),
    group_timeline_visible: false, // TruthSocial
  },
};

export const createComposeSlice = (
  setScoped,
  getScoped,
  rootSet,
  rootGet,
) => {
  // Keep an internal `set` alias so existing code can remain unchanged.
  const set = setScoped;

  let cancelFetchComposeSuggestions = null;

  return {
    ...initialState.default,

    composeTypeChange: (key, content_type) => {
      set((state) => {
        const cur = state[key] || initialState.default;
        state[key] = {
          ...cur,
          content_type: content_type,
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
        };
      });
    },

    composeSpoilernessChange: (key) => {
      // id could be a scoped compose key (e.g. 'compose-modal')
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          spoiler_text: "",
          sensitive: !cur.sensitive,
          spoiler: !cur.spoiler,
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
        };
      });
    },

    composeSpoilerTextChange: (key, spoiler_text) => {
      // id could be a scoped compose key (e.g. 'compose-modal')
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          spoiler_text: spoiler_text,
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
        };
      });
    },

    composeVisibilityChange: (key, value) => {
      // id could be a scoped compose key (e.g. 'compose-modal')
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          privacy: value,
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
        };
      });
    },

    composeChange: (key, text) => {
      // id could be a scoped compose key (e.g. 'compose-modal')
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          text: text,
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
        };
      });
    },

    composeReply: (key, status, account, explicitAddressing, preserveSpoilers) => {
      // id could be a scoped compose key (e.g. 'compose-modal')
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        const base = {
          group_id: status?.group?.id || null,
          in_reply_to: status?.id || null,
          to: explicitAddressing ? statusToMentionsArray(status, account) : [],
          text: !explicitAddressing
            ? statusToTextMentions(status, account)
            : "",
          privacy: privacyPreference(
            status?.visibility || initialState.default.privacy,
            initialState.default.privacy,
          ),
          focusDate: new Date(),
          caretPosition: null,
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
          content_type: initialState.default.content_type,
        };

        if (preserveSpoilers && status && status.spoiler_text) {
          base.spoiler = true;
          base.sensitive = true;
          base.spoiler_text = status.spoiler_text;
        }

        state[k] = {
          ...cur,
          ...base,
        };
      });
    },

    composeEventReply: (key, status, account) => {
      // id could be a scoped compose key (e.g. 'compose-modal')
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          in_reply_to: status?.id || null,
          to: statusToMentionsArray(status, account),
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
        };
      });
    },

    composeQuote: (key, status) => {
      // id could be a scoped compose key (e.g. 'compose-modal')
      set((state) => {
        const k = key || "compose-modal";
        const cur = state[k] || initialState.default;
        const author = (status && status.account && status.account.acct) || "";

        const base = {
          quote: status?.id || null,
          to: [author],
          text: "",
          privacy: privacyPreference(
            status?.visibility || initialState.default.privacy,
            initialState.default.privacy,
          ),
          focusDate: new Date(),
          caretPosition: null,
          content_type: initialState.default.content_type,
          spoiler: false,
          spoiler_text: "",
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
        };

        if (status?.visibility === "group") {
          if (status.group?.group_visibility === "everyone") {
            base.privacy = privacyPreference(
              "public",
              initialState.default.privacy,
            );
          } else if (status.group?.group_visibility === "members_only") {
            base.group_id = status.group?.id || null;
            base.privacy = "group";
          }
        }

        state[k] = {
          ...cur,
          ...base,
        };
      });
    },

    composeSubmitRequest: (key) => {
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          is_submitting: true,
        };
      });
    },

    composeUploadChangeRequest: (key) => {
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          is_changing_upload: true,
        };
      });
    },

    composeReplyOrQuoteCancel: (key, id) => {
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        const base = {
          ...cur,
          in_reply_to: id.startsWith("reply:") ? id.slice(6) : null,
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
        };

        if (id.startsWith("group:")) {
          base.privacy = "group";
          base.group_id = id.slice(6);
        }

        state[k] = base;
      });
    },

    composeReset: (key, id) => {
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        const base = {
          ...cur,
          in_reply_to: id.startsWith("reply:") ? id.slice(6) : null,
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
        };

        if (id.startsWith("group:")) {
          base.privacy = "group";
          base.group_id = id.slice(6);
        }

        state[k] = base;
      });
    },
    
    composeSubmitSuccess: (key, id) => {
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        const base = {
          ...cur,
          in_reply_to: id.startsWith("reply:") ? id.slice(6) : null,
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
        };

        if (id.startsWith("group:")) {
          base.privacy = "group";
          base.group_id = id.slice(6);
        }

        state[k] = base;
      });
    },

    composeSubmitFail: (key) => {
      // id could be a scoped compose key (e.g. 'compose-modal')
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          is_submitting: false,
        };
      });
    },

    composeUploadChangeFail: (key) => {
      // id could be a scoped compose key (e.g. 'compose-modal')
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          is_changing_upload: false,
        };
      });
    },

    composeUploadRequest: (key) => {
      // id could be a scoped compose key (e.g. 'compose-modal')
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          is_uploading: true,
        };
      });
    },

    composeUploadSuccess: (key, media) => {
      if (!media) return;

      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;

        // Normalize input and ensure we work with a plain-array copy
        const normalized = AttachmentNormalizer.normalizeAttachment(media);

        const makeArray = (val) => {
          if (Array.isArray(val)) return val.slice();
          if (val instanceof Set) return Array.from(val);
          if (!val) return [];
          return Array.from(val);
        };

        const current = makeArray(cur.media_attachments);

        // Determine a stable id to dedupe by
        const newId =
          normalized &&
          (normalized.id ?? normalized.url ?? normalized.preview_url ?? null);
        const exists = newId
          ? current.some((it) => {
              const id = it && (it.id ?? getProp(it, "id"));
              return id === newId;
            })
          : false;

        const nextList = exists ? current : [...current, normalized];

        const out = {
          ...cur,
          media_attachments: nextList,
          is_uploading: false,
          resetFileKey: getResetFileKey(),
          idempotencyKey: crypto.randomUUID(),
        };

        // If this is the first attachment added and compose had spoiler/sensitive defaults, preserve sensitivity
        if (
          current.length === 0 &&
          nextList.length > 0 &&
          (cur.spoiler || cur.sensitive)
        ) {
          out.sensitive = true;
        }

        state[k] = out;
      });
    },

    composeUploadFail: (key) => {
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          is_uploading: false,
        };
      });
    },

    composeUploadUndo: (key, media_id) => {
      if (media_id === undefined || media_id === null) return;

      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;

        const makeArray = (val) => {
          if (Array.isArray(val)) return val.slice();
          if (val instanceof Set) return Array.from(val);
          if (!val) return [];
          try {
            return Array.from(val);
          } catch {
            return [];
          }
        };

        const current = makeArray(cur.media_attachments);
        const prevLen = current.length;

        const filtered = current.filter((item) => {
          const id = item && (item.id ?? getProp(item, "id"));
          return id !== media_id;
        });

        if (filtered.length === prevLen) return; // nothing removed

        const out = {
          ...cur,
          media_attachments: filtered,
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
        };

        if (filtered.length === 0) {
          out.sensitive = false;
        }

        state[k] = out;
      });
    },

    composeUploadProgress: (key, loaded, total) => {
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          progress: Math.round((loaded / total) * 100),
        };
      });
    },

    composeMention: (key, text, account) => {
      set((state) => {
        const k = key || "compose-modal";
        const cur = state[k] || initialState.default;
        const currentText = text;

        // The logic from the original snippet using plain JS
        const updatedTextArray = [
          currentText.trim(),
          `@${account.acct} `,
        ].filter((str) => str.length !== 0);

        const newText = updatedTextArray.join(" ");
        const base = {
          ...cur,
          text: newText,
          focusDate: new Date(),
          caretPosition: null,
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
        };

        state[k] = base;
      });
    },

    composeDirect: (key, text, account) => {
      set((state) => {
        const k = key || "compose-modal";
        const cur = state[k] || initialState.default;
        const currentText = text;

        // The logic from the original snippet using plain JS
        const updatedTextArray = [
          currentText.trim(),
          `@${account.acct} `,
        ].filter((str) => str.length !== 0);

        const newText = updatedTextArray.join(" ");
        const base = {
          ...cur,
          text: newText,
          privacy: "direct",
          focusDate: new Date(),
          caretPosition: null,
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
        };

        state[k] = base;
      });
    },

    composeGroupPost: (key, group_id) => {
      // id could be a scoped compose key (e.g. 'compose-modal')
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          privacy: "direct",
          group_id: group_id,
          focusDate: new Date(),
          caretPosition: null,
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
        };
      });
    },

    composeSuggestionsClear: (key) => {
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          suggestions: null,
          suggestion_token: null,
        };
      });
    },

    composeSuggestionsReady: (key, accounts, emojis, token) => {
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;

        // 1. Prepare the data using standard JavaScript map()
        // The original logic checks if 'action.accounts' exists first.
        let newSuggestionsList;

        if (accounts) {
          // It maps APIEntity items to just their 'id'
          newSuggestionsList = accounts.map((item) => item.id);
        } else if (emojis) {
          // Or uses the action.emojis array directly
          newSuggestionsList = emojis;
        } else {
          // Handle the case where neither is present (maybe clear the list)
          newSuggestionsList = null;
        }

        state[k] = {
          ...cur,
          suggestions: newSuggestionsList,
          suggestion_token: token || null, // Ensure a token is always set or cleared
        };
      });
    },

    composeSuggestionSelect: (key, position, token, completion, path) => {
      // Immutable update: compute new compose object and replace it
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        const newTokenLength = token?.length ?? 0;

        const oldText = String(getIn(cur, path) || "");
        const updatedText = `${oldText.slice(0, position)}${completion} ${oldText.slice(
          position + newTokenLength,
        )}`;

        let out = setIn(cur, path, updatedText);

        out = {
          ...out,
          suggestion_token: null,
          suggestions: null,
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
        };

        if (path.length === 1 && path[0] === "text") {
          out.focusDate = new Date();
          out.caretPosition = position + completion.length + 1; // +1 for the added space
        }

        state[k] = out;
      });
    },

    composeSuggestionTagsUpdate: (key, token, tags) => {
      // Validate inputs defensively
      if (!token || typeof token !== "string" || !Array.isArray(tags)) {
        // Clear suggestions if inputs are invalid
        set((state) => {
          const k = key || "default";
          const cur = state[k] || initialState.default;
          state[k] = {
            ...cur,
            suggestions: null,
            suggestion_token: null,
          };
        });
        return;
      }

      const prefix = token.slice(1).toLowerCase();

      const newSuggestions = tags
        .filter(
          (tag) => tag && tag.name && tag.name.toLowerCase().startsWith(prefix),
        )
        .slice(0, 4)
        .map((tag) => `#${tag.name}`);

      // Freeze suggestions (shallow) so callers receive an immutable array.
      let frozen;
      try {
        frozen = Object.freeze(newSuggestions.slice());
      } catch {
        frozen = newSuggestions;
      }

      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          suggestions: frozen,
          suggestion_token: token,
        };
      });
    },

    composeTagHistoryUpdate: (key, tags) => {
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          tagHistory: tags,
        };
      });
    },

    composeTimelineDelete: (key, id) => {
      set((state) => {
        const k = key || "compose-modal";
        const cur = state[k] || initialState.default;
        if (id === cur.in_reply_to) {
          state[k] = { ...cur, in_reply_to: null };
          return;
        } else if (id === cur.quote) {
          state[k] = { ...cur, quote: null };
          return;
        } else {
          return;
        }
      });
    },

    composeEmojiInsert: (key, position, emoji, needsSpace) => {
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        const oldText = cur.text;
        const emojiText =
          emoji.native !== undefined ? emoji.native : emoji.colons;
        const emojiData = needsSpace ? " " + emojiText : emojiText;

        const base = {
          ...cur,
          text: `${oldText.slice(0, position)}${emojiData} ${oldText.slice(position)}`,
          focusDate: new Date(),
          caretPosition: position + emoji.length + 1,
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
        };

        state[k] = base;
      });
    },

    composeUploadChangeSuccess: (key, media) => {
      if (!media) return;

      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;

        const attachments = Array.isArray(cur.media_attachments)
          ? cur.media_attachments
          : [];

        const updated_media = attachments.map((item) => {
          if (item && item.id === media.id) {
            return AttachmentNormalizer.normalizeAttachment(media);
          }
          return item;
        });

        state[k] = {
          ...cur,
          is_changing_upload: false,
          media_attachments: updated_media,
        };
      });
    },

    composeSetStatus: (
      key,
      status,
      rawText,
      explicitAddressing,
      spoilerText,
      contentType,
     // v,
      withRedraft,
    ) => {
      set((state) => {
        const k = key || "compose-modal";
        const cur = state[k] || initialState.default;
        // Use shared `getIn` which handles Immutable-like or plain JS
        const getStatus = (path) => {
          if (!status) return undefined;
          return getIn(status, path);
        };

        const accountId = getStatus(["account", "id"]) ?? undefined;

        let base = {};
        if (withRedraft && status) {
          base = { id: getStatus(["id"]) ?? undefined };
        }

        const quoteId = getStatus(["quote", "id"]) ?? null;
        const groupId = getStatus(["group", "id"]) ?? null;
        const inReplyTo = getStatus(["in_reply_to_id"]) ?? getStatus(["in_reply_to", "id"]) ?? null;

        // Build the base compose state using defensive accessors
        const visibility = getStatus(["visibility"]) ?? cur.privacy;
        const statusSpoilerText =
          typeof spoilerText === "string" && spoilerText.length > 0
            ? spoilerText
            : getStatus(["spoiler_text"]) || "";
        const statusMedia =
          getStatus(["media_attachments"]) ||
          cur.media_attachments ||
          null;
        const pollVal = getStatus(["poll"]);

        const base2 = {
          ...base,
          text: rawText || htmlToPlaintext(expandMentions(status)),
          to: explicitAddressing ? getExplicitMentions(accountId, status) : [],
          in_reply_to: inReplyTo,
          privacy: visibility,
          focusDate: new Date(),
          caretPosition: null,
          spoiler: Boolean(statusSpoilerText && statusSpoilerText.length > 0),
          spoiler_text: statusSpoilerText || "",
          idempotencyKey:
            typeof crypto !== "undefined" && crypto?.randomUUID
              ? crypto.randomUUID()
              : String(Date.now()),
          content_type: contentType || "text/plain",
          quote: quoteId,
          group_id: groupId,
          media_attachments: statusMedia,
        };

        let result = { ...base2 };

        if (pollVal) {
          // Use shared safe helpers: convert pollVal to plain and coerce options to array
          const p = asPlain(pollVal) || {};
          const rawOptions = p.options || [];
          const opts = asArray(rawOptions).map((o) => {
            const title = getProp(o, "title");
            if (title !== undefined && title !== null) return title;
            if (o && o.title !== undefined) return o.title;
            return o;
          });

          const multiple = Boolean(p.multiple);

          result = {
            ...result,
            poll: {
              options: opts || [],
              multiple: multiple,
              expires_in: 24 * 3600,
            },
          };
        }

        try {
          state[k] = Object.freeze(result);
        } catch {
          state[k] = result;
        }
      });
    },

    composePollAdd: (key) => {
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        // If a poll already exists, don't overwrite it
        if (cur.poll) return;

        const newPoll = {
          options: ["", ""],
          multiple: false,
          expires_in: 24 * 3600,
        };

        state[k] = {
          ...cur,
          poll: newPoll,
        };
      });
    },

    composePollRemove: (key) => {
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        if (!cur.poll) return;
        state[k] = { ...cur, poll: null };
      });
    },

    composeScheduleAdd: (key) => {
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        if (cur.schedule) return;
        state[k] = { ...cur, schedule: new Date(Date.now() + 10 * 60 * 1000) };
      });
    },

    composeScheduleSet: (key, date) => {
      // Accept Date, ISO string, or timestamp. Ignore undefined.
      if (date === undefined) return;
      let d = date;
      if (!(d instanceof Date)) {
        d = new Date(d);
      }
      if (Number.isNaN(d.getTime())) return;
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = { ...cur, schedule: d };
      });
    },

    composeScheduleRemove: (key) => {
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        if (!cur.schedule) return;
        state[k] = { ...cur, schedule: null };
      });
    },

    composePollOptionAdd: (key, title) => {
      set((state) => {
        if (!title || typeof title !== "string") return;
        const k = key || "default";
        const trimmed = title.trim();
        if (trimmed.length === 0) return;

        const cur = state[k] || initialState.default;
        // Ensure poll exists
        const poll = cur.poll || {
          options: [],
          multiple: false,
          expires_in: 24 * 3600,
        };
        const currentOptions = getIn(poll, ["options"]) || [];

        // Normalize to array
        const optsArray = Array.isArray(currentOptions)
          ? currentOptions.slice()
          : Array.from(currentOptions || []);

        // Avoid duplicates
        if (optsArray.includes(trimmed)) return;

        const updatedOptions = [...optsArray, trimmed];

        const out = {
          ...cur,
          poll: {
            ...(poll || {}),
            options: updatedOptions,
          },
        };

        state[k] = out;
      });
    },

    composePollOptionChange: (key, index, title) => {
      set((state) => {
        if (!title || typeof title !== "string") return;
        if (typeof index !== "number" || index < 0) return;
        const k = key || "default";
        const cur = state[k] || initialState.default;

        const currentOptions = getIn(cur.poll || {}, ["options"]) || [];
        const optsArray = Array.isArray(currentOptions)
          ? currentOptions.slice()
          : Array.from(currentOptions || []);

        if (index >= optsArray.length) return; // invalid index

        const trimmed = title.trim();
        if (trimmed.length === 0) return;

        if (optsArray[index] === trimmed) return; // no change

        optsArray[index] = trimmed;

        state[k] = {
          ...cur,
          poll: {
            ...(cur.poll || {}),
            options: optsArray,
          },
        };
      });
    },

    composePollOptionRemove: (key, title) => {
      set((state) => {
        if (!title || typeof title !== "string") return;
        const k = key || "default";
        const cur = state[k] || initialState.default;

        const currentOptions = getIn(cur.poll || {}, ["options"]) || [];
        const optsArray = Array.isArray(currentOptions)
          ? currentOptions.slice()
          : Array.from(currentOptions || []);

        const updatedOptions = optsArray.filter((o) => o !== title);

        // If nothing changed, don't update
        if (updatedOptions.length === optsArray.length) return;

        state[k] = {
          ...cur,
          poll: {
            ...(cur.poll || {}),
            options: updatedOptions,
          },
        };
      });
    },

    composePollSettingsChange: (key, expiresIn, isMultiple) => {
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        let changed = false;
        const poll = { ...(cur.poll || {}) };

        if (expiresIn !== undefined && expiresIn !== null) {
          poll.expires_in = expiresIn;
          changed = true;
        }

        if (typeof isMultiple === "boolean") {
          poll.multiple = isMultiple;
          changed = true;
        }

        if (!changed) return;

        state[k] = { ...cur, poll };
      });
    },

    composeAddToMentions: (key, account) => {
      set((state) => {
        if (!account) return;
        const k = key || "default";
        const cur = state[k] || initialState.default;

        const acct =
          typeof account === "string"
            ? account
            : (account?.acct ?? account?.id ?? null);
        if (!acct) return;

        // Prefer explicit mentions list if present, otherwise fall back to `to` directly
        const mentionsPath = ["to"];
        const current = getIn(cur, mentionsPath) || (mentionsPath.length === 2 ? new Set() : []);

        if (current instanceof Set) {
          const next = new Set(current);
          next.add(acct);
          state[k] = { ...cur, to: next };
          return;
        }

        const arr = Array.isArray(current) ? current.slice() : Array.from(current || []);
        if (arr.includes(acct)) return;
        const updated = [...arr, acct];
        state[k] = { ...cur, to: updated };
      });
    },

    composeRemoveFromMentions: (key, account) => {
      set((state) => {
        if (!account) return;
        const k = key || "default";
        const cur = state[k] || initialState.default;

        const acct =
          typeof account === "string"
            ? account
            : (account?.acct ?? account?.id ?? null);
        if (!acct) return;

        const mentionsPath = ["to"];
        const current = getIn(cur, mentionsPath) || (mentionsPath.length === 2 ? new Set() : []);

        if (current instanceof Set) {
          if (!current.has(acct)) return;
          const next = new Set(current);
          next.delete(acct);
          state[k] = { ...cur, to: next };
          return;
        }

        const arr = Array.isArray(current) ? current.slice() : Array.from(current || []);
        const filtered = arr.filter((x) => x !== acct);
        if (filtered.length === arr.length) return;
        state[k] = { ...cur, to: filtered };
      });
    },

    composeSetGroupTimelineVisible: (key, groupTimelineVisible) => {
      // No-op if undefined (avoid accidental toggles). Coerce value to boolean.
      if (groupTimelineVisible === undefined) return;

      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = { ...cur, group_timeline_visible: Boolean(groupTimelineVisible) };
      });
    },

    fetchMeSuccess(me) {
      // Normalize/defensively read incoming `me` settings (may be Immutable-like)
      const settings = getIn(me, ['pleroma_settings_store', 'kollective-fe']) || {};
      const defaultPrivacy = settings?.defaultPrivacy ?? 'public';
      const defaultContentType = settings?.defaultContentType ?? 'text/plain';

      set((state) => {
        const k = 'default';
        const cur = state[k] || initialState.default;

        // Start with current compose defaults and apply any overrides
        let out = { ...cur };
        if (defaultPrivacy) out = { ...out, privacy: defaultPrivacy };
        if (defaultContentType) out = { ...out, content_type: defaultContentType };

        // Read persisted tag history via the Settings helper (use .get(id))
        const storedTags = (me && me.id) ? (tagHistory.get(me.id) || []) : [];
        out = { ...out, tagHistory: storedTags };

        // Make the returned compose state shallow-immutable when possible
        try {
          state[k] = Object.freeze(out);
        } catch {
          state[k] = out;
        }
      });
    },

    patchMeSuccess(me) {
      // Normalize/defensively read incoming `me` settings (may be Immutable-like)
      const settings = getIn(me, ['pleroma_settings_store', 'kollective-fe']) || {};
      const defaultPrivacy = settings?.defaultPrivacy ?? 'public';
      const defaultContentType = settings?.defaultContentType ?? 'text/plain';

      set((state) => {
        const k = 'default';
        const cur = state[k] || initialState.default;

        // Start with current compose defaults and apply any overrides
        let out = { ...cur };
        if (defaultPrivacy) out = { ...out, privacy: defaultPrivacy };
        if (defaultContentType) out = { ...out, content_type: defaultContentType };

        // Read persisted tag history via the Settings helper (use .get(id))
        const storedTags = (me && me.id) ? (tagHistory.get(me.id) || []) : [];
        out = { ...out, tagHistory: storedTags };

        // Make the returned compose state shallow-immutable when possible
        try {
          state[k] = Object.freeze(out);
        } catch {
          state[k] = out;
        }
      });
    },

    changeSetting: (key, path, value) => {
      set((state) => {
        const k = "default";
        const pathString = path.join(',');
        const cur = state[k] || initialState.default;
        let out;
        switch (pathString) {
          case 'defaultPrivacy':
            out = { ...cur, privacy: value };
            break;
          case 'defaultContentType':
            out = { ...cur, content_type: value };
            break;
          default:
            break;
        }
        state[k] = out;
      });
    },

    composeEditorStateSet: (key, editorState) => {
      // Ignore undefined (no-op). Allow `null` to explicitly clear editor state.
      if (editorState === undefined) return;

      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        state[k] = { ...cur, editorState: editorState === null ? null : editorState };
      });
    },

    eventComposeCancel: (key) => {
      set((state) => {
        const k = key || "event-compose-modal";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          text: "" 
        };
      });
    },

    eventformSet: (key, text) => {
      set((state) => {
        const k = key || "event-compose-modal";
        const cur = state[k] || initialState.default;
        state[k] = {
          ...cur,
          text: text,
        };
      });
    },
    
    composeChangeMediaOrder: (key, a, b) => {
      // a and b may be indexes (numbers) or attachment ids (strings/numbers)
      set((state) => {
        const k = key || "default";
        const cur = state[k] || initialState.default;
        const current = Array.isArray(cur.media_attachments)
          ? cur.media_attachments.slice()
          : Array.from(cur.media_attachments || []);

        if (!current || current.length === 0) return;

        const getId = (item) => (item && (item.id ?? getProp(item, "id")));

        const findIndex = (val) => {
          if (typeof val === "number") {
            return val >= 0 && val < current.length ? val : -1;
          }
          return current.findIndex((it) => getId(it) === val);
        };

        const indexA = findIndex(a);
        const indexB = findIndex(b);

        if (indexA < 0 || indexB < 0 || indexA === indexB) return;

        // Remove item from indexA
        const [item] = current.splice(indexA, 1);

        // If we removed an earlier element, adjust target index
        const targetIndex = indexB > indexA ? indexB - 1 : indexB;

        // Insert at targetIndex
        current.splice(targetIndex, 0, item);

        state[k] = { ...cur, media_attachments: current };
      });
    },

    setComposeToStatus(status, rawText, spoilerText, contentType, withRedraft) {
      this.composeSetStatus(
        "compose-modal",
        status,
        rawText,
        true, //explicitAddressing //TODO: check later
        spoilerText,
        contentType,
        withRedraft,
      );
    },

    async replyCompose(status) {
      const root = rootGet();
      const { explicitAddressing } = getFeatures();
      const preserveSpoilers = root.settings.getSettings()["preserveSpoilers"];
      const account = selectOwnAccount(root);

      if (!account) return;

      root.compose.composeReply(
        "compose-modal",
        status,
        account,
        explicitAddressing,
        preserveSpoilers,
      );

      root.modal.openModalAction("COMPOSE");
    },

    async quoteCompose(status) {
      const root = rootGet();
      const { explicitAddressing } = getFeatures();
      const account = selectOwnAccount(root);

      if (!account) return;

      root.compose.composeQuote(
        "compose-modal", 
        status,
        selectOwnAccount(root),
        explicitAddressing
      );

      root.modal.openModalAction("COMPOSE");  
    },

    groupComposeModal(group) {
      const root = rootGet();
      const composeId = `group:${group.id}`;

      root.compose.groupComposePost(
        "compose-modal",
        group.id
      );

      root.modal.openModalAction("COMPOSE", { composeId });

    },

    mentionCompose(account) {
      const root = rootGet();

      root.compose.composeMention(
        "compose-modal",
        "",
        account
      );

      root.modal.openModalAction("COMPOSE");  
    },

    directCompose(account) {
      const root = rootGet();

      root.compose.composeDirect(
        "compose-modal",
        "",
        account
      );

      root.modal.openModalAction("COMPOSE");  
    },

    directComposeById(accountId) {
      const root = rootGet();
      const account = selectAccount(root, accountId);
      if (!account) return;

      root.compose.composeDirect(
        "compose-modal",
        "",
        account
      );

      root.modal.openModalAction("COMPOSE");
    },

   insertIntoTagHistory(composeId, recognizedTags, text) {
      const root = rootGet();
      const oldHistory = root.compose[composeId]?.tagHistory || [];
      const me = root.auth.me;
      const names = recognizedTags.filter(
        tag => text.match(new RegExp(`#${tag.name}`, 'i'))
      ).map(tag => tag.name);

      const intersectedOldHistory = oldHistory.filter(name => names.findIndex(newName => newName.toLowerCase() === name.toLowerCase()) === -1);

      names.push(...intersectedOldHistory.toJS());

      const newHistory = names.slice(0, 1000);

      tagHistory.set(me, newHistory);

      this.composeTagHistoryUpdate(
        composeId,
        newHistory
      );
   },
      
    handleComposeSubmit(composeId, data, status, _edit) {
      this.insertIntoTagHistory(
        composeId,
        data.tags || [],
        status
      );

      this.composeSubmitSuccess(
        composeId,
        { ...data }
      );

      //TODO: add toast notification
    },

    needsDescriptions(composeId) {
      const root = rootGet();
      const media = this.compose[composeId]?.media_attachments || [];
      const missingDescriptionModal = root.getSettings()?.["missingDescriptionModal"];

      const hasMissing = media.filter(item => !item.description).length > 0;

      return hasMissing && missingDescriptionModal;
    },

    validateSchedule(composeId) {
      const compose = this.compose[composeId];
       const schedule = compose?.schedule;
      if (!compose || !compose.schedule) return true;

      const fiveMinutesFromNow = new Date(new Date().getTime() + 300000);

      return schedule.getTime() > fiveMinutesFromNow.getTime();
    },

    submitCompose(composeId, opts) {
      const root = rootGet();
      const { history, force = false } = opts;
      if (!isLoggedIn(root)) {
        return;
      }

      const compose = this.compose[composeId];
      if (!compose) return;

      const status   = compose.text;
      const media    = compose.media_attachments;
      const statusId = compose.id;
      let to         = compose.to;

      if (!this.validateSchedule(composeId)) {
        //TODO: show toast notification
        return;
      }

      if (!force && this.needsDescriptions(composeId)) {
        root.modal.openModalAction("MISSING_DESCRIPTION", { 
          onContinue: () => {
            root.modal.closeModalAction("MISSING_DESCRIPTION");
            root.compose.submitCompose(composeId, { history, force: true });
          }
        });
        return;
      }

      const mentions = status.match(/(?:^|\s)@([^@\s]+(?:@[^@\s]+)?)/gi);

      if (mentions) {
        to = to.union(mentions.map(mention => mention.trim().slice(1)));
      }

      this.composeSubmitRequest(
        composeId
      );

      root.modal.closeModal();

      const idempotencyKey = compose.idempotencyKey;

      const params= {
        status,
        in_reply_to_id: compose.in_reply_to,
        quote_id: compose.quote,
        media_ids: media.map(item => item.id),
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
        params.group_timeline_visible = compose.group_timeline_visible; // Truth Social
      }

      return root.statuses.createStatus(params, idempotencyKey, statusId)
        .then((data) => {
          if (!statusId && data.visibility === 'direct' && rootGet().conversations.mounted <= 0 && history) {
            history.push('/messages');
          }
          this.handleComposeSubmit(
            composeId,
            data,
            status,
            !!statusId
          );
        })
        .catch(() => {
          this.composeSubmitFail(
            composeId
          );
        });
    },

    uploadCompose(composeId, files, intl) {
      const root = rootGet();
      if (!isLoggedIn(root)) {
        return;
      }
      
      if (!files || files.length === 0) {
        return;
      }

      const attachmentLimit = 4;//TOCDO: check later
      const media  = this.compose[composeId]?.media_attachments;
      const progress = new Array(files.length).fill(0);
      const mediaCount = media ? media.length : 0;

      if (files.length + mediaCount > attachmentLimit) {
        //TODO: add toast
        return;
      }

      this.composeUploadRequest(
        composeId
      );

      Array.from(files).forEach((f, i) => {
        if (mediaCount + i > attachmentLimit - 1) return;

        root.media.uploadFile(
          f,
          intl,
          (data) => this.composeUploadSuccess(composeId, data, f)),
          (error) => {
            console.error(error);
            this.composeUploadFail(composeId, error);
          },
          (e) => {
            progress[i] = e.loaded;
            this.composeUploadProgress(composeId, progress.reduce((a, v) => a + v, 0), e.total);
          }
      });
    },

    changeUploadCompose(composeId, id, params) {
      const root = rootGet();
      if (!isLoggedIn(root)) {
        return;
      }

      this.composeUploadChangeRequest(
        composeId
      );

      root.media.updateMedia(
        id,
        params
      ).then((response) => {
        return response.json()
      }).then((data) => {
        this.composeUploadChangeSuccess(composeId, data);
      }).catch((error) => {
        console.error(error);
        this.composeUploadChangeFail(composeId, error);
      });
    },

    clearComposeSuggestions(composeId) {
      this.composeSuggestionsClear(composeId);
    },

    fetchComposeSuggestionsAccounts: throttle(async function (composeId, token) {
      cancelFetchComposeSuggestions?.abort();
      const root = rootGet();
      try {
        const response = await fetch(`/api/v1/accounts/search`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: cancelFetchComposeSuggestions?.signal,
          searchParams: {
            q: token.slice(1),
            resolve: false,
            limit: 10,
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        root.importer.importFetchedAccounts(data);
        this.composeSuggestionsReady(composeId, token, data);
      } catch (error) {
          if (error.name === 'AbortError') {
              // TODO: add toast later
              return;
          }
          console.error('Error fetching compose suggestions accounts:', error);
      }
    }, 200),

    fetchComposeSuggestionsEmojis(composeId, token, customEmojis) {
      const results = emojiSearch(token.replace(':', ''), { maxResults: 10 }, customEmojis);

      this.composeSuggestionsReady(
        composeId,
        token,
        results
      );
    },

    async fetchComposeSuggestionsTags(composeId, token) {
      const root = rootGet();
      cancelFetchComposeSuggestions?.abort();

      const { trends } = getFeatures();
      if (trends) {
        const currentTrends = root.trends.items;
        this.composeSuggestionTagsUpdate(
          composeId,
          token,
          currentTrends
        );
        return;
      }

      try {
        const response = await fetch(`/api/v1/search`, {
          method: 'GET',  
          headers: {
            'Content-Type': 'application/json',
          },
          signal: cancelFetchComposeSuggestions?.signal,
          searchParams: {
            q: token.slice(1),
            limit: 10,
            type: 'hashtags',
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const _data = await response.json();
        // TODO: use _data
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error name: ${error.name}, message: ${error.message}`);
          //toast.showAlertForError(error);
        } else {
          console.error('An unknown error occurred while fetching compose suggestions tags.');
        }
      }
    },

    fetchComposeSuggestions(composeId, token, customEmojis) {
      const firstChar = token.charAt(0);
      if (firstChar === '@') {
        this.fetchComposeSuggestionsAccounts(composeId, token);
      } else if (firstChar === ':') {
        this.fetchComposeSuggestionsEmojis(composeId, token, customEmojis);
      } else if (firstChar === '#') {
        this.fetchComposeSuggestionsTags(composeId, token);
      } else {
        this.fetchComposeSuggestionsAccounts(composeId, token);
      } 
    },

    selectCompositionSuggestion(composeId, position, token, suggestion, path) {
      const root = rootGet();
      let completion = '', startPosition = position;

      if (typeof suggestion === 'object' && suggestion.id) {
        completion    = isNativeEmoji(suggestion) ? suggestion.native : suggestion.colons;
        startPosition = position - 1;

        root.emojis.chooseEmoji(suggestion);
      } else if (typeof suggestion === 'string' && suggestion[0] === '#') {
        completion    = suggestion;
        startPosition = position - 1;
      } else if (typeof suggestion === 'string') {
        completion    = selectAccount(root, suggestion).acct;
        startPosition = position;
      }

      this.composeSuggestionSelect(
        composeId,
        startPosition,
        token,
        completion,
        path
      );
    },

    openComposeWithText(composeId, text) {
      const root = rootGet();
      this.resetCompose(composeId);
      root.modal.openModalAction("COMPOSE");
      this.composeChange(composeId, text);
    },

    addToMentions(composeId, accountId) {
      const root = rootGet();
      const account = selectAccount(root, accountId);
      if (!account) return;
      this.composeAddToMentions(
        composeId,
        account.acct
      );
    },

    removeFromMentions(composeId, accountId) {
      const root = rootGet();
      const account = selectAccount(root, accountId);
      if (!account) return;
      this.composeRemoveFromMentions(
        composeId,
        account.acct
      );
    },

    eventDiscussionCompose(composeId, status) {
      const root = rootGet();
      const { explicitAddressing } = getFeatures();

      this.composeEventReply(
        composeId,
        status,
        selectOwnAccount(root),
        explicitAddressing
      );
    },

    setEditorState(composeId, editorState) {
      this.composeEditorStateSet(
        composeId,
        editorState
      );
    },

    changeMediaOrder(composeId, a, b) {
      this.composeChangeMediaOrder(
        composeId,
        a,
        b
      );
    }

  };
};
