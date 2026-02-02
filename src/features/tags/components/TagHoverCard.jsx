// src/features/tags/components/TagHoverCard.jsx
import * as HoverCard from '@://radix-ui.com';
import { useTag } from '../api/useTags';
import { useToggleTagFollow } from '../api/useTagActions';

//Trending Tag Hover Cards
export const TagHoverCard = ({ tagName, children }) => {
  const { data: tag, isLoading } = useTag(tagName);
  const { mutate: toggleFollow } = useToggleTagFollow(tagName);

  return (
    <HoverCard.Root openDelay={300}>
      <HoverCard.Trigger asChild>
        {children}
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content className="hover-card-content" sideOffset={5}>
          {isLoading ? (
            <div className="skeleton-line" />
          ) : (
            <div className="tag-preview">
              <h4>#{tag.name}</h4>
              <p>{tag.history[0]?.accounts || 0} people talking today</p>
              
              <button onClick={() => toggleFollow(tag.following)}>
                {tag.following ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          )}
          <HoverCard.Arrow className="hover-card-arrow" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};
