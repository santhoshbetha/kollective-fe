import { getIn } from "../../utils/immutableSafe";

export function createReportsSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

   // Helper to define initial/reset state for 'new'
  const initialState = () => ({
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
  });

  // get not used
  return {
    new: initialState(),

    reportInit(account, entityType, chatMessage, status, group) {
      setScoped((state) => {
        const isNewAccount = state.new.account_id !== account?.id;
        
        state.new.isSubmitting = false;
        state.new.entityType = entityType || "";
        state.new.account_id = account?.id || null;
        state.new.chat_message = chatMessage || null;
        state.new.group = group || null;

        if (isNewAccount) {
          state.new.status_ids = status ? new Set([status.reblog?.id || status.id]) : new Set();
          state.new.comment = "";
        } else if (status) {
          state.new.status_ids.add(status.reblog?.id || status.id);
        }
      });
    },

    reportStatusToggle(statusId, checked) {
      setScoped((state) => {
        if (checked) {
          state.new.status_ids.add(statusId);
        } else {
          state.new.status_ids.delete(statusId);
        }
      });
    },

    reportCommentChange: (comment) => setScoped((s) => { s.new.comment = comment; }),
    reportForwardChange: (forward) => setScoped((s) => { s.new.forward = forward; }),
    reportBlockChange: (block) => setScoped((s) => { s.new.block = block; }),

    reportRuleChange(ruleId) {
      setScoped((state) => {
        if (state.new.rule_ids.has(ruleId)) {
          state.new.rule_ids.delete(ruleId);
        } else {
          state.new.rule_ids.add(ruleId);
        }
      });
    },

    reportSubmitRequest: () => setScoped((s) => { s.new.isSubmitting = true; }),
    reportSubmitFail: () => setScoped((s) => { s.new.isSubmitting = false; }),

    reportReset() {
      setScoped((state) => {
        state.new = initialState();
      });
    },

    resetReportState() {
      setScoped((state) => {
        state.new = {
          ...state.new,
          ...initialState(),
        };
      });
    },

    reportCancel() {
      const actions = getActions();
      actions.resetReportState();
    },

    reportSubmitSuccess() {
      const actions = getActions();
      actions.resetReportState();
    },
    initReportAction(entityType, account, entities) {
      const actions = getActions();
      const { status, chatMessage, group } = entities || {};

      actions.reports.reportInit(
        account,
        entityType,
        chatMessage,
        status,
        group
      );
    },

    async submitReport() {
      const actions = getActions();
      const reportState = actions.reports.new;

      try {
        actions.reports.reportSubmitRequest();

        const res = await fetch(`/api/v1/reports`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            account_id: reportState.account_id,
            status_ids: Array.from(reportState.status_ids),
            rule_ids: Array.from(reportState.rule_ids),
            message_id: reportState.chat_message?.id ? [reportState.chat_message.id] : [],
            group_id: reportState.group?.id || null,
            comment: reportState.comment,
            forward: reportState.forward,
          }),
        });

        if (!res.ok) throw new Error("Report submission failed");

        const data = await res.json();
        
        // Handle post-submit cleanup
        if (reportState.block && reportState.account_id) {
          actions.accounts?.block?.(reportState.account_id);
        }

        actions.reports.reportReset();
        return data;
      } catch (error) {
        console.error("Error submitting report:", error);
        actions.reports.reportSubmitFail();
        throw error;
      }
    },

  };
}

export default createReportsSlice;
