import { createContext, useContext, useMemo, useState } from 'react';

const StatContext = createContext({
  unreadChatsCount: 0,
  setUnreadChatsCount: () => {},
});

const StatProvider = ({ children }) => {
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);

  const value = useMemo(() => ({
    unreadChatsCount,
    setUnreadChatsCount,
  }), [unreadChatsCount]);

  return (
    <StatContext.Provider value={value}>
      {children}
    </StatContext.Provider>
  );
};

const useStatContext = () => useContext(StatContext);

export { StatProvider, useStatContext };