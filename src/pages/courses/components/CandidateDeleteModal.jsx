import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../../../components/ui/Button";

const CandidateDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  remark,
  setRemark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50">
          <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
            <AlertTriangle size={20} /> Remove Candidate
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-slate-600 text-sm">
            Are you sure you want to remove this candidate? This action will
            mark them as deleted. Please provide a reason.
          </p>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Reason / Remark
            </label>
            <textarea
              className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none h-24"
              placeholder="Enter reason for removal..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={!remark}
            >
              Remove Candidate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDeleteModal;


