/*
Admin Logging
*/
// AdminAuditLog.js
const AuditLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('/api/admin/logs?action=global_alert').then(res => setLogs(res.data));
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th>Time</th>
            <th>Admin</th>
            <th>Message</th>
            <th>Level</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} className="border-b">
              <td>{new Date(log.inserted_at).toLocaleString()}</td>
              <td>@{log.admin.username}</td>
              <td className="max-w-xs truncate">{log.details.message}</td>
              <td>
                <span className={`px-2 py-1 rounded text-white ${log.details.level === 'emergency' ? 'bg-red-500' : 'bg-blue-500'}`}>
                  {log.details.level}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/*
Why this is "Accountability" Gold:

    Immutability: The admin_id uses on_delete: :nilify_all. If an admin is deleted from the system, the log remains (with a null ID), but the details.message is preserved for history.
    No "Ghost" Alerts: By using Repo.transaction, you ensure that if the database is down, no global alert is sent. You don't want a situation where an alert goes out but there is no record of who sent it.
    Multi-Admin Transparency: In high-stress "Voice" (protest) situations, multiple admins might be active. This log prevents "he-said-she-said" scenarios.
*/