import { normalizeAttachment } from "../../normalizers/attachment";
import { normalizeLocation } from "../../normalizers/location";

const getInitialState = () => ({
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
});

export const createComposeEventSlice = (
  setScoped /* get, rootSet, rootGet */,
) => {
  return {
    ...getInitialState(),

    editEventName(value) {
      setScoped((state) => { state.name = value; });
    },

    editEventDescription(value) {
      setScoped((state) => { state.status = value; });
    },

    editStartTime(value) {
      setScoped((state) => { state.start_time = value; });
    },

    editEndTime(value) {
      setScoped((state) => { state.end_time = value; });
    },

    setHasEndTime() {
      setScoped((state) => {
        // Standard JS Date manipulation
        const endTime = new Date(state.start_time);
        endTime.setHours(endTime.getHours() + 2);
        state.end_time = endTime;
      });
    },

    editEventApprovalRequired(value) {
      setScoped((state) => { state.approval_required = value; });
    },

    editEventLocation(value) {
      setScoped((state) => { state.location = value; });
    },

    eventBannerUploadRequest() {
      setScoped((state) => { state.is_uploading = true; });
    },

    eventBannerUploadSuccess(media) {
      setScoped((state) => {
        state.banner = normalizeAttachment(media);
        state.is_uploading = false;
      });
    },

    eventBannerUploadFail() {
      setScoped((state) => { state.is_uploading = false; });
    },

    eventBannerUploadProgress(loaded) {
      setScoped((state) => { 
        state.progress = loaded * 100; 
      });
    },

    eventSubmitRequest() {
      setScoped((state) => { state.is_submitting = true; });
    },

    eventSubmitSuccess() {
      setScoped((state) => { state.is_submitting = false; });
    },

    eventSubmitFail() {
      setScoped((state) => { state.is_submitting = false; });
    },

    eventComposeCancel() {
      // Immer makes resetting state extremely easy
      setScoped((state) => {
        const reset = getInitialState();
        Object.assign(state, reset);
      });
    },

    // Build an initial event object (Pure function)
    eventFromSet(status, text, location) {
      return {
        ...getInitialState(),
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
