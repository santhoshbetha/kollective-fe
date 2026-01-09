export default class Settings {

  constructor(keyBase = null) {
    this.keyBase = keyBase;
  }

  generateKey(id) {
    return this.keyBase ? [this.keyBase, `id${id}`].join('.') : String(id);
  }

  set(id, data) {
    const key = this.generateKey(id);
    const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : null;
    if (!storage) return null;
    try {
      const encodedData = JSON.stringify(data);
      storage.setItem(key, encodedData);
      return data;
    } catch {
      return null;
    }
  }

  get(id) {
    const key = this.generateKey(id);
    const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : null;
    if (!storage) return null;
    try {
      const rawData = storage.getItem(key);
      return rawData ? JSON.parse(rawData) : null;
    } catch {
      return null;
    }
  }

  remove(id) {
    const key = this.generateKey(id);
    const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : null;
    const prev = this.get(id);
    if (!storage) return prev;
    try {
      storage.removeItem(key);
    } catch {
      // Do nothing
    }
    return prev;
  }
}

/** Remember push notification settings. */
export const pushNotificationsSetting = new Settings('push_notification_data');

/** Remember hashtag usage. */
export const tagHistory = new Settings('tag_history');

/** Remember group usage. */
export const groupSearchHistory = new Settings('group_search_history');