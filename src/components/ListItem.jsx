const ListItem = ({ content, onImageLoad }) => {
  if (content === '__loader__') return <LoadMore />;

  return (
    <div style={{ paddingBottom: '10px' }}>
      {/* 1. Use aspect-ratio to reserve space if you know the dimensions */}
      <div style={{ aspectRatio: '16/9', backgroundColor: '#f0f0f0' }}>
        <img 
          src={content.imageUrl} 
          onLoad={onImageLoad} // 2. Trigger re-measure
          style={{ width: '100%', display: 'block' }} 
        />
      </div>
      <div>{content.text}</div>
    </div>
  );
};
export default ListItem;