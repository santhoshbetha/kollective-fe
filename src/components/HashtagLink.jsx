import { Link as Comp } from 'react-router-dom';

const HashtagLink = ({ hashtag }) => (
  <Comp to={`/tags/${hashtag}`} onClick={(e) => e.stopPropagation()}>
    #{hashtag}
  </Comp>
);

export default HashtagLink;