import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Calendar,
  FileText,
  Mail,
  MapPin,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Meta from "../../components/common/Meta";
import BackButton from "../../components/common/BackButton";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { formatDate } from "../../lib/utils/dateUtils";
import { isNumericOnly, isValidEmail, sanitizeNumericValue } from "../../lib/utils/validation";
import candidateService from "../../services/candidateService";
import locationService from "../../services/locationService";
import outhouseCourseService from "../../services/outhouseCourseService";
import preActiveCourseService from "../../services/preActiveCourseService";

const COURSE_STATUSES = ["Initiated", "Course Started", "Course Completed", "Certificate Generated"];
const LOCATION_TYPES = ["Online", "Offline", "Manual"];
const FEEDBACK_TYPES = ["Document", "Manual"];
const COURSE_LEVELS = ["Operational", "Management", "Support", "Advanced"];
const COURSE_TYPES = ["Out house", "External Certification", "Third Party", "Refresher"];
const STATUS_POOL_OPTIONS = ["Selected", "Confirmed", "Standby", "Waitlisted", "Completed"];

const emptyFormData = {
  creation_mode: "manual",
  source_pre_active_id: "",
  topic: "",
  master_course_id: "",
  master_course_name: "",
  course_name: "",
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  status: "Initiated",
  location_type: "Online",
  location_id: "",
  type_of_course: "Out house",
  course_level: "Operational",
  whatsapp_group: "",
  zoom_link: "",
  zoom_id: "",
  zoom_password: "",
  feedback_type: "Document",
  description: "",
  remarks: "",
};

const buildDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return [];
  const dates = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const makeCourseIdPreview = (topic, startDate) => {
  const topicPart = (topic || "TOPIC")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const year = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear();
  return `${topicPart || "TOPIC"}/${year}/AUTO`;
};

const normalizeMasterCourse = (course) => ({
  id: course?.id || "",
  topic: course?.topic || course?.name || "",
  master_course_name: course?.master_course_name || course?.course_name || "",
  description: course?.description || "",
  remarks: course?.remarks || "",
});

const normalizeCandidate = (candidate) => ({
  id: candidate?.id || candidate?.candidate_id || candidate?.user_id || "",
  empId: candidate?.empId || candidate?.employee_id || "-",
  candidate_name:
    candidate?.candidate_name ||
    [candidate?.first_name, candidate?.last_name].filter(Boolean).join(" ") ||
    "-",
  passport: candidate?.passport || candidate?.passport_no || candidate?.cdc_passport || "-",
  seaman_no: candidate?.seaman_no || candidate?.seaman_book_no || "-",
  rank: candidate?.rank || "-",
  manager: candidate?.manager || "-",
  status_pool: candidate?.status_pool || "",
  ack_status: candidate?.ack_status || "Pending",
  ack_date: candidate?.ack_date || null,
  candidate_email_status:
    candidate?.candidate_email_status || candidate?.welcome_letter_sent || candidate?.email_sent || 0,
  delete_allowed: candidate?.delete_allowed === undefined ? true : Boolean(candidate.delete_allowed),
  venue_name: candidate?.venue_name || "",
  venue_address: candidate?.venue_address || "",
  venue_contact: candidate?.venue_contact || "",
  venue_email: candidate?.venue_email || "",
  offline_date: candidate?.offline_date || "",
  remarks: candidate?.remarks || "",
});

const getInitialAttendanceRows = (candidates, dates, existingRows = []) => {
  const existingById = new Map(existingRows.map((row) => [row.candidate_id || row.id, row]));
  return candidates.map((candidate) => {
    const existing = existingById.get(candidate.id) || {};
    const days = {};
    dates.forEach((date) => {
      const record = existing?.days?.[date] || existing?.attendance?.[date] || {};
      days[date] = { status: record.status || "Present", remark: record.remark || record.reason || "" };
    });
    return {
      candidate_id: candidate.id,
      candidate_name: candidate.candidate_name,
      empId: candidate.empId,
      days,
    };
  });
};

const FieldLabel = ({ label, required }) => (
  <label className="mb-1 block text-sm font-medium text-slate-700">
    {label} {required ? <span className="text-red-500">*</span> : null}
  </label>
);

