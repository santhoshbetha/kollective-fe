import { create } from 'zustand';

export const useListModalStore = create((set) => ({
  isOpen: false,
  targetAccountId: null, // The user we want to add to a list
  
  // Actions
  openAddToList: (accountId) => set({ isOpen: true, targetAccountId: accountId }),
  closeModal: () => set({ isOpen: false, targetAccountId: null }),
}));


/*
import { useListModalStore } from '../store/useListModalStore';
import { useUserLists, useListMembership, useListActions } from '../api/useLists';

const AddToListModal = () => {
  const { isOpen, targetAccountId, closeModal } = useListModalStore();
  const { data: lists, isLoading } = useUserLists();
  const { addAccountToList, removeAccountFromList } = useListActions();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Add to List</h3>
        {isLoading ? <Spinner /> : (
          <ul>
            {lists.map(list => (
              <ListToggleItem 
                key={list.id} 
                list={list} 
                accountId={targetAccountId} 
                onAdd={() => addAccountToList.mutate({ listId: list.id, accountId: targetAccountId })}
                onRemove={() => removeAccountFromList.mutate({ listId: list.id, accountId: targetAccountId })}
              />
            ))}
          </ul>
        )}
        <button onClick={closeModal}>Done</button>
      </div>
    </div>
  );
};

*/