import { FormattedNumber } from 'react-intl';
import { z } from 'zod';

/** Check if a value is REALLY a number. */
export const isNumber = (value) => typeof value === 'number' && !isNaN(value);

/** The input is a number and is not NaN. */
export const realNumberSchema = z.coerce.number().refine(n => !isNaN(n));

export const secondsToDays = (seconds) => Math.floor(seconds / (3600 * 24));

const roundDown = (num) => {
  let v = Number(num);
  if (Number.isNaN(v)) return v;
  if (v >= 100 && v < 1000) {
    v = Math.floor(v);
  }

  const n = Number(v.toFixed(2));
  return n > v ? n - 1 / Math.pow(10, 2) : n;
};

/** Display a number nicely for the UI, eg 1000 becomes 1K. */
export const shortNumberFormat = (number, max) => {
  if (!isNumber(number)) return '•';

  let value = number;
  let factor = '';
  if (number >= 1000 && number < 1000000) {
    factor = 'k';
    value = roundDown(value / 1000);
  } else if (number >= 1000000) {
    factor = 'M';
    value = roundDown(value / 1000000);
  }

  if (max && value > max) {
    // eslint-disable-next-line formatjs/no-literal-string-in-jsx
    return <span>{max}+</span>;
  }

  return (
    <span>
      <FormattedNumber
        value={value}
        maximumFractionDigits={0}
        minimumFractionDigits={0}
        maximumSignificantDigits={3}
        numberingSystem='latn'
        style='decimal'
      />
      {factor}
    </span>
  );
};

/** Check if an entity ID is an integer (eg not a FlakeId). */
export const isIntegerId = (id) => {
  if (id == null) return false;
  if (typeof id === "number") return Number.isInteger(id);
  return /^-?[0-9]+$/.test(String(id));
};