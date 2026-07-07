import React from "react";
import { MessageSquareText } from "lucide-react";

const remarkRows = [
  { key: "admin_remarks", label: "Admin Remarks" },
  { key: "resubmission_remarks", label: "Resubmission Remarks" },
  { key: "disapproval_remarks", label: "Disapproval Remarks" },
];

const ReimbursementRemarksPanel = ({ reimbursement }) => {
  const visibleRemarks = remarkRows.filter(
    ({ key }) => reimbursement?.[key]?.trim?.(),
  );

  if (visibleRemarks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-5 text-sm text-slate-500">
        No feedback has been shared yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleRemarks.map(({ key, label }) => (
        <div
          key={key}
          className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm"
        >
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <MessageSquareText className="h-4 w-4 text-blue-600" />
            {label}
          </div>
          <p className="text-sm leading-6 text-slate-600">
            {reimbursement[key]}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReimbursementRemarksPanel;
