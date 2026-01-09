import { useFeatures } from './useFeatures.js';
import { useOwnAccount } from './useOwnAccount.js';
import { useSettings } from './useSettings.js';


/** Get a list of notifications for settings. */
export function useSettingsNotifications() {
  const notifications = new Set();

  const features = useFeatures();
  const { account } = useOwnAccount();
  const { dismissedSettingsNotifications } = useSettings();

  if (
    !dismissedSettingsNotifications.includes('needsNip05')
    && account
    && features.nip05
    && account.acct !== account.source?.nostr?.nip05
  ) {
    notifications.add('needsNip05');
  }

  return notifications;
}