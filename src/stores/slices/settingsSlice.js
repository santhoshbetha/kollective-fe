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
      'kollective:emoji_reaction': true,
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
      'kollective:emoji_reaction': true,
    },

    sounds: {
      follow: false,
      follow_request: false,
      favourite: false,
      reblog: false,
      mention: false,
      poll: false,
      move: false,
      'kollective:emoji_reaction': false,
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
  (state) => state?.settings || {},
  (persisted) => mergeDeep(defaultSettings, persisted),
);

export function createSettingsSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

  // Helper to deep-set values in Immer draft without using setIn
  const setPathValue = (draft, path, value) => {
    let current = draft;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
  };

  return {

    changeSetting(path, value) {
      setScoped((state) => {
        setPathValue(state, path, value);
        state.saved = false;
      });
    },

    setNotificationsFilter(path, value) {
      getActions().changeSetting(path, value);
    },

    setSearchFilter(path, value) {
      getActions().settings.changeSetting(path, value);
    },

    chooseEmoji(emoji) {
      setScoped((state) => {
        state.frequentlyUsedEmojis = state.frequentlyUsedEmojis || [];
        const idx = state.frequentlyUsedEmojis.findIndex((e) => e.id === emoji.id);
        if (idx !== -1) state.frequentlyUsedEmojis.splice(idx, 1);
        
        state.frequentlyUsedEmojis.unshift(emoji);
        if (state.frequentlyUsedEmojis.length > 20) state.frequentlyUsedEmojis.pop();
        state.saved = false;
      });
    },

    saveSetting() {
      setScoped((state) => { state.saved = true; });
    },

    getSettings() {
      const persisted = getScoped() || {};
      return mergeDeep(defaultSettings, persisted);
    },

    getLocale(fallback = 'en') {
      const actions = getActions();
      const settings = actions.getSettings();
      const variant = String(settings.locale || fallback).replace('_', '-');
      const base = variant.split('-')[0];
      const finalFallback = messages[base] ? base : fallback;
      return messages[variant] ? variant : finalFallback;
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

    changeSettingImmediate(path, value, opts) {
      const actions = getActions();
      actions.changeSetting(path, value);
      this.changeSetting(path, value);
      this.saveSettingsImmediate(opts)
    },

    changeSettingAction(path, value, opts) {
      const actions = getActions();
      actions.changeSetting?.(path, value);
      actions.changeSetting(path, value);
      actions.saveSettingsAction(opts);
    },

    async saveSettingsImmediate(opts) {
      const actions = getActions();
      if (!isLoggedIn(rootGet())) return;

      const currentSettings = actions.getSettings();
      if (currentSettings.saved) return;

      // Prepare payload (clone and remove transient flags)
      const { saved, ...settingsToSave } = currentSettings;

      try {
        await actions.patchMe({ settings: settingsToSave }, opts);
        actions.saveSetting();
        // if (opts?.showAlert) toast.success(saveSuccessMessage);
      } catch (err) {
        console.error('Settings save failed', err);
      }
    },

    saveSettingsAction(opts) {
      const actions = getActions();
      actions.saveSettings?.(opts);
      actions.saveSetting();
    },

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
