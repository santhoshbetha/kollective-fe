// src/features/accounts/components/AccountCard.jsx
import { highlightText } from '@/utils/textHighlight';
//Search Highlighting
// /Since we validated our account data with Zod earlier, we can safely pass the display_name or username to this utility.
const AccountCard = ({ account, searchQuery }) => {
  return (
    <div className="account-card">
      <img src={account.avatar} alt="" />
      <div className="details">
        {/* Highlight the name based on the current search query */}
        <h4 className="display-name">
          {highlightText(account.display_name, searchQuery)}
        </h4>
        <span className="username">
          @{highlightText(account.username, searchQuery)}
        </span>
      </div>
    </div>
  );
};

/*
.search-highlight {
  background-color: rgba(29, 161, 242, 0.2); /* Kollective blue tint */
 /* color: var(--accent-color);
  font-weight: bold;
  border-radius: 2px;
  padding: 0 1px;
}
*/