const InputField = ({ label, required, error, className = "", ...props }) => (
  <div className={className}>
    <FieldLabel label={label} required={required} />
    <Input
      {...props}
      className={`h-11 rounded-xl border ${error ? "border-red-400" : "border-slate-200"} bg-white shadow-sm focus-visible:ring-orange-500`}
    />
    {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
  </div>
);

const SelectField = ({ label, required, error, options, placeholder = "Select", className = "", ...props }) => (
  <div className={className}>
    <FieldLabel label={label} required={required} />
    <select
      {...props}
      className={`h-11 w-full rounded-xl border px-3 text-sm outline-none ${error ? "border-red-400" : "border-slate-200"} bg-white shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
  </div>
);

const TextareaField = ({ label, required, error, rows = 4, className = "", ...props }) => (
  <div className={className}>
    <FieldLabel label={label} required={required} />
    <textarea
      {...props}
      rows={rows}
      className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${error ? "border-red-400" : "border-slate-200"} bg-white shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20`}
    />
    {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
  </div>
);

const CandidateDeleteModal = ({ state, onClose, onConfirm }) => {
  const [remark, setRemark] = useState("");

  useEffect(() => {
    setRemark("");
  }, [state?.candidateId]);

  if (!state?.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-800">Delete Candidate</h3>
          <p className="mt-1 text-sm text-slate-500">The candidate will be soft deleted.</p>
        </div>
        <div className="px-6 py-5">
          <TextareaField
            label="Delete Remark"
            required
            value={remark}
            onChange={(event) => setRemark(event.target.value)}
            placeholder="Enter reason for deletion"
            rows={4}
          />
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={!remark.trim()} onClick={() => onConfirm(remark.trim())}>
            Delete Candidate
          </Button>
        </div>
      </div>
    </div>
  );
};

const VenueModal = ({ state, onClose, onSave }) => {
  const [formState, setFormState] = useState({
    hotel_name: "",
    hotel_address: "",
    hotel_contact: "",
    hotel_email: "",
    offline_date: "",
    remarks: "",
    files: null,
  });

  useEffect(() => {
    setFormState({
      hotel_name: state?.candidate?.venue_name || "",
      hotel_address: state?.candidate?.venue_address || "",
      hotel_contact: state?.candidate?.venue_contact || "",
      hotel_email: state?.candidate?.venue_email || "",
      offline_date: state?.candidate?.offline_date || "",
      remarks: state?.candidate?.remarks || "",
      files: null,
    });
  }, [state]);

  if (!state?.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-800">Offline / Manual Welcome Details</h3>
          <p className="mt-1 text-sm text-slate-500">Add hotel details and supporting documents.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
          <InputField label="Hotel Name" value={formState.hotel_name} onChange={(event) => setFormState((current) => ({ ...current, hotel_name: event.target.value }))} />
          <InputField label="Hotel Contact" value={formState.hotel_contact} onChange={(event) => setFormState((current) => ({ ...current, hotel_contact: sanitizeNumericValue(event.target.value) }))} />
          <InputField label="Hotel Email" type="text" value={formState.hotel_email} onChange={(event) => setFormState((current) => ({ ...current, hotel_email: event.target.value }))} />
          <InputField label="Offline Date" type="date" value={formState.offline_date} onChange={(event) => setFormState((current) => ({ ...current, offline_date: event.target.value }))} />
          <TextareaField label="Hotel Address" className="md:col-span-2" rows={3} value={formState.hotel_address} onChange={(event) => setFormState((current) => ({ ...current, hotel_address: event.target.value }))} />
          <TextareaField label="Remarks" className="md:col-span-2" rows={3} value={formState.remarks} onChange={(event) => setFormState((current) => ({ ...current, remarks: event.target.value }))} />
          <div className="md:col-span-2">
            <FieldLabel label="Documents" />
            <input type="file" multiple onChange={(event) => setFormState((current) => ({ ...current, files: event.target.files }))} className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onSave(formState)}>
            Save Details
          </Button>
        </div>
      </div>
    </div>
  );
};

const OuthouseCourseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(emptyFormData);
  const [errors, setErrors] = useState({});
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [masterCourses, setMasterCourses] = useState([]);
  const [preActiveCourses, setPreActiveCourses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [courseCandidates, setCourseCandidates] = useState([]);
  const [candidateOptions, setCandidateOptions] = useState([]);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [addingCandidate, setAddingCandidate] = useState(false);
  const [deleteState, setDeleteState] = useState({ open: false, candidateId: "" });
  const [venueState, setVenueState] = useState({ open: false, candidateId: "", candidate: null });
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ documents: [], listing: [] });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [certificateRows, setCertificateRows] = useState([]);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [debouncedCandidateSearch, setDebouncedCandidateSearch] = useState("");

  const courseDates = useMemo(() => buildDateRange(formData.start_date, formData.end_date), [formData.end_date, formData.start_date]);
  const daysCount = courseDates.length;
  const courseIdPreview = makeCourseIdPreview(formData.topic, formData.start_date);
  const deleteAllowed = useMemo(() => {
    if (!formData.end_date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDay = new Date(formData.end_date);
    lastDay.setHours(23, 59, 59, 999);
    return today <= lastDay;
  }, [formData.end_date]);

  const locationOptions = locations.map((location) => ({
    value: location.id,
    label: location.location_name || location.name,
  }));
  const masterCourseOptions = masterCourses.map((course) => ({
    value: course.id,
    label: `${course.topic} - ${course.master_course_name}`,
  }));
  const preActiveOptions = preActiveCourses.map((course) => ({
    value: course.id,
    label: `${course.course_id || "Pending"} - ${course.course_name}`,
  }));

  const hydrateForm = useCallback((course) => {
    setFormData((current) => ({
      ...current,
      creation_mode: course?.creation_mode || current.creation_mode,
      source_pre_active_id: course?.source_pre_active_id || course?.pre_active_course_id || "",
      topic: course?.topic || "",
      master_course_id: course?.master_course_id || "",
      master_course_name: course?.master_course_name || "",
      course_name: course?.course_name || "",
      start_date: course?.start_date ? String(course.start_date).slice(0, 10) : "",
      end_date: course?.end_date ? String(course.end_date).slice(0, 10) : "",
      start_time: course?.start_time ? String(course.start_time).slice(0, 5) : "",
      end_time: course?.end_time ? String(course.end_time).slice(0, 5) : "",
      status: course?.status || "Initiated",
      location_type: course?.location_type || course?.type_of_location || "Online",
      location_id: course?.location_id || "",
      type_of_course: course?.type_of_course || course?.course_type || "Out house",
      course_level: course?.course_level || "Operational",
      whatsapp_group: course?.whatsapp_group || course?.whatsapp_link || "",
      zoom_link: course?.zoom_link || "",
      zoom_id: course?.zoom_id || course?.zoom_username || "",
      zoom_password: course?.zoom_password || "",
      feedback_type: course?.feedback_type || "Document",
      description: course?.description || "",
      remarks: course?.remarks || "",
    }));
  }, []);

  const loadDependencies = useCallback(async () => {
    try {
      const [masterRes, locationRes, preActiveRes] = await Promise.all([
        outhouseCourseService.getMasterCourses({ limit: 200 }).catch(() => null),
        locationService.getLocations({ limit: 200 }).catch(() => null),
        outhouseCourseService.getPreActiveCourses({ limit: 200 }).catch(() => null),
      ]);

      setMasterCourses(
        Array.isArray(masterRes?.data || masterRes)
          ? (masterRes?.data || masterRes).map(normalizeMasterCourse)
          : [],
      );
      setLocations(locationRes?.data?.data || locationRes?.data || []);
      setPreActiveCourses(Array.isArray(preActiveRes?.data || preActiveRes) ? preActiveRes?.data || preActiveRes : []);
    } catch (error) {
      toast.error("Failed to load outhouse course dependencies");
    }
  }, []);

  const loadCandidates = useCallback(async () => {
    if (!id) return;
    setLoadingCandidates(true);
    try {
      const response = await outhouseCourseService.getCandidates(id);
      const candidates = response?.candidates || response?.data || [];
      setCourseCandidates(candidates.map((candidate) => normalizeCandidate(candidate)));
    } catch (error) {
      toast.error("Failed to load candidates");
    } finally {
      setLoadingCandidates(false);
    }
  }, [id]);

  const loadCandidateOptions = useCallback(async (searchText = "") => {
    if (!id) return;
    try {
      const response = await outhouseCourseService.getCandidateOptions(id, {
        search: searchText,
        limit: 100,
      });
      setCandidateOptions((response?.candidates || response?.data || []).map((candidate) => normalizeCandidate(candidate)));
    } catch (error) {
      const fallback = await candidateService.getAllCandidates({ search: searchText, limit: 100 });
      setCandidateOptions((fallback?.data || fallback?.rows || []).map((candidate) => normalizeCandidate(candidate)));
    }
  }, [id]);

  const loadCourseDetails = useCallback(async () => {
    if (!id) return;
    setInitialLoading(true);
    try {
      const response = await outhouseCourseService.getById(id);
      const course = response?.data || response;
      hydrateForm(course);
      setCourseCandidates((course?.candidates || []).map((candidate) => normalizeCandidate(candidate)));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load outhouse course");
      navigate("/outhouse-courses");
    } finally {
      setInitialLoading(false);
    }
  }, [hydrateForm, id, navigate]);

  const loadAttendance = useCallback(async () => {
    if (!id) {
      setAttendanceRows(getInitialAttendanceRows(courseCandidates, courseDates));
      return;
    }
    setAttendanceLoading(true);
    try {
      const response = await outhouseCourseService.getAttendance(id);
      const rows = response?.candidates || response?.data || [];
      const dates = response?.dates || courseDates;
      setAttendanceRows(getInitialAttendanceRows(courseCandidates, dates, rows));
    } catch (error) {
      setAttendanceRows(getInitialAttendanceRows(courseCandidates, courseDates));
      toast.error("Failed to load attendance");
    } finally {
      setAttendanceLoading(false);
    }
  }, [courseCandidates, courseDates, id]);

  const loadFeedback = useCallback(async () => {
    if (!id) return;
    setFeedbackLoading(true);
    try {
      const response = await outhouseCourseService.getFeedback(id);
      setFeedbackData({
        documents: response?.documents || [],
        listing: response?.listing || response?.data || [],
      });
    } catch (error) {
      setFeedbackData({ documents: [], listing: [] });
      toast.error("Failed to load feedback");
    } finally {
      setFeedbackLoading(false);
    }
  }, [id]);

  const loadCertificates = useCallback(async () => {
    if (!id) {
      setCertificateRows(
        courseCandidates.map((candidate) => ({
          ...candidate,
          certificate_no: "",
          issue_date: "",
          file: null,
        })),
      );
      return;
    }
    setCertificateLoading(true);
    try {
      const response = await outhouseCourseService.getCertificates(id);
      setCertificateRows(
        (response?.candidates || response?.data || []).map((row) => ({
          ...normalizeCandidate(row),
          certificate_no: row.certificate_no || "",
          issue_date: row.issue_date ? String(row.issue_date).slice(0, 10) : "",
          certificate_url: row.certificate_url || row.file_url || "",
          file: null,
        })),
      );
    } catch (error) {
      setCertificateRows(
        courseCandidates.map((candidate) => ({
          ...candidate,
          certificate_no: "",
          issue_date: "",
          file: null,
        })),
      );
      toast.error("Failed to load certificate data");
    } finally {
      setCertificateLoading(false);
    }
  }, [courseCandidates, id]);

  useEffect(() => {
    loadDependencies();
  }, [loadDependencies]);

  useEffect(() => {
    if (isEditMode) {
      loadCourseDetails();
    } else {
      setInitialLoading(false);
    }
  }, [isEditMode, loadCourseDetails]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedCandidateSearch(candidateSearch.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [candidateSearch]);

  useEffect(() => {
    if (!id || activeTab !== "candidates") return;
    loadCandidateOptions(debouncedCandidateSearch);
  }, [activeTab, debouncedCandidateSearch, id, loadCandidateOptions]);

  useEffect(() => {
    if (activeTab !== "candidates") return;
    loadCandidates();
  }, [activeTab, loadCandidates]);

  useEffect(() => {
    if (activeTab !== "attendance") return;
    loadAttendance();
  }, [activeTab, loadAttendance]);

  useEffect(() => {
    if (activeTab !== "feedback") return;
    loadFeedback();
  }, [activeTab, loadFeedback]);

  useEffect(() => {
    if (activeTab !== "certificates") return;
    loadCertificates();
  }, [activeTab, loadCertificates]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleMasterCourseSelection = (masterCourseId) => {
    const selectedCourse = masterCourses.find((course) => course.id === masterCourseId);
    setFormData((current) => ({
      ...current,
      master_course_id: masterCourseId,
      topic: selectedCourse?.topic || current.topic,
      master_course_name: selectedCourse?.master_course_name || current.master_course_name,
      description: selectedCourse?.description || current.description,
      remarks: selectedCourse?.remarks || current.remarks,
    }));
    setErrors((current) => ({ ...current, master_course_id: "", topic: "" }));
  };

  const handlePreActiveSelection = async (preActiveId) => {
    setFormData((current) => ({ ...current, source_pre_active_id: preActiveId }));
    setErrors((current) => ({ ...current, source_pre_active_id: "" }));
    if (!preActiveId) return;
    try {
      const course = await preActiveCourseService.getById(preActiveId);
      setFormData((current) => ({
        ...current,
        creation_mode: "conversion",
        source_pre_active_id: preActiveId,
        topic: course?.topic || current.topic,
        master_course_id: course?.master_course_id || current.master_course_id,
        master_course_name: course?.master_course_name || course?.course_name || current.master_course_name,
        course_name: course?.course_name || current.course_name,
        start_date: course?.start_date ? String(course.start_date).slice(0, 10) : current.start_date,
        end_date: course?.end_date ? String(course.end_date).slice(0, 10) : current.end_date,
        location_type: course?.type_of_location || current.location_type,
        location_id: course?.location_id || current.location_id,
        type_of_course: course?.course_type || current.type_of_course,
        description: course?.description || current.description,
        remarks: course?.remarks || current.remarks,
      }));
      toast.success("Pre-active course data copied");
    } catch (error) {
      toast.error("Failed to load pre-active course");
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    if (formData.creation_mode === "conversion" && !formData.source_pre_active_id) nextErrors.source_pre_active_id = "Pre-active course is required";
    if (!formData.topic.trim()) nextErrors.topic = "Topic is required";
    if (!formData.master_course_id) nextErrors.master_course_id = "Master course name is required";
    if (!formData.course_name.trim()) nextErrors.course_name = "Course name is required";
    if (!formData.start_date) nextErrors.start_date = "Start date is required";
    if (!formData.end_date) nextErrors.end_date = "End date is required";
    if (!formData.start_time) nextErrors.start_time = "Start time is required";
    if (!formData.end_time) nextErrors.end_time = "End time is required";
    if (!formData.status) nextErrors.status = "Status is required";
    if (!formData.location_type) nextErrors.location_type = "Location type is required";
    if (!formData.location_id) nextErrors.location_id = "Location of training is required";
    if (!formData.type_of_course) nextErrors.type_of_course = "Type of course is required";
    if (!formData.course_level) nextErrors.course_level = "Course level is required";
    if (!formData.feedback_type) nextErrors.feedback_type = "Feedback type is required";
    if (!formData.description.trim()) nextErrors.description = "Description is required";
    if (formData.start_date && formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      nextErrors.end_date = "End date must be on or after start date";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...formData, days: daysCount, course_id_preview: courseIdPreview };
      if (isEditMode) {
        await outhouseCourseService.update(id, payload);
        toast.success("Outhouse course updated");
      } else {
        const response = await outhouseCourseService.create(payload);
        toast.success("Outhouse course created");
        navigate(`/outhouse-courses/edit/${response?.id || response?.data?.id || ""}`);
        return;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save outhouse course");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCandidate = async () => {
    if (!id) return toast.error("Save the course before adding candidates");
    if (!selectedCandidateId) return toast.error("Select a candidate first");
    setAddingCandidate(true);
    try {
      await outhouseCourseService.addCandidates(id, { candidateIds: [selectedCandidateId] });
      toast.success("Candidate added");
      setSelectedCandidateId("");
      await Promise.all([loadCandidates(), loadCandidateOptions(debouncedCandidateSearch)]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add candidate");
    } finally {
      setAddingCandidate(false);
    }
  };

  const handleCandidateStatusUpdate = async (candidateId, statusPool) => {
    try {
      await outhouseCourseService.updateCandidate(id, candidateId, { status_pool: statusPool });
      setCourseCandidates((current) =>
        current.map((candidate) => (candidate.id === candidateId ? { ...candidate, status_pool: statusPool } : candidate)),
      );
      toast.success("Candidate status pool updated");
    } catch (error) {
      toast.error("Failed to update status pool");
    }
  };

  const handleCandidateDelete = async (remark) => {
    try {
      await outhouseCourseService.deleteCandidate(id, deleteState.candidateId, { remark });
      toast.success("Candidate deleted");
      setDeleteState({ open: false, candidateId: "" });
      await Promise.all([loadCandidates(), loadAttendance(), loadCertificates()]);
    } catch (error) {
      toast.error("Failed to delete candidate");
    }
  };

  const handleWelcomeLetter = async (candidateId) => {
    try {
      await outhouseCourseService.resendWelcomeLetter(id, candidateId);
      toast.success("Welcome letter sent");
      await loadCandidates();
    } catch (error) {
      toast.error("Failed to send welcome letter");
    }
  };

  const handleVenueSave = async (venueDetails) => {
    if (!isNumericOnly(venueDetails.hotel_contact)) {
      toast.error("Hotel contact must contain digits only");
      return;
    }

    if (!isValidEmail(venueDetails.hotel_email)) {
      toast.error("Enter a valid hotel email address");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("hotel_name", venueDetails.hotel_name || "");
      payload.append("hotel_address", venueDetails.hotel_address || "");
      payload.append("hotel_contact", venueDetails.hotel_contact || "");
      payload.append("hotel_email", venueDetails.hotel_email || "");
      payload.append("offline_date", venueDetails.offline_date || "");
      payload.append("remarks", venueDetails.remarks || "");
      Array.from(venueDetails.files || []).forEach((file) => payload.append("documents", file));
      await outhouseCourseService.updateVenueDetails(id, venueState.candidateId, payload);
      toast.success("Venue details saved");
      setVenueState({ open: false, candidateId: "", candidate: null });
      await loadCandidates();
    } catch (error) {
      toast.error("Failed to save venue details");
    }
  };

  const handleAttendanceChange = (candidateId, date, key, value) => {
    setAttendanceRows((current) =>
      current.map((row) =>
        row.candidate_id === candidateId
          ? { ...row, days: { ...row.days, [date]: { ...row.days[date], [key]: value } } }
          : row,
      ),
    );
  };

  const handleAttendanceSave = async () => {
    try {
      await outhouseCourseService.saveAttendance(id, { attendance: attendanceRows });
      toast.success("Attendance saved");
    } catch (error) {
      toast.error("Failed to save attendance");
    }
  };

  const handleFeedbackUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const payload = new FormData();
      payload.append("feedback_document", file);
      await outhouseCourseService.uploadFeedbackDocument(id, payload);
      toast.success("Feedback document uploaded");
      await loadFeedback();
    } catch (error) {
      toast.error("Failed to upload feedback document");
    }
  };

  const handleFeedbackResend = async (candidateId) => {
    try {
      await outhouseCourseService.resendFeedback(id, candidateId);
      toast.success("Feedback link resent");
    } catch (error) {
      toast.error("Failed to resend feedback");
    }
  };

  const updateCertificateRow = (candidateId, key, value) => {
    setCertificateRows((current) => current.map((row) => (row.id === candidateId ? { ...row, [key]: value } : row)));
  };

  const handleCertificateSave = async (row) => {
    try {
      const payload = new FormData();
      payload.append("certificate_no", row.certificate_no || "");
      payload.append("issue_date", row.issue_date || "");
      if (row.file) payload.append("certificate_file", row.file);
      await outhouseCourseService.saveCertificate(id, row.id, payload);
      toast.success("Certificate details saved");
      await loadCertificates();
    } catch (error) {
      toast.error("Failed to save certificate details");
    }
  };

  const filteredCandidateOptions = candidateOptions.filter(
    (candidate) => !courseCandidates.some((existing) => existing.id === candidate.id),
  );

  const manualFeedbackRows =
    feedbackData.listing.length > 0
      ? feedbackData.listing
      : courseCandidates.map((candidate, index) => ({
          sr_no: index + 1,
          active_course_name: formData.course_name,
          employee_id: candidate.empId,
          employee_name: candidate.candidate_name,
          average_rating: "-",
          candidate_id: candidate.id,
        }));

  if (initialLoading) {
    return (
      <div className="flex h-[420px] items-center justify-center">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-500 shadow-sm">
          Loading outhouse course...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <Meta title={isEditMode ? "Edit Outhouse Course" : "Create Outhouse Course"} description="Admin-only outhouse course workflow" />

      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {isEditMode ? "Edit Outhouse Course" : "Create Outhouse Course"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Admin-managed external training batches with candidate, attendance, feedback, and certificate workflows
            </p>
          </div>
          <BackButton to="/outhouse-courses" />
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 pt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <ShieldCheck className="h-5 w-5 text-orange-600" />
                Course Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <SelectField
                  label="Creation Mode"
                  required
                  name="creation_mode"
                  value={formData.creation_mode}
                  onChange={handleFormChange}
                  options={[
                    { value: "manual", label: "Manual Creation" },
                    { value: "conversion", label: "Conversion From Pre-Active" },
                  ]}
                />
                <InputField label="Course ID" value={formData.course_id || courseIdPreview} readOnly className="md:col-span-2" />
              </div>

              {formData.creation_mode === "conversion" ? (
                <SelectField
                  label="Pre-Active Course"
                  required
                  value={formData.source_pre_active_id}
                  onChange={(event) => handlePreActiveSelection(event.target.value)}
                  options={preActiveOptions}
                  error={errors.source_pre_active_id}
                  placeholder="Select pre-active course"
                />
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <InputField label="Topic" required name="topic" value={formData.topic} onChange={handleFormChange} error={errors.topic} />
                <SelectField label="Master Course Name" required value={formData.master_course_id} onChange={(event) => handleMasterCourseSelection(event.target.value)} options={masterCourseOptions} error={errors.master_course_id} placeholder="Select master course" />
                <InputField label="Course Name" required name="course_name" value={formData.course_name} onChange={handleFormChange} error={errors.course_name} />
                <SelectField label="Status" required name="status" value={formData.status} onChange={handleFormChange} options={COURSE_STATUSES.map((status) => ({ value: status, label: status }))} error={errors.status} />
                <InputField label="Start Date" required type="date" name="start_date" value={formData.start_date} onChange={handleFormChange} error={errors.start_date} max={formData.end_date} />
                <InputField label="End Date" required type="date" name="end_date" value={formData.end_date} onChange={handleFormChange} error={errors.end_date} min={formData.start_date} />
                <InputField label="Start Time" required type="time" name="start_time" value={formData.start_time} onChange={handleFormChange} error={errors.start_time} />
                <InputField label="End Time" required type="time" name="end_time" value={formData.end_time} onChange={handleFormChange} error={errors.end_time} />
                <InputField label="Days" value={daysCount} readOnly />
                <SelectField label="Location Type" required name="location_type" value={formData.location_type} onChange={handleFormChange} options={LOCATION_TYPES.map((value) => ({ value, label: value }))} error={errors.location_type} />
                <SelectField label="Location of Training" required name="location_id" value={formData.location_id} onChange={handleFormChange} options={locationOptions} error={errors.location_id} placeholder="Select location" />
                <SelectField label="Type of Course" required name="type_of_course" value={formData.type_of_course} onChange={handleFormChange} options={COURSE_TYPES.map((value) => ({ value, label: value }))} error={errors.type_of_course} />
                <SelectField label="Course Level" required name="course_level" value={formData.course_level} onChange={handleFormChange} options={COURSE_LEVELS.map((value) => ({ value, label: value }))} error={errors.course_level} />
                <SelectField label="Feedback Type" required name="feedback_type" value={formData.feedback_type} onChange={handleFormChange} options={FEEDBACK_TYPES.map((value) => ({ value, label: value }))} error={errors.feedback_type} />
                <InputField label="WhatsApp Group" name="whatsapp_group" value={formData.whatsapp_group} onChange={handleFormChange} />
                <InputField label="Zoom Link" name="zoom_link" value={formData.zoom_link} onChange={handleFormChange} />
                <InputField label="Zoom ID" name="zoom_id" value={formData.zoom_id} onChange={handleFormChange} />
                <InputField label="Zoom Password" name="zoom_password" value={formData.zoom_password} onChange={handleFormChange} />
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <TextareaField label="Description" required name="description" value={formData.description} onChange={handleFormChange} error={errors.description} rows={6} />
                <TextareaField label="Remarks" name="remarks" value={formData.remarks} onChange={handleFormChange} rows={6} />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50 px-5 py-4 text-sm text-orange-900">
            <div>
              <div className="font-semibold">Admin-only outhouse workflow</div>
              <div className="mt-1 text-orange-800/80">
                Create the course first. Candidate, attendance, feedback, and certificate tabs become available after save.
              </div>
            </div>
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : isEditMode ? "Update Outhouse Course" : "Create Outhouse Course"}
            </Button>
          </div>
        </form>

        <Tabs className="mt-8" value={activeTab} onValueChange={setActiveTab} defaultValue="details">
          <TabsList className="h-auto flex-wrap rounded-2xl bg-white p-2 shadow-sm">
            <TabsTrigger value="details" className="rounded-xl px-4 py-2">
              <BookOpen className="mr-2 h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="candidates" className="rounded-xl px-4 py-2" disabled={!isEditMode}>
              <Users className="mr-2 h-4 w-4" />
              Candidates
            </TabsTrigger>
            <TabsTrigger value="attendance" className="rounded-xl px-4 py-2" disabled={!isEditMode}>
              <Calendar className="mr-2 h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-xl px-4 py-2" disabled={!isEditMode}>
              <FileText className="mr-2 h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="certificates" className="rounded-xl px-4 py-2" disabled={!isEditMode}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Certificates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Workflow Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="font-semibold text-slate-800">Creation Path</div>
                  <div className="mt-1 capitalize">{formData.creation_mode}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="font-semibold text-slate-800">Schedule</div>
                  <div className="mt-1">
                    {formData.start_date ? formatDate(formData.start_date) : "-"} to {formData.end_date ? formatDate(formData.end_date) : "-"}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="font-semibold text-slate-800">Location Handling</div>
                  <div className="mt-1">
                    {formData.location_type === "Online"
                      ? "Welcome letters can be sent as soon as a candidate is added."
                      : "Venue details should be filled before sending welcome letters."}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="font-semibold text-slate-800">Feedback Mode</div>
                  <div className="mt-1">{formData.feedback_type}</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates" className="mt-6 space-y-6">
            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Candidates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                {formData.creation_mode === "conversion" ? (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                    Candidates should auto-populate from the selected pre-active course once the backend conversion endpoint returns them.
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="w-full lg:w-80">
                    <FieldLabel label="Search Candidate" />
                    <Input
                      value={candidateSearch}
                      onChange={(event) => setCandidateSearch(event.target.value)}
                      placeholder="Search employee id or candidate name"
                      className="h-11 rounded-xl border-slate-200"
                    />
                  </div>
                  <div className="w-full lg:flex-1">
                    <FieldLabel label="Add Candidate One By One" />
                    <select
                      value={selectedCandidateId}
                      onChange={(event) => setSelectedCandidateId(event.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    >
                      <option value="">Select candidate</option>
                      {filteredCandidateOptions.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.empId} - {candidate.candidate_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="button" className="mt-6 gap-2 lg:mt-0" onClick={handleAddCandidate} disabled={!selectedCandidateId || addingCandidate}>
                    <Plus className="h-4 w-4" />
                    {addingCandidate ? "Adding..." : "Add Candidate"}
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full min-w-[1200px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3">Employee ID</th>
                        <th className="px-4 py-3">Candidate Name</th>
                        <th className="px-4 py-3">Passport</th>
                        <th className="px-4 py-3">Seaman No.</th>
                        <th className="px-4 py-3">Rank</th>
                        <th className="px-4 py-3">Manager</th>
                        <th className="px-4 py-3">Ack</th>
                        <th className="px-4 py-3">Status Pool</th>
                        <th className="px-4 py-3">Welcome Letter</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingCandidates ? (
                        <tr><td colSpan="10" className="px-4 py-6 text-center text-slate-500">Loading candidates...</td></tr>
                      ) : courseCandidates.length === 0 ? (
                        <tr><td colSpan="10" className="px-4 py-6 text-center text-slate-500">No candidates added yet.</td></tr>
                      ) : (
                        courseCandidates.map((candidate) => (
                          <tr key={candidate.id} className="bg-white">
                            <td className="px-4 py-3 font-medium text-slate-700">{candidate.empId}</td>
                            <td className="px-4 py-3">{candidate.candidate_name}</td>
                            <td className="px-4 py-3">{candidate.passport}</td>
                            <td className="px-4 py-3">{candidate.seaman_no}</td>
                            <td className="px-4 py-3">{candidate.rank}</td>
                            <td className="px-4 py-3">{candidate.manager}</td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-700">{candidate.ack_status}</div>
                              <div className="text-xs text-slate-500">{candidate.ack_date ? formatDate(candidate.ack_date) : "Waiting for candidate"}</div>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={candidate.status_pool}
                                onChange={(event) => handleCandidateStatusUpdate(candidate.id, event.target.value)}
                                className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                              >
                                <option value="">Select</option>
                                {STATUS_POOL_OPTIONS.map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                {formData.location_type !== "Online" ? (
                                  <Button type="button" variant="outline" size="sm" onClick={() => setVenueState({ open: true, candidateId: candidate.id, candidate })}>
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Venue
                                  </Button>
                                ) : null}
                                <Button type="button" size="sm" onClick={() => handleWelcomeLetter(candidate.id)}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  {candidate.candidate_email_status ? "Resend" : "Send"}
                                </Button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                disabled={!deleteAllowed || !candidate.delete_allowed}
                                onClick={() => setDeleteState({ open: true, candidateId: candidate.id })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle>Attendance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Everyone is treated as present by default. Mark absences or holidays with remarks.
                </div>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full min-w-[1200px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3">Employee ID</th>
                        <th className="px-4 py-3">Candidate</th>
                        {courseDates.map((date) => (
                          <th key={date} className="px-4 py-3">{formatDate(date)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendanceLoading ? (
                        <tr><td colSpan={courseDates.length + 2} className="px-4 py-6 text-center text-slate-500">Loading attendance...</td></tr>
                      ) : attendanceRows.length === 0 ? (
                        <tr><td colSpan={courseDates.length + 2} className="px-4 py-6 text-center text-slate-500">No candidate attendance rows available.</td></tr>
                      ) : (
                        attendanceRows.map((row) => (
                          <tr key={row.candidate_id}>
                            <td className="px-4 py-3 font-medium text-slate-700">{row.empId}</td>
                            <td className="px-4 py-3">{row.candidate_name}</td>
                            {courseDates.map((date) => (
                              <td key={date} className="min-w-[180px] px-4 py-3 align-top">
                                <select
                                  value={row.days?.[date]?.status || "Present"}
                                  onChange={(event) => handleAttendanceChange(row.candidate_id, date, "status", event.target.value)}
                                  className="h-9 w-full rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                                >
                                  <option value="Present">Present</option>
                                  <option value="Absent">Absent</option>
                                  <option value="Holiday">Holiday</option>
                                </select>
                                {row.days?.[date]?.status !== "Present" ? (
                                  <textarea
                                    rows={2}
                                    placeholder="Remark"
                                    value={row.days?.[date]?.remark || ""}
                                    onChange={(event) => handleAttendanceChange(row.candidate_id, date, "remark", event.target.value)}
                                    className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                                  />
                                ) : null}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <Button type="button" onClick={handleAttendanceSave}>Save Attendance</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="mt-6">
            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle>Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                {feedbackLoading ? (
                  <div className="text-sm text-slate-500">Loading feedback...</div>
                ) : formData.feedback_type === "Document" ? (
                  <>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Upload the feedback form document for this course.
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                      <Upload className="h-4 w-4" />
                      Upload Feedback Document
                      <input type="file" className="hidden" onChange={handleFeedbackUpload} />
                    </label>
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="px-4 py-3">Document Name</th>
                            <th className="px-4 py-3">Uploaded On</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {feedbackData.documents.length === 0 ? (
                            <tr><td colSpan="2" className="px-4 py-6 text-center text-slate-500">No feedback documents uploaded.</td></tr>
                          ) : (
                            feedbackData.documents.map((document, index) => (
                              <tr key={document.id || index}>
                                <td className="px-4 py-3">{document.file_name || document.name || `Document ${index + 1}`}</td>
                                <td className="px-4 py-3">{document.created_at ? formatDate(document.created_at) : "-"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Sr. No.</th>
                          <th className="px-4 py-3">Active Course Name</th>
                          <th className="px-4 py-3">Employee ID</th>
                          <th className="px-4 py-3">Employee Name</th>
                          <th className="px-4 py-3">Average Rating</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {manualFeedbackRows.length === 0 ? (
                          <tr><td colSpan="6" className="px-4 py-6 text-center text-slate-500">No manual feedback records available.</td></tr>
                        ) : (
                          manualFeedbackRows.map((row, index) => (
                            <tr key={row.candidate_id || index}>
                              <td className="px-4 py-3">{row.sr_no || index + 1}</td>
                              <td className="px-4 py-3">{row.active_course_name}</td>
                              <td className="px-4 py-3">{row.employee_id}</td>
                              <td className="px-4 py-3">{row.employee_name}</td>
                              <td className="px-4 py-3">{row.average_rating || "-"}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <Button type="button" variant="outline" size="sm">View</Button>
                                  <Button type="button" variant="outline" size="sm">Download</Button>
                                  <Button type="button" size="sm" onClick={() => handleFeedbackResend(row.candidate_id)}>Resend</Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="mt-6">
            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle>Certificates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {certificateLoading ? (
                  <div className="text-sm text-slate-500">Loading certificate rows...</div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full min-w-[1000px] text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Employee ID</th>
                          <th className="px-4 py-3">Candidate Name</th>
                          <th className="px-4 py-3">Certificate Number</th>
                          <th className="px-4 py-3">Issue Date</th>
                          <th className="px-4 py-3">Upload Certificate</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {certificateRows.length === 0 ? (
                          <tr><td colSpan="6" className="px-4 py-6 text-center text-slate-500">No candidate certificate rows available.</td></tr>
                        ) : (
                          certificateRows.map((row) => (
                            <tr key={row.id}>
                              <td className="px-4 py-3">{row.empId}</td>
                              <td className="px-4 py-3">{row.candidate_name}</td>
                              <td className="px-4 py-3">
                                <Input value={row.certificate_no || ""} onChange={(event) => updateCertificateRow(row.id, "certificate_no", event.target.value)} placeholder="Certificate number" className="h-10 rounded-lg border-slate-200" />
                              </td>
                              <td className="px-4 py-3">
                                <Input type="date" value={row.issue_date || ""} onChange={(event) => updateCertificateRow(row.id, "issue_date", event.target.value)} className="h-10 rounded-lg border-slate-200" />
                              </td>
                              <td className="px-4 py-3">
                                <input type="file" onChange={(event) => updateCertificateRow(row.id, "file", event.target.files?.[0] || null)} className="block w-full text-sm" />
                              </td>
                              <td className="px-4 py-3">
                                <Button type="button" onClick={() => handleCertificateSave(row)}>Save</Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CandidateDeleteModal state={deleteState} onClose={() => setDeleteState({ open: false, candidateId: "" })} onConfirm={handleCandidateDelete} />
      <VenueModal state={venueState} onClose={() => setVenueState({ open: false, candidateId: "", candidate: null })} onSave={handleVenueSave} />
    </div>
  );
};

export default OuthouseCourseForm;
