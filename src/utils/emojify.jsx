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