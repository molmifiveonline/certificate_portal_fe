import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";

const AttendanceRemarkModal = ({
  isOpen,
  onClose,
  onSubmit,
  status,
  candidateName,
  date,
}) => {
  const [reason, setReason] = useState("");

  const formatDateDMY = (dateStr) => {
    if (!dateStr) return "-";
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dateStr;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {status === "holiday" ? "Mark Holiday" : "Mark Absent"}
            </h3>
            <p className="text-sm text-slate-500">
              {candidateName} - {formatDateDMY(date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
          >
            <Trash2 size={20} className="rotate-45" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Reason / Remark <span className="text-red-500">*</span>
            </label>
            <textarea
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Enter reason for ${status}...`}
              className="w-full h-32 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none text-slate-600"
            />
          </div>
        </div>
        <div className="p-6 bg-slate-50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!reason.trim()} onClick={() => onSubmit(reason)}>
            Save Status
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRemarkModal;
