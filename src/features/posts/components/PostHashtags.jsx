// Render tags below the post content
<div className="flex gap-2 mt-2">
  {post.hashtags.map(tag => (
    <Link to={`/search?tag=${tag}`} key={tag} className="text-blue-500 hover:underline">
      #{tag}
    </Link>
  ))}
</div>

/*
Hashtag Extraction:
Case Insensitive: String.downcase ensures #Protest and #protest map to the same database record.
Atomic: If the hashtag extraction fails, the post isn't created, preventing "tagless" orphan posts.
Search Ready: Since tags are now in a dedicated hashtags table, searching for #justice becomes a simple, high-performance JOIN query rather than a slow text scan.
*/