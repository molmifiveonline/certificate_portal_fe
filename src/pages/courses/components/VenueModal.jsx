import React from "react";
import { Button } from "../../../components/ui/button";
import { InputField } from "./FormHelpers";

const VenueModal = ({ isOpen, onClose, onSubmit, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Edit Candidate Venue</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <InputField
            label="Venue Name"
            name="venue_name"
            defaultValue={data?.venue_name}
            placeholder="e.g. Hotel ..."
          />
          <InputField
            label="Venue Address"
            name="venue_address"
            defaultValue={data?.venue_address}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Contact"
              name="venue_contact"
              defaultValue={data?.venue_contact}
            />
            <InputField
              label="Email"
              name="venue_email"
              defaultValue={data?.venue_email}
            />
          </div>
          <InputField
            label="Map Link"
            name="venue_map_link"
            defaultValue={data?.venue_map_link}
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Offline Date"
              name="offline_date"
              type="date"
              defaultValue={data?.offline_date}
            />
            <InputField
              label="Remarks"
              name="remarks"
              defaultValue={data?.remarks}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">
              Attach Files
            </label>
            <input
              type="file"
              name="venue_files"
              multiple
              className="text-sm"
            />
            <p className="text-xs text-slate-500">
              Allowed: Images, PDF, Word
            </p>
          </div>

          {data?.files && data.files.length > 0 && (
            <div className="mt-2 text-sm">
              <p className="font-medium">Uploaded Files:</p>
              <ul className="list-disc pl-5">
                {data.files.map((f) => (
                  <li key={f.id}>{f.file_name}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">Save Venue Details</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VenueModal;
