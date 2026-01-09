import { getIn } from "../../utils/immutableSafe";

export function createReportsSlice(setScoped, getScoped, rootSet, rootGet) {
  const set = setScoped;
  // get not used
  return {
    new: {
      isSubmitting: false,
      entityType: "",
      account_id: null,
      status_ids: new Set(),
      chat_message: null,
      group: null,
      comment: "",
      forward: false,
      block: false,
      rule_ids: new Set(),
    },

    reportInit(account, entityType, chatMessage, status, group) {
      set((state) => {
        state.new.isSubmitting = false;
        state.new.entityType = entityType || "";
        state.new.account_id = account?.id || null;

        if (chatMessage) {
          state.new.chat_message = chatMessage;
        }

        if (group) {
          state.new.group = group;
        }

        if (state.new.account_id != account?.id) {
          state.new.status_ids = status
            ? new Set([status.reblog?.id || status.id])
            : new Set();
          set.new.comment = "";
        } else if (status) {
          state.new.status_ids.add(status.reblog?.id || status.id);
        }
      });
    },

    reportStatusToggle(statusId, checked) {
      set((state) => {
        if (checked) {
          state.new.status_ids.add(statusId);
          return;
        }
        if (state.new.status_ids.has(statusId)) {
          state.new.status_ids.delete(statusId);
        }
      });
    },

    reportCommentChange(comment) {
      set((state) => {
        state.new.comment = comment;
      });
    },

    reportforwardChange(forward) {
      set((state) => {
        state.new.forward = forward;
      });
    },

    reportBlockChange(block) {
      set((state) => {
        state.new.block = block;
      });
    },

    reportRuleChange(rule_id) {
      set((state) => {
        if (state.new.rule_ids.has(rule_id)) {
          state.new.rule_ids.delete(rule_id);
          return;
        }
        state.new.rule_ids.add(rule_id);
      });
    },

    reportSubmitRequest() {
      set((state) => {
        state.new.isSubmitting = true;
      });
    },

    reportSubmitFail() {
      set((state) => {
        state.new.isSubmitting = false;
      });
    },

    reportCancel() {
      set((state) => {
        state.new.isSubmitting = false;
        state.new.account_id = null;
        state.new.rule_ids = new Set();
        state.new.chat_message = null;
        state.new.group = null;
        state.new.comment = "";
        state.new.block = false;
      });
    },

    reportSubmitSuccess() {
      set((state) => {
        state.new.isSubmitting = false;
        state.new.account_id = null;
        state.new.rule_ids = new Set();
        state.new.chat_message = null;
        state.new.group = null;
        state.new.comment = "";
        state.new.block = false;
      });
    },

    initReportAction(entityType, account, entities) {
      const { status, chatMessage, group } = entities || {};

      this.initReport(
        entityType,
        account,
        status,
        chatMessage,
        group,
      );
    },

    submitReport() {
      const root = rootGet();
      const { reports } = root;

      try {
        const res = fetch(`/api/v1/reports`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${root.auth.app?.access_token}`,
          },
          body: JSON.stringify({
            account_id: reports.new.account_id,
            status_ids: Array.from(reports.new.status_ids),
            message_id: [getIn(root.reports, ['new', 'chat_message', 'id'])].filter(Boolean),
            group_id: getIn(root.reports, ['new', 'group', 'id']) || null,
            rule_ids: Array.from(reports.new.rule_ids),
            comment: reports.new.comment,
            forward: reports.new.forward
          }),
        });

        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        return res.json();
      } catch (error) {
        console.error("Error submitting report:", error);
        this.reportSubmitFail();
        throw error;
      }
    },


  };
}

export default createReportsSlice;
