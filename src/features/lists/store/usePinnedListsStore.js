// src/features/lists/store/usePinnedListsStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

//"List Pinning"
//To implement List Pinning, you shouldn't create a new database field on the server. 
// Instead, treat it as a Client-Side Preference using Zustand with Persistence. 
// This allows users to pin their favorite lists to the top of the sidebar instantly.

//1. The Pin Store (Zustand)
// This store tracks the IDs of the pinned lists. Because it uses the persist middleware, the user's pinned order is saved to localStorage and restored on every visit.
export const usePinnedListsStore = create()(
  persist(
    (set) => ({
      pinnedIds: [],

      togglePin: (listId) => set((state) => ({
        pinnedIds: state.pinnedIds.includes(listId)
          ? state.pinnedIds.filter(id => id !== listId)
          : [...state.pinnedIds, listId]
      })),
      
      reorderPins: (newIds) => set({ pinnedIds: newIds }),
    }),
    { name: 'kollective-pinned-lists' }
  )
);

//==================================================================================
//Drag-and-Drop Reordering
// src/features/lists/store/usePinnedListsStore.js
import { arrayMove } from '@dnd-kit/sortable';

export const usePinnedListsStore = create()(
  persist(
    (set) => ({
      pinnedIds: [],
      // ... togglePin logic
      
      // REPLACES: Complex Redux splice/move logic
      reorderPins: (activeId, overId) => set((state) => {
        const oldIndex = state.pinnedIds.indexOf(activeId);
        const newIndex = state.pinnedIds.indexOf(overId);
        return { pinnedIds: arrayMove(state.pinnedIds, oldIndex, newIndex) };
      }),
    }),
    { name: 'kollective-pinned-lists' }
  )
);
/*
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableListItem = ({ list }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: list.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="sortable-item">
      <span>⠿</span> {list.title}
    </div>
  );
};

const PinnedListsSection = () => {
  const { data } = useUserLists(); // From previous step
  const { pinnedIds, reorderPins } = usePinnedListsStore();

  const pinnedLists = data.all.filter(l => pinnedIds.includes(l.id));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) reorderPins(active.id, over.id);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={pinnedIds} strategy={verticalListSortingStrategy}>
        {pinnedLists.map(list => (
          <SortableListItem key={list.id} list={list} />
        ))}
      </SortableContext>
    </DndContext>
  );
};

*/
//==================================================================================

// /"Pin Limit"
//(e.g., maximum 5 lists) to keep the mobile UI clean, or are you ready to finalize the Zustand Settings

// src/features/lists/store/usePinnedListsStore.js
import { useSettingsStore } from '@/features/settings/store/useSettingsStore';
import { toast } from '@/components/Toast';

export const usePinnedListsStore = create()(
  persist(
    (set, get) => ({
      pinnedIds: [],

      togglePin: (listId) => {
        const { pinnedIds } = get();
        const { pinLimit } = useSettingsStore.getState();
        const isPinned = pinnedIds.includes(listId);

        if (!isPinned && pinnedIds.length >= pinLimit) {
          toast.error(`You can only pin up to ${pinLimit} lists.`);
          return;
        }

        set({
          pinnedIds: isPinned 
            ? pinnedIds.filter(id => id !== listId) 
            : [...pinnedIds, listId]
        });
      },
    }),
    { name: 'kollective-pinned-lists' }
  )
);

/*
const SettingsPanel = () => {
  const { theme, setTheme, hapticsEnabled, toggleHaptics } = useSettingsStore();

  return (
    <div className="settings-grid">
      <section>
        <h4>Appearance</h4>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="system">System Default</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </section>

      <section>
        <h4>Interaction</h4>
        <label>
          <input type="checkbox" checked={hapticsEnabled} onChange={toggleHaptics} />
          Enable Haptic Feedback
        </label>
      </section>
    </div>
  );
};

*/
