/*

  # Organization Badges (e.g., "Local Verified Partner") provides visual trust and helps users
  # distinguish between standard news groups and official community partners. You can manage
  # this via an Admin-only flag in your database and display it as a specific UI treatment in React

  Use the type returned from the API to apply specific Tailwind classes or icons.
*/
// React: OrgBadge.js
const OrgBadge = ({ badge }) => {
  if (badge.type === 'none') return null;

  const styles = {
    partner: "bg-gold-100 text-gold-800 border-gold-300",
    verified: "bg-blue-100 text-blue-800 border-blue-300"
  };

  return (
    <span className={`flex items-center px-2 py-0.5 rounded-full border text-xs font-bold ${styles[badge.type]}`}>
      {badge.type === 'partner' ? <StarIcon className="h-3 w-3 mr-1" /> : <CheckIcon className="h-3 w-3 mr-1" />}
      {badge.label}
    </span>
  );
};

/*
Why this is a Discovery Powerhouse:

    Visual Authority: A "Local Verified Partner" badge signals to the District residents that the organization is a trusted community fixture.
    Tiered Credibility: You can have different badges for Journalist Collectives vs. Official Government Partners, helping users navigate their State and Country tabs effectively.
    Search Preference: You can boost "Verified Partners" in the Organization Search results so they appear at the top.
*/
