import { createSelector as createReselectSelector } from 'reselect';
import { isLoggedIn } from '../../utils/auth';
import { getIn, setIn } from '../../utils/immutableSafe';
import messages from '../../messages';
import { defineMessage } from 'react-intl';

const saveSuccessMessage = defineMessage({ id: 'settings.save.success', defaultMessage: 'Your preferences have been saved!' });

export const defaultSettings = Object.freeze({
  onboarded: false,
  skinTone: 1,
  reduceMotion: false,
  underlineLinks: false,
  autoPlayGif: true,
  displayMedia: 'default',
  expandSpoilers: false,
  unfollowModal: false,
  boostModal: false,
  deleteModal: true,
  missingDescriptionModal: false,
  defaultPrivacy: 'public',
  defaultContentType: 'text/plain',
  themeMode: 'system',
  locale: (typeof navigator !== 'undefined' && navigator.language) || 'en',
  showExplanationBox: true,
  explanationBox: true,
  autoloadTimelines: true,
  autoloadMore: true,
  preserveSpoilers: false,

  systemFont: false,
  demetricator: false,

  isDeveloper: false,

  chats: {
    panes: [],
    mainWindow: 'minimized',
    sound: true,
  },

  home: {
    shows: {
      reblog: true,
      reply: true,
      direct: false,
    },
    regex: {
      body: '',
    },
  },

  notifications: {
    alerts: {
      follow: true,
      follow_request: false,
      favourite: true,
      reblog: true,
      mention: true,
      poll: true,
      move: true,
      'pleroma:emoji_reaction': true,
    },

    quickFilter: {
      active: 'all',
      show: true,
      advanced: false,
    },

    shows: {
      follow: true,
      follow_request: true,
      favourite: true,
      reblog: true,
      mention: true,
      poll: true,
      move: true,
      'pleroma:emoji_reaction': true,
    },

    sounds: {
      follow: false,
      follow_request: false,
      favourite: false,
      reblog: false,
      mention: false,
      poll: false,
      move: false,
      'pleroma:emoji_reaction': false,
    },

    birthdays: {
      show: true,
    },
  },

  community: {
    shows: {
      reblog: false,
      reply: true,
      direct: false,
    },
    other: {
      onlyMedia: false,
    },
    regex: {
      body: '',
    },
  },

  public: {
    shows: {
      reblog: true,
      reply: true,
      direct: false,
    },
    other: {
      onlyMedia: false,
    },
    regex: {
      body: '',
    },
  },

  direct: {
    regex: {
      body: '',
    },
  },

  account_timeline: {
    shows: {
      reblog: true,
      pinned: true,
      direct: false,
    },
  },

  groups: {},

  trends: {
    show: true,
  },

  columns: [
    { id: 'COMPOSE', uuid: crypto.randomUUID(), params: {} },
    { id: 'HOME', uuid: crypto.randomUUID(), params: {} },
    { id: 'NOTIFICATIONS', uuid: crypto.randomUUID(), params: {} },
  ],

  remote_timeline: {
    pinnedHosts: [],
  },
});

function mergeDeep(defaultObj, overrideObj) {
  if (!overrideObj || typeof overrideObj !== 'object') return defaultObj;
  const out = Array.isArray(defaultObj) ? [] : {};
  const keys = new Set([
    ...Object.keys(defaultObj || {}),
    ...Object.keys(overrideObj || {}),
  ]);
  for (const k of keys) {
    const dv = defaultObj ? defaultObj[k] : undefined;
    const ov = overrideObj ? overrideObj[k] : undefined;
    if (
      dv && typeof dv === 'object' && !Array.isArray(dv) &&
      ov && typeof ov === 'object' && !Array.isArray(ov)
    ) {
      out[k] = mergeDeep(dv, ov);
    } else if (ov !== undefined) {
      out[k] = ov;
    } else {
      out[k] = dv;
    }
  }
  return out;
}

// Reselect memoized selector: pass `settingsSelector` to `useStore(settingsSelector)`
// const settings = useStore(settingsSelector);
export const settingsSelector = createReselectSelector(
  (state) => (state && state.settings) || {},
  (persisted) => mergeDeep(defaultSettings, persisted),
);

