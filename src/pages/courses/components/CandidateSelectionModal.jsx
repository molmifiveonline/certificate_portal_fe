import React from "react";
import { Button } from "../../../components/ui/button";

const CandidateSelectionModal = ({
  isOpen,
  onClose,
  availableCandidates,
  selectedCandidates,
  setSelectedCandidates,
  candidateSearch,
  setCandidateSearch,
  onAdd,
}) => {
  if (!isOpen) return null;

  const filteredCandidates = availableCandidates.filter((c) => {
    const name = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
    const search = candidateSearch.toLowerCase();
    return (
      name.includes(search) || c.empId?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
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
            placeholder="Search candidates..."
            className="w-full px-4 py-2 border rounded-lg"
            value={candidateSearch}
            onChange={(e) => setCandidateSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 font-semibold text-slate-600 sticky top-0">
              <tr>
                <th className="px-4 py-2">Select</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Emp ID</th>
                <th className="px-4 py-2">Rank</th>
                <th className="px-4 py-2">Passport</th>
                <th className="px-4 py-2">Seaman No.</th>
                <th className="px-4 py-2">Manager</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate) => (
                <tr
                  key={candidate.id}
                  className="hover:bg-slate-50 border-b border-slate-50"
                >
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3 font-medium">
                    {candidate.first_name} {candidate.last_name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {candidate.empId}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{candidate.rank}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {candidate.cdc_passport || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {candidate.seaman_book_no || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {candidate.manager || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onAdd} disabled={selectedCandidates.length === 0}>
            Add {selectedCandidates.length} Candidates
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CandidateSelectionModal;
