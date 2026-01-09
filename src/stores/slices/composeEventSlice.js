import { normalizeAttachment } from "../../normalizers/attachment";
import { normalizeLocation } from "../../normalizers/location";

const initialState = {
  name: "",
  status: "",
  location: null,
  start_time: new Date(),
  end_time: null,
  approval_required: false,
  banner: null,
  progress: 0,
  is_uploading: false,
  is_submitting: false,
  id: null,
};

export const createComposeEventSlice = (
  setScoped /* get, rootSet, rootGet */,
) => {
  return {
    ...initialState,

    editEventName(value) {
      setScoped((state) => {
        state.name = value;
      });
    },

    editEventDescription(value) {
      setScoped((state) => {
        state.status = value;
      });
    },

    editStartTime(value) {
      setScoped((state) => {
        state.start_time = value;
      });
    },

    editEndTime(value) {
      setScoped((state) => {
        state.end_time = value;
      });
    },

    setHasEndTime(/* value */) {
      setScoped((state) => {
        const endTime = new Date(state.start_time);
        endTime.setHours(endTime.getHours() + 2);
        state.end_time = endTime;
      });
    },

    editEventApprovalRequired(value) {
      setScoped((state) => {
        state.approval_required = value;
      });
    },

    editEventLocation(value) {
      setScoped((state) => {
        state.location = value;
      });
    },

    eventBannerUploadRequest() {
      setScoped((state) => {
        state.is_uploading = true;
      });
    },

    eventBannerUploadSuccess(media) {
      setScoped((state) => {
        state.banner = normalizeAttachment(media);
        state.is_uploading = false;
      });
    },

    eventBannerUploadFail() {
      setScoped((state) => {
        state.is_uploading = false;
      });
    },

    eventBannerUploadProgress(loaded) {
      setScoped((state) => {
        state.progress = loaded * 100;
      });
    },

    eventSubmitRequest() {
      setScoped((state) => {
        state.is_submitting = true;
      });
    },

    eventSubmitSuccess() {
      setScoped((state) => {
        state.is_submitting = false;
      });
    },

    eventSubmitFail() {
      setScoped((state) => {
        state.is_submitting = false;
      });
    },

    eventComposeCancel() {
      // Reset stored compose event state back to the initial values
      setScoped((state) => {
        Object.keys(initialState).forEach((k) => {
          state[k] = initialState[k];
        });
      });
    },

    // Build an initial event object from an existing status (pure — does not mutate store)
    eventFromSet(status, text, location) {
      return {
        ...initialState,
        name: status?.event?.name || "",
        status: text || "",
        start_time: status?.event?.start_time
          ? new Date(status?.event?.start_time)
          : new Date(),
        end_time: status?.event?.end_time
          ? new Date(status?.event?.end_time)
          : null,
        approval_required: status?.event?.join_mode !== "free",
        banner: status?.event?.banner || null,
        location: normalizeLocation(location) || null,
        progress: 0,
        is_uploading: false,
        is_submitting: false,
        id: status?.id || null,
      };
    },
  };
};
