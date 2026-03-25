import React from "react";
import { Button } from "../../../components/ui/button";

const CourseActionModal = ({ isOpen, onClose, onConfirm, type, reason, setReason }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-6">
        <h3 className="text-lg font-bold mb-4 capitalize">{type} Course</h3>
        <p className="text-sm text-slate-500 mb-4">
          Please provide a reason for {type === "cancel" ? "cancelling" : "completing"} this course.
        </p>
        <textarea
          className="w-full h-32 p-3 border rounded-lg resize-none mb-6 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type reason here..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={type === "cancel" ? "destructive" : "default"}
            onClick={onConfirm}
            className={type === "complete" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            Confirm {type === "cancel" ? "Cancellation" : "Completion"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseActionModal;
