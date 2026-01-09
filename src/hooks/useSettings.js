import { useMemo } from 'react';

import settingsSchema from '../schemas/settings';
import useBoundStore from '../stores/boundStore';
import { asPlain } from '../utils/immutableSafe';

/** Get the user settings from the store */
export const useSettings = () => {
  const getSettings = useBoundStore((state) => state.settings.getSettings);
  return useMemo(() => {
    const data = getSettings();
    const plain = asPlain(data) || {};
    return settingsSchema.parse(plain);
  }, [getSettings]);
};
