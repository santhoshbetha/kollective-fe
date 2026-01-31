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
  const getActions = () => rootGet();

  const getAccountInfo = (accountId) => {
    const account = selectAccount(rootGet(), accountId) || {};
    return {
      acct: account.acct || '',
      name: account.username || '',
      isLocal: !!account.local,
    };
  };

  return {
    deactivateUserModal(intl, accountId, afterConfirm = () => {}) {
      const actions = getActions();
      const { acct, name } = getAccountInfo(accountId);

      actions.openModalAction('CONFIRM', {
        icon: UserX,
        heading: intl.formatMessage(messages.deactivateUserHeading, { acct }),
        message: intl.formatMessage(messages.deactivateUserPrompt, { acct }),
        confirm: intl.formatMessage(messages.deactivateUserConfirm, { name }),
        onConfirm: async () => {
          try {
            await actions.deactivateUsers([accountId]);
            afterConfirm();
          } catch (e) { /* Error handling logic */ }
        },
      });
    },

    deleteUserModal(intl, accountId, afterConfirm = () => {}) {
      const { acct, name, isLocal } = getAccountInfo(accountId);
      const actions = getActions();

      actions.openModalAction('CONFIRM', {
        icon: UserMinus,
        heading: intl.formatMessage(messages.deleteUserHeading, { acct }),
        message: intl.formatMessage(messages.deleteUserPrompt, { acct }),
        confirm: intl.formatMessage(messages.deleteUserConfirm, { name }),
        checkbox: isLocal ? intl.formatMessage(messages.deleteLocalUserCheckbox) : false,
        onConfirm: async () => {
          try {
            await actions.deleteUser(accountId);
            actions.fetchAccountByUsername(acct);
            afterConfirm();
          } catch (e) { /* Error handling logic */ }
        },
      });
    },

    toggleStatusSensitivityModal(intl, statusId, sensitive, afterConfirm = () => {}) {
      const actions = getActions();
      const acct = rootGet().statuses?.[statusId]?.account?.acct || '';
      
      const isMarking = !sensitive; // logic cleanup: if sensitive is false, we are marking it sensitive

      actions.openModalAction('CONFIRM', {
        icon: TriangleAlert,
        heading: intl.formatMessage(isMarking ? messages.markStatusSensitiveHeading : messages.markStatusNotSensitiveHeading),
        message: intl.formatMessage(isMarking ? messages.markStatusSensitivePrompt : messages.markStatusNotSensitivePrompt, { acct }),
        confirm: intl.formatMessage(isMarking ? messages.markStatusSensitiveConfirm : messages.markStatusNotSensitiveConfirm),
        onConfirm: async () => {
          try {
            await actions.toggleStatusVisibility(statusId, sensitive);
            afterConfirm();
          } catch (e) { /* Error handling logic */ }
        },
      });
    },


    deleteStatusModal(intl, statusId, afterConfirm = () => {}) {
      const acct = rootGet().statuses?.[statusId]?.account?.acct || '';
      const actions = getActions();

      actions.openModalAction('CONFIRM', {
        icon: Trash,
        heading: intl.formatMessage(messages.deleteStatusHeading),
        message: intl.formatMessage(messages.deleteStatusPrompt, { acct }),
        confirm: intl.formatMessage(messages.deleteStatusConfirm),
        onConfirm: async () => {
          try {
            await actions.deleteStatus(statusId);
            afterConfirm();
          } catch (e) { /* Error handling logic */ }
        },
      });
    }

  };
}

export default createModerationSlice;
