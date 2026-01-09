// Action-only slice for moderation actions. No local state — only actions.
import { defineMessages } from 'react-intl';
import { selectAccount } from '../../selectors/index.js';
import { TriangleAlert, UserMinus, UserX, Trash } from 'lucide-react';


const messages = defineMessages({
  deactivateUserHeading: { id: 'confirmations.admin.deactivate_user.heading', defaultMessage: 'Deactivate @{acct}' },
  deactivateUserPrompt: { id: 'confirmations.admin.deactivate_user.message', defaultMessage: 'You are about to deactivate @{acct}. Deactivating a user is a reversible action.' },
  deactivateUserConfirm: { id: 'confirmations.admin.deactivate_user.confirm', defaultMessage: 'Deactivate @{name}' },
  userDeactivated: { id: 'admin.users.user_deactivated_message', defaultMessage: '@{acct} was deactivated' },
  deleteUserHeading: { id: 'confirmations.admin.delete_user.heading', defaultMessage: 'Delete @{acct}' },
  deleteUserPrompt: { id: 'confirmations.admin.delete_user.message', defaultMessage: 'You are about to delete @{acct}. THIS IS A DESTRUCTIVE ACTION THAT CANNOT BE UNDONE.' },
  deleteUserConfirm: { id: 'confirmations.admin.delete_user.confirm', defaultMessage: 'Delete @{name}' },
  deleteLocalUserCheckbox: { id: 'confirmations.admin.delete_local_user.checkbox', defaultMessage: 'I understand that I am about to delete a local user.' },
  userDeleted: { id: 'admin.users.user_deleted_message', defaultMessage: '@{acct} was deleted' },
  deleteStatusHeading: { id: 'confirmations.admin.delete_status.heading', defaultMessage: 'Delete post' },
  deleteStatusPrompt: { id: 'confirmations.admin.delete_status.message', defaultMessage: 'You are about to delete a post by @{acct}. This action cannot be undone.' },
  deleteStatusConfirm: { id: 'confirmations.admin.delete_status.confirm', defaultMessage: 'Delete post' },
  rejectUserHeading: { id: 'confirmations.admin.reject_user.heading', defaultMessage: 'Reject @{acct}' },
  rejectUserPrompt: { id: 'confirmations.admin.reject_user.message', defaultMessage: 'You are about to reject @{acct} registration request. This action cannot be undone.' },
  rejectUserConfirm: { id: 'confirmations.admin.reject_user.confirm', defaultMessage: 'Reject @{name}' },
  statusDeleted: { id: 'admin.statuses.status_deleted_message', defaultMessage: 'Post by @{acct} was deleted' },
  markStatusSensitiveHeading: { id: 'confirmations.admin.mark_status_sensitive.heading', defaultMessage: 'Mark post sensitive' },
  markStatusNotSensitiveHeading: { id: 'confirmations.admin.mark_status_not_sensitive.heading', defaultMessage: 'Mark post not sensitive.' },
  markStatusSensitivePrompt: { id: 'confirmations.admin.mark_status_sensitive.message', defaultMessage: 'You are about to mark a post by @{acct} sensitive.' },
  markStatusNotSensitivePrompt: { id: 'confirmations.admin.mark_status_not_sensitive.message', defaultMessage: 'You are about to mark a post by @{acct} not sensitive.' },
  markStatusSensitiveConfirm: { id: 'confirmations.admin.mark_status_sensitive.confirm', defaultMessage: 'Mark post sensitive' },
  markStatusNotSensitiveConfirm: { id: 'confirmations.admin.mark_status_not_sensitive.confirm', defaultMessage: 'Mark post not sensitive' },
  statusMarkedSensitive: { id: 'admin.statuses.status_marked_message_sensitive', defaultMessage: 'Post by @{acct} was marked sensitive' },
  statusMarkedNotSensitive: { id: 'admin.statuses.status_marked_message_not_sensitive', defaultMessage: 'Post by @{acct} was marked not sensitive' },
});

