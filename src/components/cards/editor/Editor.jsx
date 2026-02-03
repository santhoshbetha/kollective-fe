import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import FocusPlugin from './plugins/FocusPlugin';

export default function Editor() {
  // 1. Define the actual config instead of using "..."
  const editorConfig = {
    namespace: 'KollectiveEditor',
    onError: (error) => console.error(error),
    // Add nodes here later (like MentionNode or LinkNode)
    nodes: [], 
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={<div className="placeholder">What's happening?</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        {/* Your custom plugin */}
        <FocusPlugin autoFocus={true} />
      </div>
    </LexicalComposer>
  );
}
