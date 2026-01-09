import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import useBoundStore from '../stores/boundStore.js';
import { useOwnAccount } from '../hooks/useOwnAccount.js';
import { useSettings } from '../hooks/useSettings.js';

import { useChat } from '../hooks/useChat.js';

const ChatWidgetScreens = {
  INBOX: 'inbox',
  CHAT: 'chat',
};

const ChatContext = createContext({
  isOpen: false,
  needsAcceptance: false,
});

const ChatProvider = ({ children }) => {
  const history = useHistory();
  const toggleMainWindow = useBoundStore((state) => state.chats?.toggleMainWindow ?? (() => {}));
  const { chats } = useSettings();
  const { account } = useOwnAccount();

  const path = history.location.pathname;
  const isUsingMainChatPage = Boolean(path.match(/^\/chats/));
  const { chatId } = useParams();

  const [screen, setScreen] = useState(ChatWidgetScreens.INBOX);
  const [currentChatId, setCurrentChatId] = useState(chatId);

  const { data: chat } = useChat(currentChatId);

  const needsAcceptance = !chat?.accepted && chat?.created_by_account !== account?.id;
  const isOpen = chats.mainWindow === 'open';

  const changeScreen = useCallback((screen, currentChatId) => {
    setCurrentChatId(currentChatId || null);
    setScreen(screen);
  }, []);

  const toggleChatPane = useCallback(() => toggleMainWindow(), [toggleMainWindow]);

  const value = useMemo(() => ({
    chat,
    needsAcceptance,
    isOpen,
    isUsingMainChatPage,
    toggleChatPane,
    screen,
    changeScreen,
    currentChatId,
  }), [chat, currentChatId, needsAcceptance, isUsingMainChatPage, isOpen, screen, changeScreen, toggleChatPane]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

const useChatContext = () => useContext(ChatContext);

export { ChatContext, ChatProvider, useChatContext, ChatWidgetScreens };
