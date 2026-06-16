import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast, Toaster } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  Send,
  X,
  Users,
  Mail,
  Phone,
} from "lucide-react";
import preActiveCourseService from "../../services/preActiveCourseService";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import CandidateForm from "../../components/candidates/CandidateForm";
import api from "../../lib/api";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import { formatDate } from "../../lib/utils/dateUtils";

const NominatorPortal = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [courseContext, setCourseContext] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Pool Selection State
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [poolCandidates, setPoolCandidates] = useState([]);
  const [poolLoading, setPoolLoading] = useState(false);
  const [poolSearch, setPoolSearch] = useState("");
  const [selectedPoolIds, setSelectedPoolIds] = useState([]);

  // Add Candidate Full Form State
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        setLoading(true);
        const data = await preActiveCourseService.getCourseByToken(token);
        setCourseContext(data);

        let combinedCandidates = [];

        // 1. Get already submitted nominations from API
        if (data.nominations && data.nominations.length > 0) {
          combinedCandidates = data.nominations.map((n) => ({
            ...n,
            isPersisted: true,
          }));
        }

        // 2. Try to load unsaved nominations from localStorage
        const saved = localStorage.getItem(`nominations_${token}`);
        if (saved) {
          try {
            const unsaved = JSON.parse(saved);
            // Filter out any duplicates that might have been submitted in another session
            const submittedEmails = new Set(
              combinedCandidates.map((c) => c.email.toLowerCase()),
            );
            const toAdd = unsaved.filter(
              (c) => !submittedEmails.has(c.email.toLowerCase()),
            );
            combinedCandidates = [...combinedCandidates, ...toAdd];
          } catch (e) {
            console.error("Failed to parse saved nominations", e);
          }
        }

        setCandidates(combinedCandidates);
      } catch (err) {
        setError(err.response?.data?.message || "Invalid or expired token.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchContext();
  }, [token]);

  // Save unsaved candidates to localStorage whenever they change
  useEffect(() => {
    if (!loading && token) {
      const unsaved = candidates.filter((c) => !c.isPersisted);
      if (unsaved.length > 0) {
        localStorage.setItem(`nominations_${token}`, JSON.stringify(unsaved));
      } else {
        localStorage.removeItem(`nominations_${token}`);
      }
    }
  }, [candidates, token, loading]);

  const fetchPool = async () => {
    try {
      setPoolLoading(true);
      const data =
        await preActiveCourseService.getAvailableOthersCandidates(token);
      setPoolCandidates(data);
    } catch (err) {
      console.error("Failed to fetch pool:", err);
      toast.error("Failed to load candidate pool.");
    } finally {
      setPoolLoading(false);
    }
  };

  const openPoolModal = () => {
    fetchPool();
    setSelectedPoolIds([]);
    setIsPoolModalOpen(true);
  };

  const closePoolModal = () => {
    setIsPoolModalOpen(false);
    setPoolSearch("");
  };

  const handleAddFromPool = () => {
    const selectedFromPool = poolCandidates.filter((c) =>
      selectedPoolIds.includes(c.id),
    );

    // Map to internal format and avoid duplicates
    const existingEmails = new Set(
      candidates.map((c) => c.email.toLowerCase()),
    );
    const toAdd = selectedFromPool
      .filter((c) => !existingEmails.has(c.email.toLowerCase()))
      .map((c) => ({
        candidate_id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        mobile_no: c.mobile || "",
        date_of_birth: c.dob ? new Date(c.dob).toISOString().split("T")[0] : "",
        indos_number: c.indos_number || "",
        registration_type: c.registration_type || "Others",
      }));

    if (toAdd.length === 0 && selectedPoolIds.length > 0) {
      toast.info("Selected candidates are already in your list.");
    } else if (toAdd.length > 0) {
      setCandidates((prev) => [...prev, ...toAdd]);
      toast.success(`Added ${toAdd.length} candidates from pool.`);
    }

    closePoolModal();
  };

  const handleAddNewCandidate = async (data) => {
    setIsAddingCandidate(true);
    try {
      // Check for duplicate email in current list
      if (
        candidates.some(
          (c) => c.email.toLowerCase() === data.email.toLowerCase(),
        )
      ) {
        toast.error("This email is already in your nomination list.");
        return;
      }

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

      // Register the candidate via the public register endpoint
      await api.post("/auth/register/candidate", payload);

      // Add them to the local nominations list (for enrollment)
      setCandidates((prev) => [
        ...prev,
        {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          mobile_no: data.whatsapp || "",
          date_of_birth: data.dob || "",
          indos_number: data.indosNo || "",
          registration_type: data.employeeType || "Others",
        },
      ]);

      toast.success(
        `${data.firstName} ${data.lastName} registered and added to your nomination list. Admin will activate their account.`,
      );
      setIsAddFormOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to register candidate."));
    } finally {
      setIsAddingCandidate(false);
    }
  };



  const handleRemoveCandidate = (index) => {
    const newCandidates = [...candidates];
    newCandidates.splice(index, 1);
    setCandidates(newCandidates);
    toast.info("Candidate removed from list.");
  };

  const handleSubmit = async () => {
    if (candidates.length === 0) {
      toast.error("Please add at least one candidate.");
      return;
    }

    try {
      setSubmitting(true);
      // Only send candidates that haven't been persisted yet
      const newCandidates = candidates.filter((c) => !c.isPersisted);

      if (newCandidates.length === 0) {
        toast.info("No new candidates to nominate.");
        setSubmitting(false);
        return;
      }

      const payload = newCandidates.map((c) => ({
        candidate_id: c.candidate_id || null,
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        mobile_no: c.mobile_no,
        date_of_birth: c.date_of_birth,
        indos_number: c.indos_number,
        registration_type: c.registration_type || "Others",
      }));
      await preActiveCourseService.nominatorAddCandidate(token, {
        candidates: payload,
      });

      // Success! Clear local storage for this token
      localStorage.removeItem(`nominations_${token}`);

      setSuccess(true);
      toast.success(
        "Candidates nominated successfully. Approval emails are being sent.",
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to nominate candidates.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#3a5f9e]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center border border-green-100">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nominations Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you, {courseContext?.entity?.first_name || "Nominator"}. Your
            candidates have been nominated for{" "}
            <strong>{courseContext?.course?.course_name}</strong>.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Approval emails will be sent automatically to the submitted
            candidates.
          </p>
          <p className="text-sm text-gray-500">
            You may now close this window.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-5xl bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
        {/* Header Card */}
        <div className="bg-[#3a5f9e] px-8 py-5">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Course Nomination Portal
          </h1>
        </div>

        <div className="p-8 space-y-8">
          {/* Course Context Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Course Context
            </h3>
            <div className="bg-slate-50/50 rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-8 border border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  Course Name
                </p>
                <p className="font-semibold text-slate-700 mb-1">
                  {courseContext?.course?.course_name}
                </p>
                {courseContext?.course?.course_type && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {courseContext.course.course_type}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  Duration
                </p>
                <p className="font-semibold text-slate-700">
                  {formatDate(courseContext?.course?.start_date)} -{" "}
                  {formatDate(courseContext?.course?.end_date)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  Location / Venue
                </p>
                <p className="font-semibold text-slate-700">
                  {courseContext?.course?.type_of_location === "Online" ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                      Online
                    </span>
                  ) : (
                    courseContext?.course?.other_location ||
                    courseContext?.course?.location_name ||
                    "TBA"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Nomination Section */}
          <div className="pt-8 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Nominate Candidates
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Select from pool or add manually
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={openPoolModal}
                  className="border-slate-200 text-slate-600 font-bold h-11 px-6 shadow-sm hover:bg-slate-50 transition-all"
                >
                  <Users className="mr-2 h-5 w-5 text-[#3a5f9e]" /> Select from
                  Pool
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsAddFormOpen(true)}
                  className="bg-[#3a5f9e] hover:bg-blue-700 text-white font-bold h-11 px-6 shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="mr-2 h-5 w-5" /> Add New
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200">
                    <th className="px-4 py-3 w-16 text-center border-r border-slate-200">#</th>
                    <th className="px-4 py-3 border-r border-slate-200">Nominee Name</th>
                    <th className="px-4 py-3 border-r border-slate-200">Contact Details</th>
                    <th className="px-4 py-3 border-r border-slate-200">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {candidates.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                            <Plus className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-slate-500 font-semibold text-sm">
                              No candidates added yet
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Click the button above to start adding nominees
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    candidates.map((candidate, index) => (
                      <tr
                        key={index}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-4 py-3 text-center font-bold text-slate-400 text-sm border-r border-slate-200">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 border-r border-slate-200">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">
                              {candidate.first_name} {candidate.last_name}
                            </p>
                            {(candidate.indos_number ||
                              candidate.date_of_birth) && (
                              <div className="flex gap-2 mt-1">
                                {candidate.indos_number && (
                                  <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                                    INDoS: {candidate.indos_number}
                                  </span>
                                )}
                                {candidate.date_of_birth && (
                                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                                    DOB: {formatDate(candidate.date_of_birth)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-r border-slate-200">
                          <div className="space-y-1">
                            <p className="text-xs text-slate-600 flex items-center gap-1.5">
                              <Mail size={12} className="text-slate-400" />{" "}
                              {candidate.email}
                            </p>
                            {candidate.mobile_no && (
                              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                                <Phone size={12} className="text-slate-400" />{" "}
                                {candidate.mobile_no}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium border-r border-slate-200">
                          {candidate.isPersisted ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-bold uppercase tracking-widest">
                              Nominated ({candidate.status})
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-widest">
                              Pending Submission
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!candidate.isPersisted && (
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleRemoveCandidate(index)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Remove"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {candidates.some((c) => !c.isPersisted) && (
              <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-400 italic">
                  New candidates to nominate:{" "}
                  <strong>
                    {candidates.filter((c) => !c.isPersisted).length}
                  </strong>
                </p>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full sm:w-auto bg-[#3a5f9e] hover:bg-blue-800 text-white min-w-[240px] h-11 text-base font-bold shadow-md transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-5 animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-5" /> Submit Nominations
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-slate-400 text-xs font-medium tracking-wide">
          &copy; {new Date().getFullYear()} MOLMI &bull; Certificate
          Management Portal
        </p>
      </div>

      {/* Full Candidate Registration Form Overlay */}
      {isAddFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen py-8 px-4">
            <div className="max-w-5xl mx-auto">
              {/* Overlay Header */}
              <div className="bg-[#3a5f9e] rounded-t-2xl px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-white font-bold text-lg">Register New Candidate</h2>
                  <p className="text-blue-200 text-xs mt-0.5">
                    Candidate will be created as <strong>Inactive</strong> — Admin must activate their account.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddFormOpen(false)}
                  className="text-white/70 hover:text-white transition-colors p-1"
                >
                  <X size={22} />
                </button>
              </div>
              {/* Form */}
              <div className="bg-slate-50 rounded-b-2xl p-4">
                <CandidateForm
                  onSubmit={handleAddNewCandidate}
                  isSubmitting={isAddingCandidate}
                  submitLabel="Register & Add to Nomination"
                  showPassword={false}
                  isAdmin={false}
                  defaultValues={{ employeeType: "Others" }}
                  onCancel={() => setIsAddFormOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Selection Pool Modal */}
      {isPoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Users size={18} className="text-[#3a5f9e]" />
                Select Candidates from Pool
              </h3>
              <button
                onClick={closePoolModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 border-b border-slate-100 bg-white">
              <div className="relative">
                <Input
                  placeholder="Search by name, email or INDoS..."
                  value={poolSearch}
                  onChange={(e) => setPoolSearch(e.target.value)}
                  className="h-11 rounded-xl pl-10"
                />
                <Users
                  size={16}
                  className="absolute left-3.5 top-3.5 text-slate-300"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px]">
              {poolLoading ? (
                <div className="flex h-full items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-[#3a5f9e]" />
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest sticky top-0 z-10 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-4 w-16 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={
                            selectedPoolIds.length > 0 &&
                            selectedPoolIds.length ===
                              poolCandidates.filter((c) => {
                                const search = poolSearch.toLowerCase();
                                return (
                                  (c.first_name + " " + c.last_name)
                                    .toLowerCase()
                                    .includes(search) ||
                                  c.email.toLowerCase().includes(search) ||
                                  (c.indos_number &&
                                    c.indos_number
                                      .toLowerCase()
                                      .includes(search))
                                );
                              }).length
                          }
                          onChange={(e) => {
                            const currentFiltered = poolCandidates.filter(
                              (c) => {
                                const search = poolSearch.toLowerCase();
                                return (
                                  (c.first_name + " " + (c.last_name || ""))
                                    .toLowerCase()
                                    .includes(search) ||
                                  c.email.toLowerCase().includes(search) ||
                                  (c.indos_number &&
                                    c.indos_number
                                      .toLowerCase()
                                      .includes(search))
                                );
                              },
                            );
                            if (e.target.checked) {
                              setSelectedPoolIds(
                                currentFiltered.map((c) => c.id),
                              );
                            } else {
                              setSelectedPoolIds([]);
                            }
                          }}
                        />
                      </th>
                      <th className="px-4 py-4">Nominee Name</th>
                      <th className="px-4 py-4">Email / Contact</th>
                      <th className="px-4 py-4">INDoS Number</th>
                      <th className="px-4 py-4">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {poolCandidates.filter((c) => {
                      const search = poolSearch.toLowerCase();
                      return (
                        (c.first_name + " " + (c.last_name || ""))
                          .toLowerCase()
                          .includes(search) ||
                        c.email.toLowerCase().includes(search) ||
                        (c.indos_number &&
                          c.indos_number.toLowerCase().includes(search))
                      );
                    }).length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-8 py-20 text-center text-slate-400"
                        >
                          No candidates found in pool.
                        </td>
                      </tr>
                    ) : (
                      poolCandidates
                        .filter((c) => {
                          const search = poolSearch.toLowerCase();
                          return (
                            (c.first_name + " " + (c.last_name || ""))
                              .toLowerCase()
                              .includes(search) ||
                            c.email.toLowerCase().includes(search) ||
                            (c.indos_number &&
                              c.indos_number.toLowerCase().includes(search))
                          );
                        })
                        .map((c) => (
                          <tr
                            key={c.id}
                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => {
                              if (selectedPoolIds.includes(c.id)) {
                                setSelectedPoolIds(
                                  selectedPoolIds.filter((id) => id !== c.id),
                                );
                              } else {
                                setSelectedPoolIds([...selectedPoolIds, c.id]);
                              }
                            }}
                          >
                            <td
                              className="px-8 py-4 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={selectedPoolIds.includes(c.id)}
                                onChange={(e) => {
                                  if (e.target.checked)
                                    setSelectedPoolIds([
                                      ...selectedPoolIds,
                                      c.id,
                                    ]);
                                  else
                                    setSelectedPoolIds(
                                      selectedPoolIds.filter(
                                        (id) => id !== c.id,
                                      ),
                                    );
                                }}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-bold text-slate-800 text-sm">
                                {c.first_name} {c.last_name}
                              </p>
                            </td>
                            <td className="px-4 py-4 text-xs text-slate-600">
                              {c.email}
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-[10px] font-bold text-slate-400">
                                {c.indos_number || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold uppercase tracking-widest">
                                {c.registration_type || "Others"}
                              </span>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50">
              <p className="text-xs text-slate-500">
                {selectedPoolIds.length} candidate(s) selected
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closePoolModal}
                  className="h-11 rounded-xl text-slate-400 font-bold px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddFromPool}
                  disabled={selectedPoolIds.length === 0}
                  className="h-11 rounded-xl bg-[#3a5f9e] hover:bg-blue-700 text-white font-bold px-8"
                >
                  Add Selected
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NominatorPortal;
