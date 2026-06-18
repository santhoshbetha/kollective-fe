// React: CandidateProfile.js
//# "Candidate Profiles" where users can see a candidate's platform and all their uploaded videos in one place
const CandidateProfile = ({ profile }) => {
  const { candidate_info } = profile;

  return (
    <div className="profile-container">
      {/* Candidate Banner */}
      {candidate_info.is_verified && (
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg">
          <div>
            <h2 className="text-lg font-bold">Verified Candidate</h2>
            <p className="text-sm opacity-90">{candidate_info.role} - {candidate_info.district}</p>
          </div>
          <CheckBadgeIcon className="h-8 w-8" />
        </div>
      )}

      {/* Profile Bio */}
      <div className="p-6 bg-white shadow">
        <h1 className="text-3xl font-bold">@{profile.nickname}</h1>
        <p className="text-gray-700 mt-2">{profile.bio}</p>
        
        {candidate_info.official_website && (
          <a href={candidate_info.official_website} className="text-blue-500 underline mt-2 block">
            Official Campaign Website
          </a>
        )}
      </div>

      {/* Video Grid Feed */}
      <div className="video-grid mt-6">
        <h3 className="font-bold mb-4">Campaign Videos</h3>
        {/* Map through videos fetched from /api/profiles/:nickname/videos */}
      </div>
    </div>
  );
  /*
5. Why this works for District Discovery:

    Hierarchical Trust: By showing exactly which district the candidate is verified for, you prevent "out-of-district" confusion.
    Consolidated Platform: Users in a specific State Senate District can go to a candidate's profile and see a curated list of their ideas and videos in one place.
    Accountability: Linking to an official website directly from the verified profile creates a secure bridge between your app and the candidate's actual campaign.
  */
};
