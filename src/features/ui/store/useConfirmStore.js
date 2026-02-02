import { create } from 'zustand';

// /Safety Confirmation Modal
//To implement a Safety Confirmation Modal for critical actions like account moves, use Zustand for the UI state and a controlled input for the "Type to Confirm" logic. This ensures the user is fully aware of the consequences before the TanStack Mutation fires.
//1. The Confirmation Store
//Create src/features/ui/store/useConfirmStore.js. This is a generic store you can reuse for deleting accounts, leaving groups, or moving instances.
export const useConfirmStore = create((set) => ({
  isOpen: false,
  targetId: null,
  confirmValue: '', // What the user is typing
  expectedValue: '', // What they SHOULD type (e.g., their username)
  
  openConfirm: (id, expected) => set({ 
    isOpen: true, 
    targetId: id, 
    expectedValue: expected, 
    confirmValue: '' 
  }),
  
  closeConfirm: () => set({ isOpen: false, targetId: null }),
  setConfirmValue: (val) => set({ confirmValue: val }),
}));

/*
const SafetyModal = ({ onConfirm }) => {
  const { isOpen, confirmValue, expectedValue, setConfirmValue, closeConfirm, targetId } = useConfirmStore();

  if (!isOpen) return null;

  const isMatched = confirmValue === expectedValue;

  return (
    <div className="modal-overlay">
      <div className="modal-content danger-zone">
        <h3>Are you absolutely sure?</h3>
        <p>This action is irreversible. Please type <strong>{expectedValue}</strong> to confirm.</p>
        
        <input 
          type="text" 
          value={confirmValue} 
          onChange={(e) => setConfirmValue(e.target.value)}
          placeholder="Type here..."
        />

        <div className="actions">
          <button onClick={closeConfirm}>Cancel</button>
          <button 
            className="btn-danger" 
            disabled={!isMatched}
            onClick={() => {
              onConfirm(targetId);
              closeConfirm();
            }}
          >
            I understand, proceed
          </button>
        </div>
      </div>
    </div>
  );
};

/*
const MoveSettings = () => {
  const myUsername = useAuthStore(s => s.me.username);
  const openConfirm = useConfirmStore(s => s.openConfirm);
  const { mutate: startMove } = useMoveAccount();

  return (
    <>
      <button onClick={() => openConfirm('move-action', myUsername)}>
        Move Account
      </button>

      <SafetyModal onConfirm={() => startMove(targetIdFromStore)} />
    </>
  );
};

*/

