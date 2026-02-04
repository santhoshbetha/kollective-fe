import { useForm } from 'react-hook-form';
import { Send } from 'lucide-react';
import { usePostReply } from '../api/useStatuses';

//src/components/Conversation/ReplyForm.jsx //check later

export const ReplyForm = ({ statusId, conversationId, onCancel }) => {
  //const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const { register, handleSubmit, reset } = useForm();

  // Initialize the mutation
  const { mutate, isPending } = usePostReply(conversationId);

  const onSubmit = async (data) => {
    // Replace with your actual mutation logic (e.g., useMutation)
    console.log(`Replying to ${statusId} with:`, data.comment);
    mutate(
      { statusId, content: data.comment },
      {
        onSuccess: () => {
          reset();     // Clear text
          onCancel();  // Close form
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 ml-14 bg-gray-50 p-3 rounded-lg border border-gray-200">
      <textarea
        {...register("comment", { required: true })}
        placeholder="Post your reply..."
        className="w-full bg-transparent border-none focus:ring-0 text-[15px] resize-none"
        rows={3}
        autoFocus
      />
      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-200">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-3 py-1 text-sm font-semibold text-gray-500 hover:bg-gray-200 rounded-md"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-1 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-full disabled:opacity-50"
        >
          {isPending ? 'Posting...' : <><Send size={14} /> Reply</>}
        </button>
      </div>
    </form>
  );
};

/*
Why this works so well:

    Cache Invalidation: When the reply is posted, invalidateQueries tells TanStack Query that the conversation data is now "old." It automatically re-runs fetchContext, which updates the ancestors and descendants lists.
    No Manual State: You don't have to manually push the new reply into an array; the Server State remains the single source of truth.
    Error Handling: If the API fails, the form stays open, and the user doesn't lose their typed comment.

*/

/*
One Final Touch: setQueryData (Optional)
If you want the reply to show up instantly without waiting for the network, you can use Optimistic Updates. But for most apps, the invalidateQueries approach is safer and easier to maintain.
*/
