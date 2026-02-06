//Compose:
src/features/compose/
├── components/
│   ├── ComposeOptionPicker.tsx  <-- Generic (Replaces Privacy/Language/Poll selectors)
│   ├── AttachmentThumbnail.tsx  <-- Pure UI (Handles progress bar display)
│   └── ComposeForm.tsx          <-- The "View" (Uses hooks, minimal logic)
├── hooks/
│   ├── useCompose.ts            <-- Main state (Text, validation, submission)
│   └── useMediaUpload.ts        <-- Media logic (XHR tracking, file state)
├── constants.ts                 <-- Static data (LANG_OPTIONS, PRIVACY_OPTIONS)
└── index.tsx                    <-- Feature Entry Point

=====================================================================================================
Final Reduction Tally
By applying the steps we've covered today, you are essentially rebuilding Soapbox on a "Component-First" architecture:
Feature	                        Reduction Method	                       Files Deleted
Compose	                Generic Pickers & useMedia Hook	                 PrivacySelector, LanguageSelector, UploadUI
Timeline	            Generic Timeline & useTimeline Hook	             HomeTimeline, PublicTimeline, TagTimeline
Groups/Events	        EntityCard & Shared Action Hook	                 GroupHeader, EventCard, JoinButton
Notifications	        Generic NotificationItem	                     BoostNotification, FollowNotification, etc.
Settings	            useForm Hook	                                 All individual input components

//======================================================================================================
src/
├── components/          <-- The "Shared Library"
│   ├── Timeline.jsx     <-- Generic feed logic
│   ├── EntityCard.jsx   <-- Replaces UserCard, GroupCard, EventCard
│   ├── EventMap.jsx     <-- Lightweight OSM iframe
│   └── ui/              <-- Basic atoms (Button, Stack, Box)
├── hooks/               <-- Cross-feature logic
│   ├── useTimeline.js   <-- Fetching & Streaming
│   ├── useForm.js       <-- Standard form handling
│   └── useAutoSave.js   <-- The debounced sync logic
└── features/            <-- Feature Entry Points (Lean)
    ├── compose/
    │   ├── components/  <-- ComposeOptionPicker, AttachmentThumbnail
    │   ├── hooks/       <-- useCompose, useMediaUpload
    │   ├── index.jsx
    │   └── constants.js
    ├── group/
    │   └── index.jsx    <-- Uses EntityCard + Timeline
    ├── event/
    │   └── index.jsx    <-- Uses EntityCard + EventMap
    ├── notifications/
    │   ├── components/  <-- NotificationItem
    │   └── index.jsx    <-- Uses useTimeline
    └── settings/
        ├── index.jsx    <-- Routing/Sidebar
        └── Profile.jsx  <-- Auto-saving form
