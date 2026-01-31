import { normalizeLocation } from "../../normalizers/location";

// Locations slice: stores normalized location records and a current pointer.
export const createLocationsSlice = (
  setScoped,
  getScoped,
  rootSet,
  rootGet,
) => {
  return {
    // Immer allows direct mutation of the state draft
    locationSearchSuccess(locations) {
      setScoped((state) => {
        locations.forEach((location) => {
          // Using origin_id as the unique key per your requirement
          state[location.origin_id] = normalizeLocation(location);
        });
      });
    },
  };
};

export default createLocationsSlice;
