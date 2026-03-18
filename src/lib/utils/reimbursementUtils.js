export const REIMBURSEMENT_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  RESUBMISSION_REQUESTED: "resubmission_requested",
  RESUBMITTED: "resubmitted",
  APPROVED: "approved",
  DISAPPROVED: "disapproved",
};

export const REIMBURSEMENT_STATUS_LABELS = {
  [REIMBURSEMENT_STATUS.DRAFT]: "Draft",
  [REIMBURSEMENT_STATUS.SUBMITTED]: "Submitted",
  [REIMBURSEMENT_STATUS.RESUBMISSION_REQUESTED]: "Resubmission Requested",
  [REIMBURSEMENT_STATUS.RESUBMITTED]: "Resubmitted",
  [REIMBURSEMENT_STATUS.APPROVED]: "Approved",
  [REIMBURSEMENT_STATUS.DISAPPROVED]: "Disapproved",
};

export const REIMBURSEMENT_STATUS_STYLES = {
  [REIMBURSEMENT_STATUS.DRAFT]:
    "bg-slate-100 text-slate-700 border-slate-200",
  [REIMBURSEMENT_STATUS.SUBMITTED]:
    "bg-blue-50 text-blue-700 border-blue-200",
  [REIMBURSEMENT_STATUS.RESUBMISSION_REQUESTED]:
    "bg-amber-50 text-amber-700 border-amber-200",
  [REIMBURSEMENT_STATUS.RESUBMITTED]:
    "bg-indigo-50 text-indigo-700 border-indigo-200",
  [REIMBURSEMENT_STATUS.APPROVED]:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  [REIMBURSEMENT_STATUS.DISAPPROVED]:
    "bg-rose-50 text-rose-700 border-rose-200",
};

export const REIMBURSEMENT_EXPENSE_CATEGORIES = [
  { value: "travel", label: "Travel" },
  { value: "lodging", label: "Lodging" },
  { value: "food", label: "Food" },
  { value: "local_conveyance", label: "Local Conveyance" },
  { value: "other", label: "Other" },
];

export const REIMBURSEMENT_PAYMENT_MODES = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
];

export const getReimbursementStatusLabel = (status) =>
  REIMBURSEMENT_STATUS_LABELS[status] || "Unknown";

export const canCandidateEditReimbursement = (status) =>
  [
    REIMBURSEMENT_STATUS.DRAFT,
    REIMBURSEMENT_STATUS.RESUBMISSION_REQUESTED,
  ].includes(status);

export const canCandidateSubmitReimbursement = (status) =>
  canCandidateEditReimbursement(status);

export const canAdminTakeDecision = (status) =>
  [
    REIMBURSEMENT_STATUS.SUBMITTED,
    REIMBURSEMENT_STATUS.RESUBMITTED,
  ].includes(status);

export const getReimbursementPayload = (values) => ({
  active_course_id: values.active_course_id || "",
  claim_date: values.claim_date || "",
  expense_category: values.expense_category || "",
  expense_description: values.expense_description || "",
  amount: values.amount || "",
  payment_mode: values.payment_mode || "",
  bank_account_holder_name: values.bank_account_holder_name || "",
  bank_name: values.bank_name || "",
  account_number: values.account_number || "",
  ifsc_code: values.ifsc_code || "",
  candidate_notes: values.candidate_notes || "",
});

export const toMultipartFormData = (values, attachments = []) => {
  const formData = new FormData();
  const payload = getReimbursementPayload(values);

  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value);
  });

  attachments.forEach((file) => {
    if (file instanceof File) {
      formData.append("attachments", file);
    }
  });

  return formData;
};
