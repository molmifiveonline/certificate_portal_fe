import React, { useState, useEffect } from "react";
import { X, User, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Database } from "lucide-react";
import candidateService from "../../services/candidateService";
import { toast } from "sonner";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import { formatDate } from "../../lib/utils/dateUtils";

import {
  CANDIDATE_USER_FIELDS as USER_FIELDS,
  CANDIDATE_PROFILE_FIELDS as PROFILE_FIELDS,
  CANDIDATE_FIELD_LABELS as FIELD_LABELS,
} from "../../lib/utils/constants";

const CandidateMergeModal = ({ isOpen, onClose, selectedCandidateIds, onMergeSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [masterId, setMasterId] = useState("");
  const [fieldSelections, setFieldSelections] = useState({});
  const [remarks, setRemarks] = useState("Duplicate profile merge");
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (isOpen && selectedCandidateIds.length >= 2) {
      fetchMergePreview();
    }
  }, [isOpen, selectedCandidateIds]);

  const fetchMergePreview = async () => {
    setLoading(true);
    try {
      const data = await candidateService.getMergePreview(selectedCandidateIds);
      setCandidates(data.candidates || []);
      
      // Default master is the first candidate
      const defaultMaster = data.candidates?.[0]?.id || "";
      setMasterId(defaultMaster);
      
      // Initialize field selections
      initializeFieldSelections(data.candidates || [], defaultMaster);
    } catch (error) {
      console.error("Error loading merge preview:", error);
      toast.error(getErrorMessage(error, "Failed to load candidates merge preview"));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const initializeFieldSelections = (candidatesList, currentMasterId) => {
    const masterObj = candidatesList.find((c) => c.id === currentMasterId) || {};
    const initialSelections = {};

    const allFields = [...USER_FIELDS, ...PROFILE_FIELDS];
    allFields.forEach((field) => {
      // Rule: Default to master's value if present, otherwise first non-empty duplicate value
      let winningValue = masterObj[field];
      let winningSource = currentMasterId;

      if (winningValue === undefined || winningValue === null || winningValue === "") {
        const candidateWithVal = candidatesList.find(
          (c) => c[field] !== undefined && c[field] !== null && c[field] !== ""
        );
        if (candidateWithVal) {
          winningValue = candidateWithVal[field];
          winningSource = candidateWithVal.id;
        }
      }

      initialSelections[field] = {
        value: winningValue ?? "",
        source_candidate_id: winningSource,
      };
    });

    setFieldSelections(initialSelections);
  };

  // Re-run defaults when master selection changes
  const handleMasterChange = (newMasterId) => {
    setMasterId(newMasterId);
    initializeFieldSelections(candidates, newMasterId);
  };

  const handleFieldSourceChange = (field, sourceCandidateId, value) => {
    setFieldSelections((prev) => ({
      ...prev,
      [field]: {
        value,
        source_candidate_id: sourceCandidateId,
      },
    }));
  };

  const handleMergeSubmit = async (e) => {
    e.preventDefault();
    if (!masterId) {
      toast.error("Please select a master candidate");
      return;
    }
    if (!isConfirmed) {
      toast.error("Please confirm that duplicate candidate profiles will be soft-deleted");
      return;
    }

    setSubmitting(true);
    try {
      const duplicateIds = candidates
        .map((c) => c.id)
        .filter((id) => id !== masterId);

      const payload = {
        master_candidate_id: masterId,
        duplicate_candidate_ids: duplicateIds,
        field_values: fieldSelections,
        remarks,
      };

      await candidateService.mergeCandidates(payload);
      toast.success("Candidates merged successfully");
      onMergeSuccess();
    } catch (error) {
      console.error("Error merging candidates:", error);
      toast.error(getErrorMessage(error, "Failed to merge candidates"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-md">
      <div className="relative w-full max-w-7xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/50 shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Duplicate Candidate Profile Merge</h2>
              <p className="text-xs text-slate-500">Resolve duplicate records and consolidate histories cleanly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold text-slate-600">Gathering profile variations and counts...</span>
          </div>
        ) : (
          <form onSubmit={handleMergeSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 flex flex-col justify-between">
            <div className="space-y-8">
              {/* Step 1: Choose Master Candidate */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold">1</span>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Select Primary Master Candidate</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {candidates.map((candidate) => {
                    const isMaster = candidate.id === masterId;
                    return (
                      <div
                        key={candidate.id}
                        onClick={() => handleMasterChange(candidate.id)}
                        className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                          isMaster
                            ? "border-indigo-600 bg-indigo-50/20 shadow-md shadow-indigo-500/5"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        {isMaster && (
                          <div className="absolute top-4 right-4 text-indigo-600 bg-indigo-50 p-1 rounded-full">
                            <CheckCircle2 className="w-4 h-4 fill-current text-white text-indigo-600" />
                          </div>
                        )}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                              {candidate.profile_image ? (
                                <img
                                  src={candidate.profile_image}
                                  alt="profile"
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">
                                {candidate.prefix ? `${candidate.prefix} ` : ""}
                                {candidate.first_name || ""} {candidate.last_name || ""}
                              </p>
                              <p className="text-xs text-slate-500">{candidate.email || "No Email"}</p>
                            </div>
                          </div>

                          <div className="border-t border-slate-100/80 pt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-slate-600">
                            <div>
                              <span className="text-slate-400 block">Rank:</span>
                              <span className="font-medium">{candidate.rank || "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Passport:</span>
                              <span className="font-medium">{candidate.passport_no || "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Manager:</span>
                              <span className="font-medium truncate block max-w-full">{candidate.manager || "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">INDOS No:</span>
                              <span className="font-medium">{candidate.indos_number || "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Related Record Counts */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500">
                          <span className="bg-slate-100 px-2 py-1 rounded">
                            Enrollments: {candidate.related_counts?.courses_enrollment || 0}
                          </span>
                          <span className="bg-slate-100 px-2 py-1 rounded">
                            Certificates: {candidate.related_counts?.certificates || 0}
                          </span>
                          <span className="bg-slate-100 px-2 py-1 rounded">
                            Assessments: {candidate.related_counts?.assessment_results || 0}
                          </span>
                          <span className="bg-slate-100 px-2 py-1 rounded">
                            Reimbursements: {candidate.related_counts?.reimbursements || 0}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Choose Source for Each Field */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold">2</span>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Field Consolidation Matrix</h3>
                </div>
                <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/20">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700">
                        <th className="px-4 py-3 font-bold uppercase tracking-wider w-1/4">Field name</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider w-1/4">Consolidated Value</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider w-1/2">Select Source profile value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/70 bg-white">
                      {[...USER_FIELDS, ...PROFILE_FIELDS].map((field) => {
                        const selection = fieldSelections[field] || {};
                        return (
                          <tr key={field} className="hover:bg-slate-50/30">
                            <td className="px-4 py-3 font-semibold text-slate-700">{FIELD_LABELS[field] || field}</td>
                            <td className="px-4 py-3">
                              {field === "dob" || field === "sign_on_date" || field === "sign_off_date" ? (
                                <span className="font-semibold text-indigo-600">
                                  {selection.value ? formatDate(selection.value) : "-"}
                                </span>
                              ) : field === "status" ? (
                                <span className={`px-2 py-0.5 rounded-full font-bold ${selection.value === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                  {selection.value === 1 ? "Active" : "Inactive"}
                                </span>
                              ) : field === "profile_image" && selection.value ? (
                                <img src={selection.value} className="w-6 h-6 rounded-full object-cover border border-slate-200" alt="img" />
                              ) : (
                                <span className="font-semibold text-slate-800">{selection.value ?? "-"}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col sm:flex-row gap-3">
                                {candidates.map((candidate) => {
                                  const cVal = candidate[field];
                                  const isSelected = selection.source_candidate_id === candidate.id;
                                  const isMaster = candidate.id === masterId;

                                  return (
                                    <label
                                      key={candidate.id}
                                      className={`inline-flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-lg border transition-all ${
                                        isSelected
                                          ? "border-indigo-600 bg-indigo-50/20 text-indigo-700"
                                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`source_${field}`}
                                        className="w-3.5 h-3.5 text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                        checked={isSelected}
                                        onChange={() => handleFieldSourceChange(field, candidate.id, cVal)}
                                      />
                                      <span className="truncate max-w-[150px] font-medium text-[11px]">
                                        {field === "dob" || field === "sign_on_date" || field === "sign_off_date"
                                          ? (cVal ? formatDate(cVal) : "empty")
                                          : field === "status"
                                          ? (cVal === 1 ? "Active" : "Inactive")
                                          : (cVal ?? "empty")}
                                      </span>
                                      {isMaster && (
                                        <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1 rounded font-bold">
                                          Master
                                        </span>
                                      )}
                                    </label>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Step 3: Remarks and Warnings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold">3</span>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Remarks & Confirmation</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Audit Log Merge Remarks
                    </label>
                    <textarea
                      rows={3}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      placeholder="Specify reasons for merging..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/50 flex flex-col justify-between">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Critical Merge Notice</h4>
                        <ul className="text-xs text-amber-700 list-disc pl-4 space-y-1">
                          <li>Related course records, certificates, and results will move to the Master.</li>
                          <li>Duplicate candidate profiles will be soft-deleted automatically.</li>
                          <li>This action is irreversible.</li>
                        </ul>
                      </div>
                    </div>

                    <label className="inline-flex items-center gap-2.5 cursor-pointer mt-4 select-none">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        checked={isConfirmed}
                        onChange={(e) => setIsConfirmed(e.target.checked)}
                      />
                      <span className="text-xs font-bold text-amber-800">
                        I confirm and authorize this candidate merge action
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !isConfirmed}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:brightness-110 font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-indigo-500/20 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Merging profiles...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Complete Profile Merge
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CandidateMergeModal;
