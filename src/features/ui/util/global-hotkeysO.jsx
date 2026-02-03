import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { FOCUS_EDITOR_COMMAND } from '../../compose/editor/plugins/focus-plugin.jsx';
import useBoundStore from '../../../stores/boundStore.js';
import { useOwnAccount } from '../../../hooks/useOwnAccount.js';

import { HotKeys } from '../../../components/HotKeys.jsx';

const keyMap = {
  help: '?',
  new: 'n',
  search: ['s', '/'],
  forceNew: 'option+n',
  reply: 'r',
  favourite: 'f',
  react: 'e',
  boost: 'b',
  mention: 'm',
  open: ['enter', 'o'],
  openProfile: 'p',
  moveDown: ['down', 'j'],
  moveUp: ['up', 'k'],
  back: 'backspace',
  goToHome: 'g h',
  goToNotifications: 'g n',
  goToFavourites: 'g f',
  goToPinned: 'g p',
  goToProfile: 'g u',
  goToBlocked: 'g b',
  goToMuted: 'g m',
  goToRequests: 'g r',
  toggleHidden: 'x',
  toggleSensitive: 'h',
  openMedia: 'a',
};

const GlobalHotkeysO = ({ children, node }) => {
  const hotkeys = useRef(null);

  const navigate = useNavigate();
  const me = useBoundStore(state => state.me);
  const { account } = useOwnAccount();

  const handleHotkeyNew = (e) => {
    e?.preventDefault();

    const element = node.current?.querySelector('div[data-lexical-editor="true"]');

    if (element) {
      ((element).__lexicalEditor).dispatchCommand(FOCUS_EDITOR_COMMAND, undefined);
    } else {
      useBoundStore.getState().modal.openModalAction('COMPOSE');
    }
  };

  const handleHotkeySearch = (e) => {
    e?.preventDefault();
    if (!node.current) return;

    const element = node.current.querySelector('input#search');

    if (element) {
      element.focus();
    }
  };

  const handleHotkeyForceNew = (e) => {
    handleHotkeyNew(e);
    useBoundStore.getState().compose.resetCompose();
  };

  const handleHotkeyBack = () => {
    if (window.history && window.history.length === 1) {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  const setHotkeysRef = (c) => {
    hotkeys.current = c;

    if (!me || !hotkeys.current) return;

    // @ts-ignore
    hotkeys.current.__mousetrap__.stopCallback = (_e, element) => {
      return ['TEXTAREA', 'SELECT', 'INPUT', 'EM-EMOJI-PICKER'].includes(element.tagName) || !!element.closest('[contenteditable]');
    };
  };

  const handleHotkeyToggleHelp = () => {
    useBoundStore.getState().modal.openModalAction('HOTKEYS');
  };

  const handleHotkeyGoToHome = () => {
    navigate('/');
  };

  const handleHotkeyGoToNotifications = () => {
    navigate('/notifications');
  };

  const handleHotkeyGoToFavourites = () => {
    if (!account) return;
    navigate(`/@${account.username}/favorites`);
  };

  const handleHotkeyGoToPinned = () => {
    if (!account) return;
    navigate(`/@${account.username}/pins`);
  };

  const handleHotkeyGoToProfile = () => {
    if (!account) return;
    navigate(`/@${account.username}`);
  };

  const handleHotkeyGoToBlocked = () => {
    navigate('/blocks');
  };

  const handleHotkeyGoToMuted = () => {
    navigate('/mutes');
  };

  const handleHotkeyGoToRequests = () => {
    navigate('/follow_requests');
  };


  const handlers = {
    help: handleHotkeyToggleHelp,
    new: handleHotkeyNew,
    search: handleHotkeySearch,
    forceNew: handleHotkeyForceNew,
    back: handleHotkeyBack,
    goToHome: handleHotkeyGoToHome,
    goToNotifications: handleHotkeyGoToNotifications,
    goToFavourites: handleHotkeyGoToFavourites,
    goToPinned: handleHotkeyGoToPinned,
    goToProfile: handleHotkeyGoToProfile,
    goToBlocked: handleHotkeyGoToBlocked,
    goToMuted: handleHotkeyGoToMuted,
    goToRequests: handleHotkeyGoToRequests,
  };

 /* useEffect(() => {
    if (!me || !hotkeysRef.current) return;

    // @ts-ignore
    hotkeysRef.current.__mousetrap__.stopCallback = (_e, element) => {
      return ['TEXTAREA', 'SELECT', 'INPUT', 'EM-EMOJI-PICKER'].includes(element.tagName) || !!element.closest('[contenteditable]');
    };
  }, [me]);*/

  return (
    <HotKeys keyMap={keyMap} handlers={me ? handlers : undefined} ref={setHotkeysRef} attach={window} focused>
      {children}
    </HotKeys>
  );
};

export default GlobalHotkeysO;
