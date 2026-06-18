/*
Post Appeals
*/
const AppealForm = ({ postId }) => {
  const [reason, setReason] = useState("");

  const submitAppeal = async () => {
    await axios.post(`/api/posts/${postId}/appeal`, { reason });
    toast.success("Appeal submitted! Admins will review it shortly.");
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
      <p className="text-sm font-bold">Think this was a mistake?</p>
      <textarea 
        value={reason} 
        onChange={(e) => setMsg(e.target.value)}
        className="w-full mt-2 p-2 text-sm border"
        placeholder="Why should this be restored?"
      />
      <button onClick={submitAppeal} className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded">
        Submit Appeal
      </button>
    </div>
  );
};

/*
5. Why this is "Full-Cycle" Moderation:

    Validation: The if check ensures users can’t "appeal" a post that was never rejected.
    Real-Time Priority: Because Voice posts are time-sensitive, the broadcast_appeal_to_admins ensures your mods see the appeal immediately, potentially restoring a protest post within minutes.
    Audit Trail: By saving the appeal_reason to the post itself, you keep a permanent record of why the content was eventually restored or permanently banned.
*/