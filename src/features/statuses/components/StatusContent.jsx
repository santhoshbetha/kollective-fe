// src/features/statuses/components/StatusContent.jsx
// /Trending Tag Hover Cards
const StatusContent = ({ content, tags }) => {
  // Use the tags array from the status entity for accurate matching
  return (
    <div className="status-body">
      {parse(content, {
        replace: (domNode) => {
          if (domNode.name === 'a' && domNode.attribs.class?.includes('hashtag')) {
            const tagName = domNode.children[0].data.replace('#', '');
            return (
              <TagHoverCard tagName={tagName}>
                <a href={domNode.attribs.href}>{domNode.children[0].data}</a>
              </TagHoverCard>
            );
          }
        }
      })}
    </div>
  );
};
