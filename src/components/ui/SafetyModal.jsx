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

//====================================================================
//"Auto-Focus"
// src/components/ui/SafetyModal.jsx
//To implement Auto-Focus in your SafetyModal, you use a useEffect hook combined with a useRef. 
// This ensures that as soon as the Zustand store sets isOpen to true, the user can start typing 
// their confirmation without needing to click the input field.
import { useEffect, useRef } from 'react';
import { useConfirmStore } from '@/features/ui/store/useConfirmStore';

export const SafetyModal = ({ onConfirm }) => {
  const { isOpen, confirmValue, expectedValue, setConfirmValue, closeConfirm, targetId } = useConfirmStore();
  const inputRef = useRef(null);

  // AUTO-FOCUS LOGIC
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small timeout ensures the DOM has painted before focusing
      const timeout = setTimeout(() => inputRef.current.focus(), 50);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatched = confirmValue === expectedValue;

  return (
    <div className="modal-overlay" onClick={closeConfirm}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Critical Action Confirmation</h3>
        <p>Type <strong>{expectedValue}</strong> to proceed.</p>
        
        <input 
          ref={inputRef} // Attach the ref here
          type="text" 
          value={confirmValue} 
          onChange={(e) => setConfirmValue(e.target.value)}
          className="confirmation-input"
        />

        <div className="flex gap-2 mt-4">
          <button onClick={closeConfirm}>Cancel</button>
          <button 
            disabled={!isMatched}
            onClick={() => {
              onConfirm(targetId);
              closeConfirm();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
//====================================================================
//"Shake Animation"
// src/components/ui/SafetyModal.jsx
// "Shake Animation" logic so that if a user tries to click "Confirm" before the text matches, 
// the input field shakes to indicate an error
import { useState } from 'react';

export const SafetyModal = ({ onConfirm }) => {
  const { isOpen, confirmValue, expectedValue, targetId } = useConfirmStore();
  const [shouldShake, setShouldShake] = useState(false);

  const handleConfirm = () => {
    if (confirmValue === expectedValue) {
      onConfirm(targetId);
    } else {
      // Trigger the shake
      setShouldShake(true);
      // Reset the state after animation completes (500ms)
      setTimeout(() => setShouldShake(false), 500);
    }
  };

  return (
    <div className="modal-content">
      <input 
        type="text" 
        value={confirmValue}
        // Apply the shake class conditionally
        className={`confirmation-input ${shouldShake ? 'animate-shake' : ''}`}
        onChange={(e) => setConfirmValue(e.target.value)}
      />
      
      <button onClick={handleConfirm}>
        Confirm
      </button>
    </div>
  );
};
/*
/* src/styles/animations.css */
//@keyframes shake {
//  0%, 100% { transform: translateX(0); }
//  25% { transform: translateX(-5px); }
//  50% { transform: translateX(5px); }
//  75% { transform: translateX(-5px); }
//}

//.animate-shake {
//  animation: shake 0.2s ease-in-out 0s 2;
//  border-color: #ff4d4f !important;
//  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
//}
//
//========================================================================================
//"Enter Key Submission" so the user can just hit the Enter key to confirm once the text matches
// src/components/ui/SafetyModal.jsx

export const SafetyModal = ({ onConfirm }) => {
  const { confirmValue, expectedValue, targetId, closeConfirm } = useConfirmStore();
  const [shouldShake, setShouldShake] = useState(false);

  const handleAction = () => {
    if (confirmValue === expectedValue) {
      onConfirm(targetId);
      closeConfirm();
    } else {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission or newline
      handleAction();
    }
  };

  return (
    <div className="modal-content">
      <input 
        type="text" 
        value={confirmValue}
        onKeyDown={handleKeyDown} // Add listener here
        className={`confirmation-input ${shouldShake ? 'animate-shake' : ''}`}
        onChange={(e) => setConfirmValue(e.target.value)}
      />
      
      <div className="flex gap-2 mt-4">
        <button onClick={handleAction}>Confirm (Enter)</button>
      </div>
    </div>
  );
};
//========================================================================================
// /"Success Confetti" using the canvas-confetti library to celebrate when a high-stakes
// action (like a successful account move) finally completes.
