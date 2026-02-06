// src/features/explore/components/TagCard.js
export const TagCard = ({ tag }) => (
  <div className="tag-card">
    <Link href={`/tags/${tag.name}`}>#{tag.name}</Link>
    <span>{tag.history[0].uses} posts today</span>
  </div>
);
