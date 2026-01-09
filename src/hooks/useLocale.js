
import useBoundStore from '../stores/boundStore';

/** Locales which should be presented in right-to-left. */
const RTL_LOCALES = ['ar', 'ckb', 'fa', 'he'];

/** Get valid locale from settings. */
const useLocale = (fallback = 'en') => {
  const locale = useBoundStore((state) => state.settings.getLocale(state, fallback));

  const direction = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';

  return {
    locale,
    direction,
  };
};

export { useLocale };
