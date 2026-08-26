import React from "react";
import { Button } from "../../../components/ui/Button";
import { formatDate } from "../../../lib/utils/dateUtils";

const CandidateSelectionModal = ({
  isOpen,
  onClose,
  availableCandidates,
  selectedCandidates,
  setSelectedCandidates,
  candidateSearch,
  setCandidateSearch,
  onAdd,
  isAdding = false,
}) => {
  if (!isOpen) return null;

  const filteredCandidates = availableCandidates.filter((c) => {
    const search = candidateSearch.toLowerCase().trim();
    if (!search) return true;
    const name = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
    const empId = (c.empId || c.employee_id || "").toLowerCase();
    const email = (c.email || "").toLowerCase();
    const indos = (c.indos_number || "").toLowerCase();
    const rank = (c.rank || "").toLowerCase();
    const passport = (c.cdc_passport || c.passport_no || "").toLowerCase();
    const designation = (c.designation || "").toLowerCase();
    const manager = (c.manager || c.manning_company || "").toLowerCase();
    const seamanNo = (c.seaman_book_no || "").toLowerCase();
    const candidateId = (c.id ? String(c.id) : "").toLowerCase();

    return (
      name.includes(search) ||
      empId.includes(search) ||
      email.includes(search) ||
      indos.includes(search) ||
      rank.includes(search) ||
      passport.includes(search) ||
      designation.includes(search) ||
      manager.includes(search) ||
      seamanNo.includes(search) ||
      candidateId.includes(search)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-7xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold">Select Candidates</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>

        <div className="p-4 border-b border-slate-100">
          <input
            type="text"
            placeholder="Search by name, candidate ID, emp ID, email, passport, rank, designation..."
            className="w-full px-4 py-2 border rounded-lg"
            value={candidateSearch}
            onChange={(e) => setCandidateSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-auto p-4 min-h-0">
          <table className="w-full min-w-[1300px] text-left border-collapse">
            <thead className="bg-slate-50 font-semibold text-slate-600 text-[10px] uppercase tracking-wider sticky top-0 border-b border-slate-200 shadow-sm">
              <tr>
                <th className="w-10 px-2 py-2.5 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={
                      filteredCandidates.length > 0 &&
                      selectedCandidates.length === filteredCandidates.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCandidates(filteredCandidates.map((c) => c.id));
                      } else {
                        setSelectedCandidates([]);
                      }
                    }}
                  />
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap min-w-[140px]">Candidate Name</th>
                <th className="px-2 py-2.5 whitespace-nowrap w-24">Emp ID</th>
                <th className="px-3 py-2.5 whitespace-nowrap min-w-[170px]">Email / Contact</th>
                <th className="px-2 py-2.5 whitespace-nowrap w-24">DOB</th>
                <th className="px-2 py-2.5 whitespace-nowrap w-28">Certificate Date</th>
                <th className="px-2 py-2.5 whitespace-nowrap w-24">Nationality</th>
                <th className="px-2 py-2.5 whitespace-nowrap w-28">CDC / Passport</th>
                <th className="px-2 py-2.5 whitespace-nowrap w-20">Rank</th>
                <th className="px-2 py-2.5 whitespace-nowrap w-24">Seaman No</th>
                <th className="px-2 py-2.5 whitespace-nowrap min-w-[120px]">Designation</th>
                <th className="px-2 py-2.5 whitespace-nowrap min-w-[140px]">Manning co / Manager</th>
                <th className="px-2 py-2.5 whitespace-nowrap w-24">Status Pool</th>
                <th className="px-2 py-2.5 whitespace-nowrap min-w-[120px]">Last Vessel</th>
                <th className="px-2 py-2.5 whitespace-nowrap w-24">INDoS Number</th>
                <th className="px-2 py-2.5 whitespace-nowrap w-20">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="16" className="px-4 py-12 text-center text-slate-400">
                    No candidates found.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="w-10 px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setSelectedCandidates([
                              ...selectedCandidates,
                              candidate.id,
                            ]);
                          else
                            setSelectedCandidates(
                              selectedCandidates.filter(
                                (id) => id !== candidate.id,
                              ),
                            );
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-900 text-xs whitespace-nowrap">
                      {candidate.first_name} {candidate.last_name || ""}
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-600 font-mono whitespace-nowrap">
                      {candidate.empId || candidate.employee_id || "-"}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                      <div>{candidate.email || "-"}</div>
                      {candidate.mobile && (
                        <div className="text-[11px] text-slate-400">{candidate.mobile}</div>
                      )}
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(candidate.dob)}
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(candidate.previous_certificate_date)}
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                      {candidate.nationality || "-"}
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                      {candidate.cdc_passport || candidate.passport_no || "-"}
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                      {candidate.rank || "-"}
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                      {candidate.seaman_book_no || "-"}
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                      {candidate.designation || "-"}
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                      {candidate.manager || candidate.manning_company || "-"}
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                      {candidate.status_pool || candidate.vessel_type || "-"}
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                      {candidate.last_vessel || candidate.last_vessel_name || "-"}
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-500 font-mono whitespace-nowrap">
                      {candidate.indos_number || "-"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold uppercase tracking-widest">
                        {candidate.registration_type || "Others"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose} disabled={isAdding}>
            Cancel
          </Button>
          <Button onClick={onAdd} disabled={selectedCandidates.length === 0 || isAdding}>
            {isAdding ? "Adding..." : `Add ${selectedCandidates.length} Candidates`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CandidateSelectionModal;


