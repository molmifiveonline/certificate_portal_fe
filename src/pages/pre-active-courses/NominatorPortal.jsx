import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast, Toaster } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  Send,
  Edit2,
  X,
  Users,
  Calendar,
  Fingerprint,
  Mail,
  Phone,
} from "lucide-react";
import preActiveCourseService from "../../services/preActiveCourseService";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { isValidEmail, sanitizeNumericValue } from "../../lib/utils/validation";

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

  // Manual Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [modalData, setModalData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile_no: "",
    date_of_birth: "",
    indos_number: "",
    registration_type: "Others",
  });

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

  const openModal = (index = null) => {
    if (index !== null) {
      setEditingIndex(index);
      setModalData({ ...candidates[index] });
    } else {
      setEditingIndex(null);
      setModalData({
        first_name: "",
        last_name: "",
        email: "",
        mobile_no: "",
        date_of_birth: "",
        indos_number: "",
        registration_type: "Others",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleModalChange = (field, value) => {
    setModalData((prev) => ({
      ...prev,
      [field]: field === "mobile_no" ? sanitizeNumericValue(value) : value,
    }));
  };

  const handleSaveCandidate = (e) => {
    e.preventDefault();

    if (!modalData.first_name || !modalData.email) {
      toast.error("First Name and Email are required.");
      return;
    }
    if (!isValidEmail(modalData.email)) {
      toast.error("Invalid email format.");
      return;
    }

    const newCandidates = [...candidates];
    if (editingIndex !== null) {
      newCandidates[editingIndex] = {
        ...modalData,
        registration_type: modalData.registration_type || "Others",
      };
      toast.success("Candidate updated in list.");
    } else {
      // Check for duplicate email in current list
      if (
        candidates.some(
          (c) => c.email.toLowerCase() === modalData.email.toLowerCase(),
        )
      ) {
        toast.error("This email is already in your nomination list.");
        return;
      }
      newCandidates.push({
        ...modalData,
        registration_type: modalData.registration_type || "Others",
      });
      toast.success("Candidate added to list.");
    }

    setCandidates(newCandidates);
    closeModal();
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

      <div className="mx-auto max-w-5xl">
        {/* Header Card */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden mb-8 border border-slate-200">
          <div className="bg-[#3a5f9e] px-8 py-5">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Course Nomination Portal
            </h1>
          </div>
          <div className="p-8">
            <div className="flex items-center gap-5 mb-8">
              <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#3a5f9e] font-bold text-xl border border-blue-100">
                {courseContext?.entity?.first_name?.charAt(0) || "N"}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
                  Nominator
                </p>
                <p className="font-bold text-slate-800 text-2xl">
                  {courseContext?.entity?.first_name}{" "}
                  {courseContext?.entity?.last_name || ""}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Course Context
              </h3>
              <div className="bg-slate-50/50 rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-8 border border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    Course Name
                  </p>
                  <p className="font-semibold text-slate-700">
                    {courseContext?.course?.course_name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    Duration
                  </p>
                  <p className="font-semibold text-slate-700">
                    {new Date(
                      courseContext?.course?.start_date,
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(
                      courseContext?.course?.end_date,
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
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
          </div>
        </div>

        {/* Nomination Table Card */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
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
                  onClick={() => openModal()}
                  className="bg-[#3a5f9e] hover:bg-blue-700 text-white font-bold h-11 px-6 shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="mr-2 h-5 w-5" /> Add New
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto -mx-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-y border-slate-100">
                    <th className="px-8 py-4 w-16 text-center">#</th>
                    <th className="px-4 py-4">Nominee Name</th>
                    <th className="px-4 py-4">Contact Details</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {candidates.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                            <Plus className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="text-slate-500 font-semibold">
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
                        <td className="px-8 py-5 text-center font-bold text-slate-400 text-sm">
                          {index + 1}
                        </td>
                        <td className="px-4 py-5">
                          <div>
                            <p className="font-bold text-slate-800">
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
                                    DOB: {candidate.date_of_birth}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-5">
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
                        <td className="px-4 py-5 font-medium">
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
                        <td className="px-8 py-5 text-right">
                          {!candidate.isPersisted && (
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openModal(index)}
                                className="p-2 text-[#3a5f9e] hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleRemoveCandidate(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove"
                              >
                                <Trash2 size={16} />
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
              <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-100">
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
                  className="w-full sm:w-auto bg-[#3a5f9e] hover:bg-blue-800 text-white min-w-[240px] h-12 text-lg font-bold shadow-lg shadow-blue-900/10"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" /> Submit Nominations
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm font-medium tracking-wide">
            &copy; {new Date().getFullYear()} MOLMI &bull; Certificate
            Management Portal
          </p>
        </div>
      </div>

      {/* Candidate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Users size={18} className="text-[#3a5f9e]" />
                {editingIndex !== null ? "Edit Nominee" : "Add New Nominee"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCandidate} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="John"
                    value={modalData.first_name}
                    onChange={(e) =>
                      handleModalChange("first_name", e.target.value)
                    }
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Last Name
                  </label>
                  <Input
                    placeholder="Doe"
                    value={modalData.last_name}
                    onChange={(e) =>
                      handleModalChange("last_name", e.target.value)
                    }
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="nominee@example.com"
                      value={modalData.email}
                      onChange={(e) =>
                        handleModalChange("email", e.target.value)
                      }
                      required
                      className="h-11 rounded-xl pl-10"
                    />
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-3 text-slate-300"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Mobile number
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Enter digits only"
                      value={modalData.mobile_no}
                      onChange={(e) =>
                        handleModalChange("mobile_no", e.target.value)
                      }
                      className="h-11 rounded-xl pl-10"
                    />
                    <Phone
                      size={16}
                      className="absolute left-3.5 top-3 text-slate-300"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                    <Calendar size={10} /> Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={modalData.date_of_birth}
                    onChange={(e) =>
                      handleModalChange("date_of_birth", e.target.value)
                    }
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                    <Fingerprint size={10} /> INDos Number
                  </label>
                  <Input
                    placeholder="Enter INDoS"
                    value={modalData.indos_number}
                    onChange={(e) =>
                      handleModalChange("indos_number", e.target.value)
                    }
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1 h-12 rounded-xl text-slate-400 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-[#3a5f9e] hover:bg-blue-700 text-white font-bold"
                >
                  {editingIndex !== null ? "Update Item" : "Add to List"}
                </Button>
              </div>
            </form>
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
