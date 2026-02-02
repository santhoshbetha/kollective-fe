import { useState, useEffect } from 'react';

export const useIdleTimer = (timeout = 60000) => { // Default 1 minute
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timer;

    const handleActivity = () => {
      setIsIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIsIdle(true), timeout);
    };

    // Events that signal the user is active
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => window.addEventListener(event, handleActivity));
    handleActivity(); // Initialize timer

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      clearTimeout(timer);
    };
  }, [timeout]);

  return isIdle;
};
