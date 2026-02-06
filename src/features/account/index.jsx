//soapbox account component reduction:

/*
3. The Reduced Index Entry
The index.jsx then simply brings these together with the Generic Timeline we built earlier.
*/

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from './hooks/useAccount';
import { Timeline } from '@/components/Timeline';
import { AccountHeader } from './components/AccountHeader';

const AccountPage = () => {
  const { id } = useParams();
  const { account, relationship, fetchAccount, toggleFollow } = useAccount(id);

  useEffect(() => { fetchAccount(); }, [id, fetchAccount]);

  if (!account) return <div>Loading...</div>;

  return (
    <div className="account-page">
      <AccountHeader 
        account={account} 
        relationship={relationship} 
        onFollow={toggleFollow} 
      />
      <Timeline endpoint={`/api/v1/accounts/${id}/statuses`} />
    </div>
  );
};

export default AccountPage;

/*
Files You Can Delete:

    Header.js, Avatar.js, DisplayName.js: All merged into AccountHeader.jsx.
    FollowButton.js, BlockButton.js: Replaced by logic in useAccount.js.
    ActionButtons.js: Replaced by the actions block in the header.
*/

//================================================================================

/*
/*
To add Moderation Actions, we extend the useAccount.js hook to handle the administrative 
endpoints. This allows you to delete separate "Admin Only" components and moderation modals, 
centralizing everything into the primary account lifecycle.
*/

/*
3. Integrating into the Account Index
The admin tools only render if the current user has the correct permissions, 
keeping the account feature directory clean and modular.
*/
const AccountPage = () => {
  const { account, performAdminAction, isAdmin } = useAccount(id);

  return (
    <div className="account-page">
      {/* Admin bar appears only for moderators */}
      {isAdmin && <ModerationTools onAction={performAdminAction} />}
      
      <AccountHeader account={account} />
      <Timeline endpoint={`/api/v1/accounts/${id}/statuses`} />
    </div>
  );
};

/*
Why this reduction works:

    Zero Modal Boilerplate: By treating moderation as just another "action" on the account, you avoid the heavy state management required for popups.
    API Consistency: It reuses the exact same Axios/Fetch patterns established in the status and group features.
    Logic Deletion: You can now delete the entire src/features/account/moderation subfolder.
*/


