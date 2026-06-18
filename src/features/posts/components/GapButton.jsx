import { useFillGap } from '../api/useFillGap';

const GapButton = ({ maxId, minId }) => {
  const { mutate, isPending } = useFillGap();

  return (
    <button 
      className="gap-button" 
      onClick={() => mutate({ maxId, minId })}
      disabled={isPending}
    >
      {isPending ? 'Loading...' : '↑ Show missing posts ↑'}
    </button>
  );
};

export default GapButton;