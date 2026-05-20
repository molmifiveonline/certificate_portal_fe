import React, { useEffect, useMemo, useState } from "react";
import { Mail, Trash2, MapPin, Eye } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { formatDate } from "../../../lib/utils/dateUtils";

const CandidatesTab = ({
  candidates = [],
  onEmail,
  onVenue,
  onDelete,
  onAdd,
  onStatusPoolChange,
  onObserverToggle,
  onBulkEmail,
  isTrainerRole = false,
  courseEnded = false,
  typeOfLocation = "Online",
  bulkEmailLoading = false,
}) => {
  const [selectedEmailCandidates, setSelectedEmailCandidates] = useState([]);
  const isOnlineCourse = typeOfLocation === "Online";
  const showBulkEmail = !isTrainerRole && isOnlineCourse;

  const candidateIds = useMemo(
    () => candidates.map((candidate) => candidate.candidate_id).filter(Boolean),
    [candidates],
  );

  useEffect(() => {
    setSelectedEmailCandidates([]);
  }, [candidateIds, typeOfLocation]);

  const getCandidateValue = (candidate, keys, fallback = "-") => {
    const keyList = Array.isArray(keys) ? keys : [keys];
    for (const key of keyList) {
      const value = candidate[key];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
    return fallback;
  };

  const trainerColumns = [
    {
      label: "Employee ID",
      render: (candidate) =>
        getCandidateValue(candidate, ["empId", "employee_id", "employeeId"]),
    },
    {
      label: "Employee Name",
      render: (candidate) =>
        getCandidateValue(candidate, [
          "employee_name",
          "candidate_name",
          "name",
        ]),
    },
    {
      label: "Passport No.",
      render: (candidate) =>
        getCandidateValue(candidate, [
          "passport_no",
          "passportNo",
          "cdc_passport",
        ]),
    },
    {
      label: "Email Address",
      render: (candidate) =>
        getCandidateValue(candidate, ["email", "email_address"]),
    },
    {
      label: "DOB",
      render: (candidate) => formatDate(candidate.dob),
    },
    {
      label: "Certificate Date",
      render: (candidate) => formatDate(candidate.previous_certificate_date),
    },
    {
      label: "Designation",
      render: (candidate) => getCandidateValue(candidate, "designation"),
    },
    {
      label: "Nationality",
      render: (candidate) => getCandidateValue(candidate, "nationality"),
    },
    {
      label: "Manager",
      render: (candidate) =>
        getCandidateValue(candidate, ["manager", "manning_company"]),
    },
    {
      label: "Location Type",
      render: (candidate) =>
        getCandidateValue(
          candidate,
          ["location_type", "type_of_location"],
          typeOfLocation,
        ),
    },
  ];

  const allEmailCandidatesSelected =
    candidateIds.length > 0 &&
    candidateIds.every((candidateId) =>
      selectedEmailCandidates.includes(candidateId),
    );

  const toggleEmailCandidate = (candidateId, checked) => {
    setSelectedEmailCandidates((current) => {
      if (checked) {
        return current.includes(candidateId)
          ? current
          : [...current, candidateId];
      }
      return current.filter((id) => id !== candidateId);
    });
  };

  const toggleAllEmailCandidates = (checked) => {
    setSelectedEmailCandidates(checked ? candidateIds : []);
  };

  const handleBulkEmail = async () => {
    await onBulkEmail?.(selectedEmailCandidates);
    setSelectedEmailCandidates([]);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h3 className="text-lg font-bold text-slate-800">
          Enrolled Candidates
        </h3>
        <div className="flex items-center gap-2">
          {showBulkEmail && (
            <Button
              variant="outline"
              onClick={handleBulkEmail}
              disabled={
                bulkEmailLoading || selectedEmailCandidates.length === 0
              }
              className="gap-2"
            >
              <Mail size={16} />
              {bulkEmailLoading
                ? "Sending..."
                : `Send Online Mail (${selectedEmailCandidates.length})`}
            </Button>
          )}
          {!isTrainerRole && (
            <Button
              onClick={onAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              Add Candidates
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {isTrainerRole ? (
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-sm font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Sr. No.</th>
                {trainerColumns.map((column) => (
                  <th key={column.label} className="px-4 py-3">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidates.length === 0 ? (
                <tr>
                  <td
                    colSpan={trainerColumns.length + 1}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No candidates enrolled yet.
                  </td>
                </tr>
              ) : (
                candidates.map((candidate, idx) => (
                  <tr
                    key={candidate.id || candidate.candidate_id || idx}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-sm text-slate-600 font-medium">
                      {idx + 1}
                    </td>
                    {trainerColumns.map((column) => (
                      <td
                        key={column.label}
                        className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap"
                      >
                        {column.render(candidate)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-sm font-semibold text-slate-600">
              <tr>
                {showBulkEmail && (
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allEmailCandidatesSelected}
                      onChange={(event) =>
                        toggleAllEmailCandidates(event.target.checked)
                      }
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      aria-label="Select all candidates for online mail"
                    />
                  </th>
                )}
                <th className="px-4 py-3">Sr. No.</th>
                <th className="px-4 py-3">Candidate Name</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Certificate Date</th>
                <th className="px-4 py-3">Nationality</th>
                <th className="px-4 py-3">CDC/Passport</th>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Seaman No</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Manning co / Manager</th>
                <th className="px-4 py-3">Status Pool</th>
                <th className="px-4 py-3 text-center">Observer</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidates.length === 0 ? (
                <tr>
                  <td
                    colSpan={showBulkEmail ? 14 : 13}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No candidates enrolled yet.
                  </td>
                </tr>
              ) : (
                candidates.map((candidate, idx) => (
                  <tr key={candidate.id} className="hover:bg-slate-50">
                    {showBulkEmail && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedEmailCandidates.includes(
                            candidate.candidate_id,
                          )}
                          onChange={(event) =>
                            toggleEmailCandidate(
                              candidate.candidate_id,
                              event.target.checked,
                            )
                          }
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          aria-label={`Select ${candidate.candidate_name} for online mail`}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-slate-600 font-medium">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        {candidate.candidate_name}
                        {candidate.is_observer ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                            <Eye size={12} /> Observer
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(candidate.dob)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(candidate.previous_certificate_date)}
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
                          onStatusPoolChange(
                            candidate.candidate_id,
                            e.target.value,
                          )
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
                    <td className="px-4 py-3 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!candidate.is_observer}
                          onChange={(e) =>
                            onObserverToggle(
                              candidate.candidate_id,
                              e.target.checked,
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEmail(candidate.candidate_id)}
                          title={
                            isOnlineCourse
                              ? "Send Online Welcome Letter"
                              : "Send Offline Welcome Letter"
                          }
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

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={courseEnded}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 h-8 w-8 p-0"
                          onClick={() => onDelete(candidate.candidate_id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CandidatesTab;
