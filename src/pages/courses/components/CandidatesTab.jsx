import React from "react";
import { Mail, Trash2, MapPin } from "lucide-react";
import { Button } from "../../../components/ui/Button";

const CandidatesTab = ({
  candidates = [],
  onEmail,
  onVenue,
  onDelete,
  onAdd,
  onStatusPoolChange,
  isTrainerRole = false,
  courseEnded = false,
  typeOfLocation = "Online",
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">Enrolled Candidates</h3>
        {!isTrainerRole && (
          <Button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            Add Candidates
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 text-left text-sm font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3">Sr. No.</th>
              <th className="px-4 py-3">Candidate Name</th>
              <th className="px-4 py-3">DOB</th>
              <th className="px-4 py-3">Nationality</th>
              <th className="px-4 py-3">CDC/Passport</th>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Seaman No</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Manning co / Manager</th>
              <th className="px-4 py-3">Status Pool</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan="11" className="px-4 py-8 text-center text-slate-500">
                  No candidates enrolled yet.
                </td>
              </tr>
            ) : (
              candidates.map((candidate, idx) => (
                <tr key={candidate.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-600 font-medium">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                    {candidate.candidate_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                    {candidate.dob ? new Date(candidate.dob).toLocaleDateString("en-GB") : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {candidate.nationality || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {candidate.cdc_passport || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {candidate.rank || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {candidate.seaman_book_no || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {candidate.designation || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {candidate.manager || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={candidate.status_pool || ""}
                      onChange={(e) =>
                        onStatusPoolChange(candidate.candidate_id, e.target.value)
                      }
                      className="h-9 px-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 outline-none w-24"
                    >
                      <option value="">Select</option>
                      <option value="LNG">LNG</option>
                      <option value="LPG">LPG</option>
                      <option value="DRY">DRY</option>
                      <option value="TANKERS">TANKERS</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEmail(candidate.candidate_id)}
                        title="Send Welcome Letter"
                        className="h-8 w-8 p-0"
                      >
                        <Mail
                          size={16}
                          className={
                            candidate.candidate_email_status
                              ? "text-green-500"
                              : "text-slate-400"
                          }
                        />
                      </Button>
                      {typeOfLocation !== "Online" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onVenue(candidate.candidate_id)}
                          title="Venue Details"
                          className="h-8 w-8 p-0"
                        >
                          <MapPin size={16} className="text-slate-500" />
                        </Button>
                      )}
                      {!isTrainerRole && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={courseEnded}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 h-8 w-8 p-0"
                          onClick={() => onDelete(candidate.candidate_id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CandidatesTab;
