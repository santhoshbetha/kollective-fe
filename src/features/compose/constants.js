export const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  // Add more as needed based on Mastodon API support
];
export const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public', icon: 'fa-globe' },
  { value: 'friends', label: 'Friends', icon: 'fa-user-friends' },
  { value: 'private', label: 'Followers-only', icon: 'fa-lock' },
  { value: 'unlisted', label: 'Unlisted', icon: 'fa-unlock' },
  { value: 'direct', label: 'Direct', icon: 'fa-envelope' },
];

export const CONTENT_WARNING_OPTIONS = [
  { value: false, label: 'None' },
  { value: true, label: 'Add Warning', icon: 'fa-exclamation-triangle' },
];

