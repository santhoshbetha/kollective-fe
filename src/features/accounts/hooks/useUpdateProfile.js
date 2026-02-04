import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. The API Call
    mutationFn: (formData) => {
      // Mastodon/Kollective use PATCH for credentials
      return api.patch('/api/v1/accounts/update_credentials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(res => res.data);
    },

    // 2. Success Logic: Sync the new data everywhere
    onSuccess: (updatedUser) => {
      // Update the "Me" cache (the logged-in user)
      queryClient.setQueryData(['accounts', 'me'], updatedUser);
      
      // Update the general account cache for this ID
      queryClient.setQueryData(['accounts', updatedUser.id], updatedUser);

      // Invalidate any timelines/posts to reflect the new avatar/display name
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
    },
  });
};

/*
const EditProfileForm = ({ user }) => {
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateProfile(formData, {
      onSuccess: () => alert('Profile updated successfully!'),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="display_name" defaultValue={user.display_name} />
      <textarea name="note" defaultValue={user.note} />
      
      {/* File inputs for images *//*}
      <input type="file" name="avatar" />
      
      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
};

*/
