import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import useBoundStore from '../../../stores/boundStore.js';
import { useOwnAccount } from '../../../hooks/useOwnAccount.js';
import { FOCUS_EDITOR_COMMAND } from '../../../components/cards/editor/plugins/FocusPlugin.jsx';

const GlobalHotkeys = ({ node }) => {
    const navigate = useNavigate();
    const me = useBoundStore(state => state.me);
    const { account } = useOwnAccount();
    const { activeItemIndex, setActiveItemIndex } = useBoundStore();

    // Helper: Open Modal or Focus Editor (Ported from your original code)
    const handleNewTweet = (e) => {
        e?.preventDefault();
        // Find the editor element in the DOM
        const element = node.current?.querySelector('div[data-lexical-editor="true"]');
        if (element) {
            // This triggers the focus logic in your plugin!
            (element.__lexicalEditor).dispatchCommand(FOCUS_EDITOR_COMMAND, undefined);
        } else {
            // If the editor isn't on screen (like the modal is closed), open it first
            useBoundStore.getState().modal.openModalAction('COMPOSE');
        }
    };

   // Helper for Targeted Actions (f, r, b, etc.)
    const getActiveTweetId = () => {
        // Twitter-like apps usually track 'active' items via a class or global state
        return document.querySelector('.active-tweet')?.dataset.id;
    };

    // Helper to keep the item in view
    const scrollToActiveItem = (index) => {
        const element = document.querySelector(`[data-index="${index}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    //To coordinate the hotkey and the editor focus, you must handle the gap between
    //triggering the modal (in Redux/Zustand) and the editor appearing in the DOM
    //useHotkeys('n', (e) => {
    //    e.preventDefault();
        
        // 1. Open the Modal first
        //openModal('COMPOSE');

        // 2. We can't focus yet because the Editor isn't rendered!
        // We will let the FocusPlugin handle the "mount" focus.
    //});

    // --- 1. COMPOSE & SEARCH ---
    useHotkeys('n', (e) => handleNewTweet(e), { enabled: !!me });

    useHotkeys('option+n', (e) => {
        handleNewTweet(e);
        useBoundStore.getState().compose.resetCompose();
    }, { enabled: !!me });
    
    useHotkeys(['s', '/'], (e) => {
        e.preventDefault();
        node.current?.querySelector('input#search')?.focus();
    });

    // --- 2. SOCIAL ACTIONS (Targeting active tweet) ---
    useHotkeys('r', () => {
        const id = getActiveTweetId();
        if (id) console.log('Reply to', id); // Logic: Open reply modal
    });
    useHotkeys('f', () => {
        const id = getActiveTweetId();
        if (id) console.log('Favorite', id); // Logic: Trigger TanStack Mutation
    });
    useHotkeys('b', () => {
        const id = getActiveTweetId();
        if (id) console.log('Boost/Retweet', id);
    });
    useHotkeys('m', () => console.log('Mention logic'));

    // --- 3. NAVIGATION (G + KEY) ---
    const navOptions = { enabled: !!me };
    useHotkeys('g+h', () => navigate('/'), navOptions);
    useHotkeys('g+n', () => navigate('/notifications'), navOptions);
    useHotkeys('g+f', () => account && navigate(`/@${account.username}/favorites`), navOptions);
    useHotkeys('g+p', () => account && navigate(`/@${account.username}/pins`), navOptions);
    useHotkeys('g+u', () => account && navigate(`/@${account.username}`), navOptions);
    useHotkeys('g+b', () => navigate('/blocks'), navOptions);
    useHotkeys('g+m', () => navigate('/mutes'), navOptions);
    useHotkeys('g+r', () => navigate('/follow_requests'), navOptions);

    // --- 4. LIST NAVIGATION ---
    useHotkeys(['j', 'down'], () => {
        // Logic to move 'active' focus down the list
    });
    useHotkeys(['k', 'up'], () => {
        // Logic to move 'active' focus up the list
    });

    // --- 5. MISC ---
    useHotkeys('?', () => useBoundStore.getState().modal.openModalAction('HOTKEYS'));
    useHotkeys('backspace', () => window.history.length === 1 ? navigate('/') : navigate(-1));
    useHotkeys('x', () => console.log('Toggle hidden content'));
    useHotkeys('h', () => console.log('Toggle sensitive content'));
    useHotkeys('a', () => console.log('Open media viewer'));

    // Note: 'react-hotkeys-hook' automatically ignores INPUT, TEXTAREA, 
    // and contenteditable by default, so we don't need the stopCallback logic.

    // Move Down (j)
    useHotkeys(['j', 'down'], (e) => {
        e.preventDefault();
        const nextIndex = Math.min(activeItemIndex + 1, itemCount - 1);
        setActiveItemIndex(nextIndex);
        scrollToActiveItem(nextIndex);
    });

        // Move Up (k)
    useHotkeys(['k', 'up'], (e) => {
        e.preventDefault();
        const prevIndex = Math.max(activeItemIndex - 1, 0);
        setActiveItemIndex(prevIndex);
        scrollToActiveItem(prevIndex);
    });


  return null;
};

export default GlobalHotkeys;

//The itemCount is missing because your global component doesn't naturally know how many items are 
// currently in your dynamic feed (Home, Notifications, etc.).To fix this, you should pull the 
// current list length directly from your TanStack Query cache or Zustand/Redux store within the GlobalHotkeysX component.

//This version dynamically calculates itemCount and includes all your original social actions.

/*
const GlobalHotkeysX = ({ node }) => {
  const navigate = useNavigate();
  const me = useBoundStore(state => state.me);
  const { account } = useOwnAccount();
  
  // 1. DYNAMIC ITEM COUNT: Pull from the same store your feed uses
  // Replace 'feedItems' with your actual store property
  const items = useBoundStore(state => state.feedItems || []); 
  const itemCount = items.length;

  const { activeItemIndex, setActiveItemIndex } = useBoundStore();

  // Helper: Scroll active item into view
  const scrollToActive = (index) => {
    const el = document.querySelector(`[data-index="${index}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // --- 2. LIST NAVIGATION (j/k) ---
  useHotkeys(['j', 'down'], (e) => {
    e.preventDefault();
    setActiveItemIndex(Math.min(activeItemIndex + 1, itemCount - 1));
    scrollToActive(activeItemIndex + 1);
  }, [activeItemIndex, itemCount]);

  useHotkeys(['k', 'up'], (e) => {
    e.preventDefault();
    setActiveItemIndex(Math.max(activeItemIndex - 1, 0));
    scrollToActive(activeItemIndex - 1);
  }, [activeItemIndex]);

  // --- 3. SOCIAL ACTIONS (Original keyMap) ---
  const activeItemId = items[activeItemIndex]?.id;

  useHotkeys('r', () => activeItemId && console.log('Reply to', activeItemId));
  useHotkeys('f', () => activeItemId && console.log('Fav', activeItemId));
  useHotkeys('b', () => activeItemId && console.log('Boost', activeItemId));
  useHotkeys('enter', () => activeItemId && navigate(`/status/${activeItemId}`));

  // --- 4. NAVIGATION CHORDS (g + key) ---
  const navOptions = { enabled: !!me };
  useHotkeys('g+h', () => navigate('/'), navOptions);
  useHotkeys('g+n', () => navigate('/notifications'), navOptions);
  useHotkeys('g+u', () => account && navigate(`/@${account.username}`), navOptions);

  return null;
};*/


/*
Automatic Input Blocking: You can delete the __mousetrap__.stopCallback logic. react-hotkeys-hook ignores INPUT, TEXTAREA, and CONTENTEDITABLE by default.
Direct Store Access: Since you are using useBoundStore.getState(), you can trigger actions inside the hooks without needing a separate handlers object mapping.
Sequence Support: The string 'g+h' replaces the need for complex key maps; the hook handles the timing for sequences automatically.
Scoped by Auth: By passing { enabled: !!me }, these shortcuts won't fire if a user isn't logged in, preventing navigation errors or empty modals.

The 'g' chords: These are essential for power users to jump between sections (Home, Notifications, Profile) without using the mouse.
Action keys (r, f, b): These make the app feel "native." However, they require you to have a concept of a "focused" tweet (usually managed by your moveDown/Up logic).
The '/' key: Standard web behavior for search focus.
*/

/*
const TweetItem = ({ index, tweet }) => {
  const activeItemIndex = useBoundStore((state) => state.activeItemIndex);
  const isActive = activeItemIndex === index;

  return (
    <div 
      data-index={index}
      className={`tweet-container ${isActive ? 'active-border' : ''}`}
    >
      {/* Tweet content *//*}
    </div>
  );
};
.tweet-container {
  border-left: 4px solid transparent;
  transition: border-color 0.2s ease;
}

.tweet-container.active-border {
  border-left-color: #1d9bf0; /* Twitter Blue */
 // background-color: rgba(29, 155, 240, 0.05); /* Very light blue tint */
//}

//*/
