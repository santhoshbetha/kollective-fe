/*
Shadow ban
Why this is a "Standalone" Pro Strategy:

    Data-Driven Moderation: Instead of hunting for bad actors, the dashboard brings the highest-risk users (by percentage) to the top.
    Reduced Friction: Shadow banning stops "trolls" from creating new accounts because they don't realize they've been muted; their posts just get zero engagement.
    Performance: The is_shadow_banned check is handled in the JOIN of your base query, benefiting from your existing Postgres indexes. 
*/

const ShadowBanDashboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch high-risk users from your Elixir API
    axios.get('/api/admin/high-risk-users').then(res => setUsers(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Shadow Ban Monitor</h1>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th>User</th>
            <th>Rejection Rate</th>
            <th>Total Posts</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(row => (
            <tr key={row.user.id}>
              <td>{row.user.username}</td>
              <td className="text-red-600 font-bold">{row.rejection_rate}%</td>
              <td>{row.total_posts}</td>
              <td>{row.user.is_shadow_banned ? '🚫 Shadow Banned' : '✅ Active'}</td>
              <td>
                <button onClick={() => toggleBan(row.user.id)} className="btn-secondary">
                  {row.user.is_shadow_banned ? 'Lift Ban' : 'Shadow Ban'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
