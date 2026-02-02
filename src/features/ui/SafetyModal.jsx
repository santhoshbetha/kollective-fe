// /Safety Confirmation Moda
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
Import the SafetyModal into your App.jsx or a high-level Layout.jsx.
Because the state is managed by useConfirmStore (Zustand), you can trigger it from anywhere in the app without passing props down through multiple layers of components Zustand Documentation.
*/
