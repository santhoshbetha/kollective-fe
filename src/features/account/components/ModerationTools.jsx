/*
To add Moderation Actions, we extend the useAccount.js hook to handle the administrative 
endpoints. This allows you to delete separate "Admin Only" components and moderation modals, 
centralizing everything into the primary account lifecycle.
*/

/*
2. The Reduced Moderation Menu (JSX)
Instead of a complex modal system, use a simple Generic 
Option Picker (the pattern we used for Compose) to render the admin tools.
*/

export const ModerationTools = ({ onAction }) => (
  <div className="admin-actions-bar" style={{ background: '#fff4f4', padding: '10px' }}>
    <span style={{ fontWeight: 'bold', color: 'red' }}>Admin Tools:</span>
    <button onClick={() => onAction('verify')}>Approve</button>
    <button onClick={() => onAction('warn')}>Warn User</button>
    <button onClick={() => onAction('deactivate')}>Suspend</button>
  </div>
);