export function createSettingsSlice(setScoped, getScoped, rootSet, rootGet) {
  const set = setScoped;
  return {
    setNotificationsFilter(path, value) {
      set((state) => {
        setIn(state, path, value);
        state.saved = false;
      });
    },

    setSearchFilter(path, value) {
      set((state) => {
        setIn(state, path, value);
        state.saved = false;
      });
    },

    changeSetting(path, value) {
      set((state) => {
        setIn(state, path, value);
        state.saved = false;
      });
    },

    chooseEmoji(emoji) {
      // TODO: debounce save
      set((state) => {
        state.frequentlyUsedEmojis = state.frequentlyUsedEmojis || [];
        const existingIndex = state.frequentlyUsedEmojis.findIndex(
          (e) => e.id === emoji.id,
        );
        if (existingIndex !== -1) {
          state.frequentlyUsedEmojis.splice(existingIndex, 1);
        }
        state.frequentlyUsedEmojis.unshift(emoji);
        if (state.frequentlyUsedEmojis.length > 20) {
          state.frequentlyUsedEmojis.pop();
        }
        state.saved = false;
      });
    },

    saveSetting() {
      set((state) => {
        state.saved = true;
      });
    },

    updateSettings(settings) {
      // Return a frozen deep-cloned plain JS object (defensive copy)
      try {
        return Object.freeze(JSON.parse(JSON.stringify(settings)));
      } catch {
        return Object.freeze(settings);
      }
    },

    getSettingsAction() {
      const scoped = getScoped();
      const persisted = (scoped && scoped.settings) || {};
      return mergeDeep(defaultSettings, persisted);
    },

    // Backwards-compatible alias used by other slices
    getSettings() {
      return this.getSettingsAction();
    },

    changeSettingImmediate(path, value, opts) {
      const root = rootGet();
      root.compose.changeSetting(path, value);
      this.changeSetting(path, value);
      this.saveSettingsImmediate(opts)
    },

    changeSettingAction(path, value, opts) {
      const root = rootGet();
      root.compose.changeSetting(path, value);
      this.changeSetting(path, value);
      this.saveSettingsAction(opts);
    },

    saveSettingsImmediate(opts) {
      const root = rootGet();
      if (!isLoggedIn(root)) return;

      if (getIn(this.getSettings(), ['saved'])) return;
      // Build plain JS settings and remove transient flags
      const settingsToSave = this.getSettingsAction();
      try {
        if (settingsToSave && typeof settingsToSave === 'object') {
          // don't send the `saved` flag
          if (Object.prototype.hasOwnProperty.call(settingsToSave, 'saved')) {
            delete settingsToSave.saved;
          }
        }

        // Patch the user's settings on the server
        root.me.patchMe({ settings: settingsToSave }, opts).then(() => {
          this.saveSetting();
          if (opts?.showAlert) {
            // toast.success(saveSuccessMessage);
          }
        }).catch((err) => {
          console.error('Failed to save settings (patchMe rejected)', err);
        });
      } catch (err) {
        console.error('Failed to save settings:', err);
      }

    },

    saveSettingsAction(opts) {
      const root = rootGet();
      root.compose.saveSettings(opts);
      this.saveSetting();
    },

    getLocale(fallback = 'en') {
      const settings = this.getSettingsAction() || {};
      const localeWithVariant = String(settings.locale || fallback).replace('_', '-');
      const locale = localeWithVariant.split('-')[0];
      const fallbackLocale = Object.keys(messages).includes(locale) ? locale : fallback;
      return Object.keys(messages).includes(localeWithVariant) ? localeWithVariant : fallbackLocale;
    }
  };
}

/*
how to apply createSelector for an action function -- me
Thinking ..
That is an excellent question that highlights a key difference between selecting
state and accessing actions in Zustand.
You don't apply createSelector (or memoization) to an action function itself. 
Memoization is only needed for selectors that derive computed state from existing state, 
to prevent re-computation or unnecessary component re-renders.
Action functions (like fetchChatsV1 or addBear) are stable functions that you define once 
within the store definition. They don't change identity on every state update, 
so there is nothing to memoize.
*/
