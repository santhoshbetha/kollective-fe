import { triggerHaptic, HAPTIC_PATTERNS } from '@/utils/haptics';

const PinnedListsSection = () => {
  const handleDragStart = () => {
    // Give immediate physical feedback that the item is "lifted"
    triggerHaptic(HAPTIC_PATTERNS.MEDIUM);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      reorderPins(active.id, over.id);
      triggerHaptic(HAPTIC_PATTERNS.LIGHT); // Confirm drop
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
       {/* ... existing Dnd logic ... */}
    </DndContext>
  );
};
