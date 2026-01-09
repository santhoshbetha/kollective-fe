import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_NORMAL, createCommand } from 'lexical';
import { useEffect } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
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

  return null;
};

export default FocusPlugin;
