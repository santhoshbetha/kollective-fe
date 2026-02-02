//To implement Haptic Feedback for mobile users in your Kollective-FE project, you utilize the Web Vibration API.
//This is particularly effective for Drag-and-Drop reordering and Optimistic Actions 
// (like Liking or Joining), giving the app a native "tactile" feel.
//1. Create a Haptic Utility
//Place this in src/utils/haptics.js. This ensures the app doesn't crash on browsers
//  that don't support vibration (like most desktop browsers).

export const triggerHaptic = (pattern = 10) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// Standard Social Patterns
export const HAPTIC_PATTERNS = {
  LIGHT: 10,       // Subtle tap (Selection)
  MEDIUM: 20,      // Noticeable tap (Drag start)
  SUCCESS: [10, 30, 10], // Double tap (Like/Join success)
  ERROR: [50, 50, 50],   // Heavy triple pulse
};
