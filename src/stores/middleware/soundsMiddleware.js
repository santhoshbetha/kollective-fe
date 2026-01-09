import { play, soundCache } from '../../utils/sounds.js';

/**
 * Zustand middleware that exposes sound helpers on the store.
 * Usage: const useStore = create(soundsMiddleware((set, get, api) => ({ ... })))
 */
export const soundsMiddleware = (config) => (set, get, api) => {
  const playSound = (name) => {
    const audio = soundCache?.[name];
    if (!audio) return Promise.resolve();
    try {
      return play(audio);
    } catch (err) {
      return Promise.reject(err);
    }
  };


  // Provide helpers on the API and also merge into the returned state
  const extendedApi = { ...api, playSound, soundCache };

  const state = config(set, get, extendedApi) || {};

  return {
    ...state,
    // Expose as top-level helpers so callers can do `useStore.getState().playSound(name)`
    playSound,
    soundCache,
  };
};

export default soundsMiddleware;
