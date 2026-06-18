/** 
 * A simple button to trigger the next page of results.
 * Can be replaced with a Spinner if autoloading is active.
 */
const LoadMore = ({ visible, onClick }) => {
  if (!visible) return null;

  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <button 
        className="load-more-btn" 
        onClick={onClick}
        style={{
          padding: '10px 20px',
          cursor: 'pointer',
          borderRadius: '4px',
          backgroundColor: '#000',
          color: '#fff',
          border: 'none'
        }}
      >
        Load More
      </button>
    </div>
  );
};

export default LoadMore;

//=========================================================================================

/*
 integrated an Intersection Observer hook
 into the LoadMore component to trigger loading automatically when it enters the viewport
*/
/*
import  { useRef, useEffect } from 'react';
const LoadMore2 = ({ visible, onClick }) => {
  const loaderRef = useRef(null);

  useEffect(() => {
    if (!visible || !onClick) return;

    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        onClick(); // Trigger the load more function
      }
    }, {
      root: null, // use the viewport
      rootMargin: '200px', // start loading 200px before reaching the bottom
      threshold: 0.1
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [visible, onClick]);

  if (!visible) return null;

  return (
    <div ref={loaderRef} style={{ textAlign: 'center', padding: '20px' }}>
      <div className="spinner">Loading more...</div>
    </div>
  );
};
*/
