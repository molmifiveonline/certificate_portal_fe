import React from "react";
import { Video, MapPin } from "lucide-react";
import { Button } from "../../../components/ui/button";

const EmailTypeModal = ({ isOpen, onClose, onSendOnline, onSendOffline, candidateId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
        <h3 className="text-lg font-bold mb-4">Send Welcome Letter</h3>
        <p className="text-sm text-slate-500 mb-6">
          Select the type of email to send.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => onSendOnline(candidateId)}
            className="w-full justify-start gap-2"
          >
            <Video size={16} /> Online Class (Zoom)
          </Button>
          <Button
            variant="outline"
            onClick={() => onSendOffline(candidateId)}
            className="w-full justify-start gap-2"
          >
            <MapPin size={16} /> Offline Class (Venue)
          </Button>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailTypeModal;
