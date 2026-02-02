Folder Structure:

src/ Directory Structure

    api/
        client.js: Your base Axios/Fetch configuration with interceptors for Auth tokens.
        queryClient.js: The global QueryClient setup (Persisters, Default Retry, and Focus logic).
    components/ (Shared/Global UI)
        ui/: Atomic elements (Buttons, Inputs, Spinners).
        OfflineBanner.jsx: The Online Status observer we built.
        NotificationPermissionPrompt.jsx: Permission handling.
    features/ (The heart of the app)
        statuses/
            api/: useTimeline.js, useStatusActions.js, useStatusDetail.js.
            components/: StatusCard.jsx, Timeline.jsx.
            utils/: cacheHelpers.js (The updatePostInPages logic).
        accounts/
            api/: useAccount.js, useRelationships.js, useAccountActions.js.
            components/: ProfileHeader.jsx, FollowButton.jsx.
            schemas/: accountSchema.js (Zod validation).
        notifications/
            api/: useNotifications.js, useMarkers.js.
            hooks/: useNotificationOrchestrator.js (Background polling).
        events/
            api/: useEvents.js, useEventActions.js.
            store/: useParticipationStore.js (Zustand modal state).
            components/: EventCalendar.jsx, JoinButton.jsx.
        search/
            api/: useSearch.js, useTrends.js.
    hooks/ (Global UI Hooks)
    * useIdleTimer.js: Polling control.
    * useOnlineStatus.js: The "Back Online" sync toast logic.
    stores/ (Global Client State)
        useAuthStore.js: Zustand + Persist for login tokens.
        useSettingsStore.js: Theme and UI preferences.
    utils/
        apiUtils.js: extractMaxIdFromLink, chunkArray.
        statusUtils.js: simulateEmojiReact.

==========================================================
npm install @tanstack/react-query-broadcast-query-client-experimental -- issue with this try later
==========================================================

1. Imports: Search your project for useSelector and useDispatch. If any remain, they must be
   converted to your new feature hooks (e.g., useMe() or useTimeline()).
2. Prop Drilling: Look for components where you were passing down large "Status" or "Account" 
   objects just to avoid Redux overhead; you can now use your TanStack Hooks directly in child 
   components without performance loss.
3. Service Worker: Ensure your sw.js is updated to cache TanStack Query results if you are using the
offline persister.