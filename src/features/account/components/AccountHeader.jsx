//soapbox account component reduction:

/*
2. The Unified Account Header JSX
Instead of separate files for the banner, avatar, and buttons, merge them into a single AccountHeader.jsx. 
This leverages the Soapbox 3.0 layout to handle everything in one clean block.
*/


export const AccountHeader = ({ account, relationship, onFollow }) => (
  <div className="account-header">
    {/* Banner and Avatar merged */}
    <div className="banner" style={{ backgroundImage: `url(${account.header})` }}>
      <img src={account.avatar} alt={account.username} className="avatar-large" />
    </div>

    <div className="account-info">
      <div>
        <h1>{account.display_name}</h1>
        <span>@{account.acct}</span>
      </div>

      {/* Relationship Actions */}
      <div className="actions">
        {relationship && (
          <button onClick={onFollow} className={relationship.following ? 'active' : ''}>
            {relationship.following ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>
    </div>

    {/* Bio Section */}
    <div className="bio" dangerouslySetInnerHTML={{ __html: account.note }} />
  </div>
);
