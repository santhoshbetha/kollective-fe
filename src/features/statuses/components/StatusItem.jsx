/*interface StatusItemProps {
  id: string;
  conversationId: string;
  isHighlighted?: boolean;
}*/
import { useStatus } from '../api/useStatus';

export const StatusItem = ({ id, conversationId, isHighlighted }) => {
  const { data: status, isLoading } = useStatus(id, conversationId);

  if (isLoading) return <div className="skeleton">...</div>;
  if (!status) return null;

  return (
    <article className={`status ${isHighlighted ? 'active' : ''}`}>
      <header>
        <strong>{status.account.display_name}</strong>
        <span>@{status.account.acct}</span>
      </header>
      <div dangerouslySetInnerHTML={{ __html: status.content }} />
    </article>
  );
};
