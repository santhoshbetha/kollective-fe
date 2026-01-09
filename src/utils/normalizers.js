import z from "zod";
/** Use new value only if old value is undefined */
export const mergeDefined = (oldVal, newVal) =>
  oldVal === undefined ? newVal : oldVal;

/**
 * Normalize entity ID into a string or `null`.
 * Accepts plain primitives, numbers, Immutable-like objects (with `toJS`/`get`),
 * and common shapes. Returns `null` for invalid/empty ids.
 */
export const normalizeId = (id) => {
  return z.string().nullable().catch(null).parse(id);
};

/**
 * Allows using any legacy normalizer function as a zod schema.
 *
 * @example
 * ```ts
 * const statusSchema = toSchema(normalizeStatus);
 * statusSchema.parse(status);
 * ```
 */
export const toSchema = (normalizer) => {
  return z.custom().transform(normalizer);
};

/** Legacy normalizer transition helper function. */
import { asPlain } from "./immutableSafe";

export const maybeFromJS = (value) => {
  return asPlain(value);
};
