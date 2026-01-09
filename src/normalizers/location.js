export const GeographicLocationRecord = {
  coordinates: null,
  srid: "",
};

export const LocationRecord = {
  url: "",
  description: "",
  country: "",
  locality: "",
  region: "",
  postal_code: "",
  street: "",
  origin_id: "",
  origin_provider: "",
  type: "",
  timezone: "",
  geom: null,
};
import { asPlain } from "../utils/immutableSafe";

const normalizeGeographicLocation = (location) => {
  const src = asPlain(location) || {};
  const geom = src.geom || null;
  if (!geom) return null;
  const g = asPlain(geom) || {};
  return {
    coordinates: g.coordinates ?? null,
    srid: g.srid ?? "",
  };
};

export const normalizeLocation = (location) => {
  const src = asPlain(location) || {};

  const geom = normalizeGeographicLocation(src);

  const normalized = {
    ...LocationRecord,
    ...src,
    geom: geom ?? null,
  };

  return Object.freeze(normalized);
};
