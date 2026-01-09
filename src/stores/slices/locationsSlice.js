import { normalizeLocation } from "../../normalizers/location";

// Locations slice: stores normalized location records and a current pointer.
export const createLocationsSlice = (
  setScoped,
  getScoped,
  rootSet,
  rootGet,
) => {
  return {
    locationSearchSuccess(locations) {
      setScoped((state) => {
        locations.forEach((location) => {
          state[location.origin_id] = normalizeLocation(location);
        });
      });
    },
  };
};

export default createLocationsSlice;
