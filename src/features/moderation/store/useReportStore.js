// src/features/moderation/store/useReportStore.ts
import { create } from 'zustand';

/*
interface ReportStore {
  isOpen: boolean;
  targetStatus: any | null;
  openReport: (status: any) => void;
  closeReport: () => void;
}
*/

export const useReportStore = create((set) => ({
  isOpen: false,
  targetStatus: null,
  openReport: (status) => set({ isOpen: true, targetStatus: status }),
  closeReport: () => set({ isOpen: false, targetStatus: null }),
}));

//==================================================================================
// src/features/moderation/store/useReportStore.js
import { create } from 'zustand';

export const useReportStore = create((set) => ({
  newReport: {
    accountId: null,
    statusIds: [],
    ruleIds: [],
    comment: '',
    forward: false,
  },
  
  setComment: (comment) => set((s) => ({ newReport: { ...s.newReport, comment } })),
  toggleRule: (ruleId) => set((s) => {
    const rules = s.newReport.ruleIds.includes(ruleId)
      ? s.newReport.ruleIds.filter(id => id !== ruleId)
      : [...s.newReport.ruleIds, ruleId];
    return { newReport: { ...s.newReport, ruleIds: rules } };
  }),
  resetReport: () => set({ newReport: { accountId: null, statusIds: [], ruleIds: [], comment: '', forward: false } })
}));