export function createModerationSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
        deactivateUserModal(intl, accountId, afterConfirm = () => {}) {
            const root = rootGet();
            const acct = selectAccount(root, accountId)?.acct || '';
            const name = selectAccount(root, accountId)?.username || '';

            const message = intl.formatMessage(messages.deactivateUserPrompt, { acct });

            root.modal.openModalAction('CONFIRM', {
                icon: UserX,
                heading: intl.formatMessage(messages.deactivateUserHeading, { acct }),
                message,
                confirm: intl.formatMessage(messages.deactivateUserConfirm, { name }),
                onConfirm: () => {
                    root.admin.deactivateUsers([accountId])
                        .then(() => {
                              // toast.success(intl.formatMessage(messages.userDeactivated, { acct })); // TODO: later
                            afterConfirm();
                        })
                        .catch(() => {});
                },
            });
        },

    deleteUserModal(intl, accountId, afterConfirm = () => {}) {
      const root = rootGet();
      const account = selectAccount(root, accountId) || {};
      const acct = account.acct || '';
      const name = account.username || '';
      const local = account.local || false;

      const message = intl.formatMessage(messages.deleteUserPrompt, { acct });

      const confirm = intl.formatMessage(messages.deleteUserConfirm, { name });
      const checkbox = local ? intl.formatMessage(messages.deleteLocalUserCheckbox) : false;

      root.modal.openModalAction('CONFIRM', {
        icon: UserMinus,
        heading: intl.formatMessage(messages.deleteUserHeading, { acct }),
        message,
        confirm,
        checkbox,
        onConfirm: () => {
          root.admin.deleteUser(accountId)
            .then(() => {
              root.accounts.fetchAccountByUsername(acct);
              // toast.success(intl.formatMessage(messages.userDeleted, { acct })); // TODO: later
              afterConfirm();
            })
            .catch(() => {});
        },
      });
    },

        toggleStatusSensitivityModal(intl, statusId, sensitive, afterConfirm = () => {}) {
            const root = rootGet();
            const acct = root.statuses?.[statusId]?.account?.acct || '';

            root.modal.openModalAction('CONFIRM', {
                icon: TriangleAlert,
                heading: intl.formatMessage(
                    sensitive === false ? messages.markStatusSensitiveHeading : messages.markStatusNotSensitiveHeading,
                ),
                message: intl.formatMessage(
                    sensitive === false ? messages.markStatusSensitivePrompt : messages.markStatusNotSensitivePrompt,
                    { acct },
                ),
                confirm: intl.formatMessage(
                    sensitive === false ? messages.markStatusSensitiveConfirm : messages.markStatusNotSensitiveConfirm,
                ),
                onConfirm: () => {
                    root.admin.toggleStatusVisibility(statusId, sensitive)
                        .then(() => {
                            // toast.success(intl.formatMessage(
                            //   sensitive === false ? messages.statusMarkedSensitive : messages.statusMarkedNotSensitive,
                            //   { acct },
                            // ));
                        })
                        .catch(() => {});
                    afterConfirm();
                },
            });
        },

        deleteStatusModal(intl, statusId, afterConfirm = () => {}) {
            const root = rootGet();
            const acct = root.statuses?.[statusId]?.account?.acct || '';

            root.modal.openModalAction('CONFIRM', {
                icon: Trash,
                heading: intl.formatMessage(messages.deleteStatusHeading),
                message: intl.formatMessage(messages.deleteStatusPrompt, { acct }),
                confirm: intl.formatMessage(messages.deleteStatusConfirm),
                onConfirm: () => {
                    root.admin.deleteStatus(statusId)
                        .then(() => {
                              // toast.success(intl.formatMessage(messages.statusDeleted, { acct }));
                        })
                        .catch(() => {});
                    afterConfirm();
                },
            });
        }

  };
}

export default createModerationSlice;
