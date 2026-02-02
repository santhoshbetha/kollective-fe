//=============================================
// src/features/settings/api/useSettings.js
export const usePreferences = () => useQuery({
  queryKey: ['settings', 'preferences'],
  queryFn: () => api.get('/api/v1/preferences').then(res => res.data),
  staleTime: Infinity,
});
/*
const StatusCard = ({ status }) => {
  const { data: prefs } = usePreferences();
  // Initialize 'showContent' to true if user preference says so, else false
  const [showContent, setShowContent] = useState(prefs?.['reading:expand:spoilers'] || false);

  if (status.spoiler_text && !showContent) {
    return (
      <div className="cw-box">
        <p>Warning: {status.spoiler_text}</p>
        <button onClick={() => setShowContent(true)}>Show more</button>
      </div>
    );
  }

  return <div>{status.content}</div>;
};

*/
//=============================================
