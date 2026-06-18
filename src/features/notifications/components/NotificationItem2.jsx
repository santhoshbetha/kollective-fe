//#"Town Hall" Notifications,
if (note.type === 'town_hall') {
  return (
    <div className="bg-purple-50 border-l-4 border-purple-600 p-4 mb-2 animate-pulse">
      <div className="flex items-center">
        <UsersIcon className="h-5 w-5 text-purple-600 mr-2" />
        <span className="font-bold text-purple-900">District Town Hall</span>
      </div>
      <p className="text-sm text-purple-800">{note.message}</p>
      <button className="mt-2 text-xs font-bold text-purple-700 underline">Watch Response</button>
    </div>
  );
}

/*
4. Why this is the "Aha Moment" for Discovery:

    Massive Reach: Instead of a candidate's video being "buried" in a general feed, it is pushed to exactly the people who can vote for them.
    Incentivized Candidates: Candidates are more likely to answer questions if they know it triggers a notification to their entire voter base.
    Constituent Value: Users feel the app is a direct line to their government, increasing retention and community "Voice."
*/

