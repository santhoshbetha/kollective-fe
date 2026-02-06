import { useState, useEffect, useRef } from 'react';

// auto-save the settings so you can even delete the "Save Changes" button for a s
// moother Soapbox UI experience

// Updated Hook with "Saving" State We add a savingStatus to track when the Vite-powered app 
// is communicating with the server.

export const useAutoSaveForm = (initialValues, onSave) => {
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState('idle'); // 'idle', 'saving', 'saved'
  const isFirstRender = useRef(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStatus('idle'); // Reset when user starts typing again
    setValues(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setStatus('saving');
      await onSave(values);
      setStatus('saved');
      
      // Hide the "Saved" checkmark after 2 seconds
      setTimeout(() => setStatus('idle'), 2000);
    }, 800);

    return () => clearTimeout(timer);
  }, [values]);

  return { values, handleChange, status };
};
