/*
  #"Verification Requests," where organization admins can submit an
  #application for a partner badge directly from their dashboard

  3. The React Submission Form
In the Organization Dashboard, provide a form where admins can select the desired badge type and provide evidence.


*/

// React: VerificationApplyForm.js
const handleApply = async (e) => {
  e.preventDefault();
  const res = await fetch(`/api/organizations/${orgId}/verification_requests`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      requested_badge_type: badgeType,
      submission_data: { website: officialUrl, proof: documentLink } 
    })
  });
  if (res.ok) alert("Verification request submitted for review.");
};
