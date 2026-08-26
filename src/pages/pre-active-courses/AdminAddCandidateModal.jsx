import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Users, X, Mail, Search } from "lucide-react";
import preActiveCourseService from "../../services/preActiveCourseService";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import CandidateForm from "../../components/candidates/CandidateForm";
import api from "../../lib/api";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import { formatDate } from "../../lib/utils/dateUtils";

const AdminAddCandidateModal = ({ isOpen, onClose, courseId, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("pool"); // 'pool' or 'new'
  const [poolCandidates, setPoolCandidates] = useState([]);
  const [poolLoading, setPoolLoading] = useState(false);
  const [poolSearch, setPoolSearch] = useState("");
  const [selectedPoolIds, setSelectedPoolIds] = useState([]);
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === "pool") {
      fetchPool();
    }
  }, [isOpen, activeTab]);

  const fetchPool = async () => {
    try {
      setPoolLoading(true);
      const data = await preActiveCourseService.getAvailableOthersCandidatesByAdmin(courseId);
      setPoolCandidates(data || []);
    } catch (err) {
      console.error("Failed to fetch pool:", err);
      toast.error("Failed to load candidate pool.");
    } finally {
      setPoolLoading(false);
    }
  };

  const handleAddFromPool = async () => {
    const selectedFromPool = poolCandidates.filter((c) =>
      selectedPoolIds.includes(c.id)
    );

    if (selectedFromPool.length === 0) {
      toast.error("Please select at least one candidate.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = selectedFromPool.map((c) => ({
        candidate_id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        mobile_no: c.mobile || "",
        date_of_birth: c.dob ? new Date(c.dob).toISOString().split("T")[0] : "",
        indos_number: c.indos_number || "",
        registration_type: c.registration_type || "Others",
      }));

      await preActiveCourseService.adminAddCandidate(courseId, {
        candidates: payload,
      });

      toast.success(`Successfully enrolled ${selectedFromPool.length} candidate(s).`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to enroll candidates."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNewCandidate = async (data) => {
    setIsAddingCandidate(true);
    try {
      // Build payload — same as admin register, but always inactive (status: 0)
      const payload = {
        first_name: data.firstName,
        last_name: data.lastName,
        middle_name: data.middleName,
        email: data.email,
        mobile: data.whatsapp,
        prefix: data.prefix,
        gender: data.gender,
        dob: data.dob,
        nationality: data.nationality,
        passport_no: data.passportNumber,
        employee_id: data.employeeId,
        manager: data.manager,
        other_manager: null,
        rank: data.rank,
        other_rank: null,
        whatsapp_number: data.whatsapp,
        alternate_mobile: data.alternateNumber,
        indos_number: data.indosNo,
        registration_type: data.employeeType || "Others",
        designation: data.designation,
        vessel_type: data.vesselType,
        last_vessel_name: data.lastVesselName,
        next_vessel_name: data.nextVesselName,
        manning_company: data.manningCompany,
        sign_on_date: data.signOnDate || null,
        sign_off_date: data.signOffDate || null,
        officer: data.officer,
        seaman_book_no: data.seamanBookNo,
        profile_image: data.profileImage,
        status: 0, // Always inactive — admin must approve/activate
      };

      // 1. Register the candidate
      await api.post("/auth/register/candidate", payload);

      // 2. Enroll the candidate
      const enrollPayload = [
        {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          mobile_no: data.whatsapp || "",
          date_of_birth: data.dob || "",
          indos_number: data.indosNo || "",
          registration_type: data.employeeType || "Others",
        },
      ];

      await preActiveCourseService.adminAddCandidate(courseId, {
        candidates: enrollPayload,
      });

      toast.success(`${data.firstName} ${data.lastName} registered and enrolled successfully.`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to register and enroll candidate."));
    } finally {
      setIsAddingCandidate(false);
    }
  };

  if (!isOpen) return null;

  const filterPoolCandidate = (c) => {
    const search = poolSearch.toLowerCase().trim();
    if (!search) return true;
    const fullName = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
    const email = (c.email || "").toLowerCase();
    const indos = (c.indos_number || "").toLowerCase();
    const rank = (c.rank || "").toLowerCase();
    const passport = (c.cdc_passport || c.passport_no || "").toLowerCase();
    const designation = (c.designation || "").toLowerCase();
    const manager = (c.manager || c.manning_company || "").toLowerCase();
    const seamanNo = (c.seaman_book_no || "").toLowerCase();
    const empId = (c.empId || c.employee_id || "").toLowerCase();
    const candidateId = (c.id ? String(c.id) : "").toLowerCase();

    return (
      fullName.includes(search) ||
      email.includes(search) ||
      indos.includes(search) ||
      rank.includes(search) ||
      passport.includes(search) ||
      designation.includes(search) ||
      manager.includes(search) ||
      seamanNo.includes(search) ||
      empId.includes(search) ||
      candidateId.includes(search)
    );
  };

  const filteredPool = poolCandidates.filter(filterPoolCandidate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="bg-slate-50 px-4 sm:px-6 py-4 flex justify-between items-center border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Add Candidate to Pre-Active Course
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select existing candidate or register a new one.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 shrink-0">
          <button
            onClick={() => {
              setActiveTab("pool");
              setSelectedPoolIds([]);
            }}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "pool"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            Select from Pool
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "new"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            Create New Candidate
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white min-h-0">
          {activeTab === "pool" ? (
            <div className="space-y-4">
              {/* Top Search & Actions Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="relative flex-1 min-w-[240px]">
                  <Input
                    placeholder="Search by name, candidate ID, email, INDoS, rank, designation, passport..."
                    value={poolSearch}
                    onChange={(e) => setPoolSearch(e.target.value)}
                    className="pl-10 bg-white"
                  />
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                </div>

                <div className="flex items-center gap-2.5 justify-between md:justify-end shrink-0">
                  <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-2 rounded-lg border border-slate-200 shadow-sm whitespace-nowrap">
                    {selectedPoolIds.length} selected
                  </span>
                  <Button variant="secondary" onClick={onClose} size="sm">
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleAddFromPool}
                    disabled={selectedPoolIds.length === 0 || submitting}
                    size="sm"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1.5" />
                        Add Selected Candidates ({selectedPoolIds.length})
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-auto max-h-[60vh]">
                <table className="w-full min-w-[1300px] text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider sticky top-0 border-b border-slate-200 shadow-sm">
                    <tr>
                      <th className="w-10 px-2 py-2.5 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={
                            filteredPool.length > 0 &&
                            selectedPoolIds.length === filteredPool.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPoolIds(filteredPool.map((c) => c.id));
                            } else {
                              setSelectedPoolIds([]);
                            }
                          }}
                        />
                      </th>
                      <th className="px-3 py-2.5 whitespace-nowrap min-w-[140px]">Nominee Name</th>
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
                    {poolLoading ? (
                      <tr>
                        <td colSpan="16" className="px-4 py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <span>Loading pool...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredPool.length === 0 ? (
                      <tr>
                        <td colSpan="16" className="px-4 py-12 text-center text-slate-400">
                          No candidates found in pool.
                        </td>
                      </tr>
                    ) : (
                      filteredPool.map((c) => (
                        <tr
                          key={c.id}
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                          onClick={() => {
                            if (selectedPoolIds.includes(c.id)) {
                              setSelectedPoolIds(selectedPoolIds.filter((id) => id !== c.id));
                            } else {
                              setSelectedPoolIds([...selectedPoolIds, c.id]);
                            }
                          }}
                        >
                          <td className="w-10 px-2 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedPoolIds.includes(c.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPoolIds([...selectedPoolIds, c.id]);
                                } else {
                                  setSelectedPoolIds(selectedPoolIds.filter((id) => id !== c.id));
                                }
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-3 py-2 font-semibold text-slate-800 text-xs whitespace-nowrap">
                            {c.first_name} {c.last_name || ""}
                          </td>
                          <td className="px-2 py-2 text-xs text-slate-600 font-mono whitespace-nowrap">
                            {c.empId || c.employee_id || "-"}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                            <div>{c.email}</div>
                            {c.mobile && (
                              <div className="text-[11px] text-slate-400">{c.mobile}</div>
                            )}
                          </td>
                          <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                            {formatDate(c.dob)}
                          </td>
                          <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                            {formatDate(c.previous_certificate_date)}
                          </td>
                          <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                            {c.nationality || "-"}
                          </td>
                          <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                            {c.cdc_passport || c.passport_no || "-"}
                          </td>
                          <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                            {c.rank || "-"}
                          </td>
                          <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                            {c.seaman_book_no || "-"}
                          </td>
                          <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                            {c.designation || "-"}
                          </td>
                          <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                            {c.manager || c.manning_company || "-"}
                          </td>
                          <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                            {c.status_pool || c.vessel_type || "-"}
                          </td>
                          <td className="px-2 py-2 text-xs text-slate-600 whitespace-nowrap">
                            {c.last_vessel || c.last_vessel_name || "-"}
                          </td>
                          <td className="px-2 py-2 text-xs text-slate-500 font-mono whitespace-nowrap">
                            {c.indos_number || "-"}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                              {c.registration_type || "Others"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <CandidateForm
                onSubmit={handleAddNewCandidate}
                isSubmitting={isAddingCandidate}
                submitLabel="Register & Enroll Candidate"
                showPassword={false}
                isAdmin={false}
                defaultValues={{ employeeType: "Others" }}
                onCancel={onClose}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAddCandidateModal;
