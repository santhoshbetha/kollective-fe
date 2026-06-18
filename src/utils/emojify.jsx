import { Tooltip, TooltipTrigger, TooltipContent } from "../components/ui/tooltip";

/** Given text and a list of custom emojis, return JSX with the emojis rendered as `<img>` elements. */
export function emojifyText(text, emojis) {
  const parts = [];

  const textNodes = text.split(/:\w+:/);
  const shortcodes = [...text.matchAll(/:(\w+):/g)];

  for (let i = 0; i < textNodes.length; i++) {
    parts.push(textNodes[i]);

    if (shortcodes[i]) {
      const [match, shortcode] = shortcodes[i];
      const customEmoji = emojis.find((e) => e.shortcode === shortcode);

      if (customEmoji) {
        parts.push(
          <Tooltip key={`emoji-${i}`}>
            <TooltipTrigger asChild>
              <img src={customEmoji.url} alt={shortcode} className='inline h-[1em] align-text-bottom' />
            </TooltipTrigger>
            <TooltipContent>
              :{shortcode}:
            </TooltipContent>
          </Tooltip>,
        );
      } else {
        parts.push(match);
      }
    }
  }

  return <>{parts}</>;
}

/*
Simplified Version (from google AI help):(chekc later if its better)
*/
export function emojifyText2(text, emojis) {
  // Wrapping the regex in () ensures the shortcodes are kept in the resulting array
  const parts = text.split(/(:(\w+):)/g);

  return (
    <>
      {parts.map((part, i) => {
        // Since the regex has two groups, the split array will look like: 
        // ["hello ", ":wave:", "wave", " world"]
        // We only care about the full shortcode match (index i) and the inner name (index i+1)
        if (part.startsWith(':') && part.endsWith(':')) {
          const shortcode = part.replace(/:/g, '');
          const emoji = emojis.find(e => e.shortcode === shortcode);

          if (emoji) {
            return (
              <Tooltip key={i} text={part}>
                <img src={emoji.url} alt={shortcode} className='inline h-[1em] align-text-bottom' />
              </Tooltip>
            );
          }
        }
        
        // Skip the "inner" captured name group from the regex split
        const isInnerName = i > 0 && parts[i-1].startsWith(':');
        return isInnerName ? null : part;
      })}
    </>
  );
}

/*
Key Improvements:

    No Manual Loop: Removed the parts array initialization and for loop in favor of a declarative .map().
    Regex Splitting: Using a capturing group (:(\w+):) allows you to process the text and the emojis in a single linear sequence.
    Cleaner Logic: It treats the string as a single stream of segments, making it easier to read and maintain.
*/
