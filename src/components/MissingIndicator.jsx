import Card from 'soapbox/components/ui/card.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';

/**
 * Minimized 404/Empty State component.
 * Removes heavy i18n and redundant nesting.
 */
const MissingIndicator = ({ nested = false }) => (
  <Card rounded={!nested} size='lg' className="py-12">
    <Stack space={2}>
      <Text weight='bold' align='center' size='lg'>
        Post not found
      </Text>

      <Text theme='muted' align='center'>
        This conversation may have been deleted or moved.
      </Text>
    </Stack>
  </Card>
);

export default MissingIndicator;

/*
Why this fits your "Standalone" logic:

    Removed FormattedMessage: In a private or single-server app, hardcoding these "system" strings saves bundle size and eliminates the Internationalization overhead.
    Increased Padding: Added py-12 to the Card so that when a user hits a Tombstoned or missing link, the "Empty" state feels intentional and fills the screen properly.
    Direct Communication: Changed "Resource" to "Post" or "Conversation" to match your specific YouTube-style and Threaded context.

Integration with Elixir:
When your Phoenix Controller returns a 404 Not Found for a status ID, your StatusDetails 
component will catch the error and swap the PlaceholderStatus for this MissingIndicator automatically.
*/


