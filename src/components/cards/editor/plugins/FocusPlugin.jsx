import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_NORMAL, createCommand } from 'lexical';
import { useEffect } from 'react';

export const FOCUS_EDITOR_COMMAND = createCommand();

const FocusPlugin = ({ autoFocus }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => editor.registerCommand(FOCUS_EDITOR_COMMAND, () => {
    editor.focus(
      () => {
        const activeElement = document.activeElement;
        const rootElement = editor.getRootElement();
        if (rootElement !== null && (activeElement === null || !rootElement.contains(activeElement))) {
          rootElement.focus({ preventScroll: true });
        }
      }, { defaultSelection: 'rootEnd' },
    );
    return true;
  }, COMMAND_PRIORITY_NORMAL));

  useEffect(() => {
    if (autoFocus) {
      editor.dispatchCommand(FOCUS_EDITOR_COMMAND, undefined);
    }
  }, [autoFocus, editor]);

  //coordinate the hotkey and the editor focus, you must handle the gap between
  //triggering the modal (in Redux/Zustand) and the editor appearing in the DOM
  //Your FocusPlugin is the "smart" part. Because it lives inside the Lexical editor, 
  // it only runs when the editor actually mounts (i.e., when the modal appears).
  //Use a useEffect with a tiny delay or requestAnimationFrame. This is a common fix for modals: 
  // if you focus too fast, the modal's entry animation might steal the focus back.
    /*useEffect(() => {
        if (autoFocus) {
        // Use requestAnimationFrame to wait for the modal to be visible in the DOM
        requestAnimationFrame(() => {
            editor.focus(() => {
            // Ensures cursor is at the end of existing text
            const rootElement = editor.getRootElement();
            rootElement?.focus({ preventScroll: true });
            }, { defaultSelection: 'rootEnd' });
        });
        }
    }, [autoFocus, editor]);*/

  return null;
};

export default FocusPlugin;
