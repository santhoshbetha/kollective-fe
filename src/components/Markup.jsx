import parse, { HTMLReactParserOptions, Text as DOMText, Element, domToReact } from 'html-react-parser';
import { forwardRef, useMemo } from 'react';
import HashtagLink from './HashtagLink.jsx';
import Mention from './Mention.jsx';
import Text from '@/components/ui/text.tsx';
import { emojifyText } from '@/utils/emojify.jsx';

// Helper to extract hashtag name from node children
const getHashtag = (children) => {
  const text = domToReact(children).toString();
  return text.startsWith('#') ? text.slice(1) : text;
};

/** Styles HTML markup returned by the API, such as in account bios and statuses. */
const Markup = forwardRef(({ html, emojis, mentions, className, ...props }, ref) => {
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const options = useMemo(() => ({
    replace(domNode) {
      if (!(domNode instanceof Element)) {
        return domNode instanceof DOMText && emojis ? emojifyText(domNode.data, emojis) : undefined;
      }

      const { name, attribs, children } = domNode;
      const classes = attribs.class?.split(' ') || [];

      // 1. Security Filter
      if (['script', 'iframe'].includes(name)) return null;

      // 2. Hashtag Replacement
      if (name === 'a' && classes.includes('hashtag')) {
        return <HashtagLink hashtag={getHashtag(children)} />;
      }

      // 3. Mention Replacement
      if (name === 'a' && classes.includes('mention')) {
        const mention = mentions?.find(m => m.url === attribs.href);
        if (mention) return <Mention mention={mention} />;
      }

      // 4. Enhanced External Links
      if (name === 'a') {
        return (
          <a {...attribs} onClick={e => e.stopPropagation()} rel="nofollow noopener" target="_blank">
            {domToReact(children, options)}
          </a>
        );
      }
    }
  }), [emojis, mentions]);

  return (
    <Text 
      ref={ref}
      {...props}
      data-markup
      className={`
        /* Light Mode Defaults */
        prose prose-blue wrap-break-word 
        
        /* Dark Mode Support */
        dark:prose-invert 
        
        /* Custom Class Dark Mode overrides */
        [&_.invisible]:hidden 
        [&_.hashtag]:text-blue-600 dark:[&_.hashtag]:text-blue-400
        [&_.mention]:font-medium dark:[&_.mention]:text-indigo-300
        
        ${className || ''}
      `}
    >
      {parse(html.__html, options)}
    </Text>
  );
});

export default Markup;

/*
Why this is better:

    Readability: The replace function now acts as a simple "switchboard" where you can quickly see which tags are being handled.
    Performance: useMemo ensures that the parsing logic isn't recreated unless your emojis or mentions data actually changes.
    Maintainability: If you need to support a new tag (like <img> or <code>), you can just add a new block at the same level instead of nesting deeper.
*/