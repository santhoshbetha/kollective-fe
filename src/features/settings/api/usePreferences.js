// src/features/settings/api/usePreferences.js
export const usePreferences = () => useQuery({
  queryKey: ['settings', 'preferences'],
  queryFn: () => api.get('/api/v1/preferences').then(res => res.data),
  staleTime: Infinity, // Preferences don't change unless we update them
});

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPrefs) => api.patch('/api/v1/preferences', newPrefs),
    // Optimistically update the UI
    onMutate: async (newPrefs) => {
      await queryClient.cancelQueries({ queryKey: ['settings', 'preferences'] });
      const previous = queryClient.getQueryData(['settings', 'preferences']);
      queryClient.setQueryData(['settings', 'preferences'], (old) => ({ ...old, ...newPrefs }));
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['settings', 'preferences'], context.previous);
    }
  });
};

/*
const ThemeToggle = () => {
  const { theme, setTheme } = useSettingsStore();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
};

const PrivacyToggle = () => {
  const { data: prefs } = usePreferences();
  const { mutate: update } = useUpdatePreferences();

  return (
    <label>
      <input 
        type="checkbox" 
        checked={prefs?.['default:sensitive'] || false} 
        onChange={(e) => update({ 'default:sensitive': e.target.checked })}
      />
      Always mark media as sensitive
    </label>
  );
};

*/

/*
Zero-Latency UI: Changing a local setting (Theme) is instantaneous. 
Changing a server setting (Privacy) feels instant thanks to Optimistic Updates.
No Boilerplate: You don't need a settingsSlice case for every single toggle in the Mastodon API.
Automatic Persistence: Since the UI store is persisted via Zustand, the user's 
font size and theme are applied the microsecond the page loads, avoiding the "flash of unstyled content" (FOUC).
*/
