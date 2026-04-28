import React, { useState, useEffect } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../lib/api";
import activeCourseService from "../../services/activeCourseService";
// import candidateService from '../../services/candidateService'; // Not used directly, using activeCourseService
import {
  Save,
  BookOpen,
  Calendar,
  FileText,
  Users,
  Mail,
  AlertTriangle,
  RefreshCcw,
  Trash2,
  MapPin,
  Check,
} from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils/utils";

import { useAuth } from "../../context/AuthContext";

import { InputField, SelectField } from "./components/FormHelpers";
import MultiSelectInput from "./components/MultiSelectInput";
import CandidatesTab from "./components/CandidatesTab";
import AttendanceTab from "./components/AttendanceTab";
import AssessmentTab from "./components/AssessmentTab";
import FeedbackTab from "./components/FeedbackTab";
import CertificateTab from "./components/CertificateTab";
import CandidateDeleteModal from "./components/CandidateDeleteModal";
import CandidateSelectionModal from "./components/CandidateSelectionModal";
import CourseActionModal from "./components/CourseActionModal";
import EmailTypeModal from "./components/EmailTypeModal";
import VenueModal from "./components/VenueModal";

// ==========================================
// COURSE FORM COMPONENT
// ==========================================

const ActiveCourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [activeTab, setActiveTab] = useState("details");

  // Data State
  const [courseData, setCourseData] = useState(null);
  const [masterCourses, setMasterCourses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [enrolledCandidates, setEnrolledCandidates] = useState([]);

  // Modal State
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [candidateSearch, setCandidateSearch] = useState("");

  // Action Modals
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null,
    reason: "",
  });
  const [emailModal, setEmailModal] = useState({
    isOpen: false,
    candidateId: null,
    type: null,
  }); // type: 'online' | 'offline'

  const [venueModal, setVenueModal] = useState({
    isOpen: false,
    candidateId: null,
    data: null,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    candidateId: null,
    remark: "",
  });

  const isTrainerRole = (user?.role || "").toLowerCase() === "trainer";
  const isTrainerCourseRoute = location.pathname.startsWith("/my-courses");
  const backRoute = isTrainerCourseRoute ? "/my-courses" : "/active-courses";
  const isTrainerCourseReadOnly = isTrainerRole && isTrainerCourseRoute;

  const typeOfLocation = watch("type_of_location");
  const selectedTopic = watch("topic");
  const startDate = watch("start_date");
  const endDate = watch("end_date");

  // Auto-calculate Days from Start/End Date
  useEffect(() => {
    if (startDate && endDate) {
      const diffMs = new Date(endDate) - new Date(startDate);
      const diffDays = Math.max(
        0,
        Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1,
      );
      setValue("no_of_days", diffDays);
    } else {
      setValue("no_of_days", "");
    }
  }, [startDate, endDate, setValue]);

  // Calculate Progress
  const calculateProgress = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    const total = end - start;
    const elapsed = today - start;
    if (total <= 0) return 0;
    const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    return Math.round(progress);
  };

  const progress = calculateProgress();

  const isPastEndDate = () => {
    if (!endDate) return false;
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return new Date() > end;
  };
  const courseEnded = isPastEndDate();

  // Fetch Dependencies
  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [mcRes, locRes, trRes] = await Promise.all([
          api.get("/master-courses"),
          api.get("/locations"),
          api.get("/trainer"),
        ]);

        const getArrayData = (res) => {
          if (Array.isArray(res.data)) return res.data;
          if (res.data && Array.isArray(res.data.data)) return res.data.data;
          return [];
        };

        setMasterCourses(getArrayData(mcRes));
        setLocations(locRes.data?.data?.data || getArrayData(locRes));
        setTrainers(getArrayData(trRes));
      } catch (error) {
        console.error("Error fetching dependencies:", error);
        toast.error(getErrorMessage(error, "Failed to load form dependencies"));
      }
    };
    fetchDependencies();
  }, []);

  // Fetch Course & Candidates
  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const course = await activeCourseService.getCourseById(id);
          setCourseData(course);

          // Reset form
          reset({
            ...course,
            topic: course.topic || "",
            start_date: course.start_date
              ? new Date(course.start_date).toISOString().split("T")[0]
              : "",
            end_date: course.end_date
              ? new Date(course.end_date).toISOString().split("T")[0]
              : "",
            whatsapp_link: course.whatsapp_link || "",
            zoom_link: course.zoom_link || "",
            status: course.status || "Initiated",
            primary_trainer_id: course.primary_trainer_id || "",
            secondary_trainer_ids: course.secondary_trainer_ids
              ? course.secondary_trainer_ids.split(",")
              : [],
            no_of_days: course.no_of_days || "",
            type_of_location: course.type_of_location || "",
            location_id: course.location_id || "",
            other_location: course.other_location || "",
          });

          // Fetch Candidates
          const candidates =
            await activeCourseService.getEnrolledCandidates(id);
          setEnrolledCandidates(candidates);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error(getErrorMessage(error, "Failed to load course data"));
          navigate(backRoute);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [id, navigate, reset, backRoute]);

  // Auto-populate from Master Course
  useEffect(() => {
    if (selectedTopic && masterCourses.length > 0) {
      const selectedMC = masterCourses.find((mc) => mc.id === selectedTopic);
      if (selectedMC) {
        setValue("master_course_id", selectedMC.id);
        setValue("master_course_name", selectedMC.master_course_name);
        if (!id) {
          // Only overwrite description/remarks on create
          setValue("description", selectedMC.description);
          setValue("remarks", selectedMC.remarks);
        }
      }
    }
  }, [selectedTopic, masterCourses, setValue, id]);

  // Fetch Available Candidates for Modal
  const openCandidateModal = async () => {
    try {
      const avail = await activeCourseService.getAvailableCandidates(id);
      setAvailableCandidates(avail);
      setSelectedCandidates([]);
      setIsCandidateModalOpen(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load candidates"));
    }
  };

  // Handlers
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (!data.master_course_name) {
        const mc = masterCourses.find((m) => m.id === data.topic);
        if (mc) data.master_course_name = mc.master_course_name;
      }

      const payload = isTrainerCourseReadOnly
        ? {
            description: data.description,
            remarks: data.remarks,
          }
        : {
            ...data,
            secondary_trainer_ids: Array.isArray(data.secondary_trainer_ids)
              ? data.secondary_trainer_ids.join(",")
              : data.secondary_trainer_ids,
          };

      // Normalize location field
      if (!isTrainerCourseReadOnly && payload.type_of_location === "Offline") {
        if (payload.location_id === "Other") {
          payload.location = payload.other_location;
        } else {
          const loc = locations.find(
            (l) => String(l.id) === String(payload.location_id),
          );
          if (loc) {
            payload.location = loc.location_name;
            // Keep location_id just in case, but location field is what DB usually stores as string?
            // Check DB: existing code uses `location` column.
          }
        }
      } else if (!isTrainerCourseReadOnly) {
        payload.location = payload.other_location || "";
      }

      if (id) {
        await activeCourseService.updateCourse(id, payload);
        toast.success("Course updated successfully");
      } else {
        await activeCourseService.createCourse(payload);
        toast.success("Course created successfully");
        navigate("/active-courses");
      }
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error(getErrorMessage(error, "Failed to save course"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCandidates = async () => {
    try {
      await activeCourseService.enrollCandidates(
        id,
        selectedCandidates,
        courseData.primary_trainer_id,
      );
      toast.success("Candidates enrolled successfully");
      setIsCandidateModalOpen(false);
      const updated = await activeCourseService.getEnrolledCandidates(id);
      setEnrolledCandidates(updated);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to enroll candidates"));
    }
  };

  const handleDeleteCandidate = async () => {
    if (!deleteModal.remark) {
      toast.error("Please provide a remark for deletion");
      return;
    }
    try {
      await activeCourseService.removeCandidate(
        id,
        deleteModal.candidateId,
        deleteModal.remark,
      );
      setEnrolledCandidates((prev) =>
        prev.filter((c) => c.candidate_id !== deleteModal.candidateId),
      );
      toast.success("Candidate removed");
      setDeleteModal({ isOpen: false, candidateId: null, remark: "" });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to remove candidate"));
    }
  };

  const handleStatusPoolChange = async (candidateId, newStatus) => {
    try {
      await activeCourseService.updateStatusPool(id, candidateId, newStatus);
      setEnrolledCandidates((prev) =>
        prev.map((c) =>
          c.candidate_id === candidateId ? { ...c, status_pool: newStatus } : c,
        ),
      );
      toast.success("Status pool updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update status pool"));
    }
  };

  const handleCourseAction = async () => {
    if (!actionModal.reason) {
      toast.error("Please provide a reason");
      return;
    }
    try {
      if (actionModal.type === "cancel") {
        await activeCourseService.cancelCourse(id, actionModal.reason);
        toast.success("Course cancelled");
      } else {
        await activeCourseService.completeCourse(id, actionModal.reason);
        toast.success("Course completed");
      }
      // Refresh data
      const updated = await activeCourseService.getCourseById(id);
      setCourseData(updated);
      setValue("status", updated.status);
      setActionModal({ isOpen: false, type: null, reason: "" });
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to ${actionModal.type} course`));
    }
  };

  const handleEmailTrainers = async () => {
    if (
      !window.confirm(
        "Send enrollment confirmation email to all assigned Trainers?",
      )
    )
      return;
    try {
      await activeCourseService.emailPrimaryTrainer(id);
      toast.success("Emails sent to Trainers");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send email"));
    }
  };

  const handleSendOnlineEmail = async (candidateId) => {
    try {
      await activeCourseService.emailCandidate(id, candidateId, "online");
      toast.success("Online Welcome Letter sent");
      setEmailModal({ isOpen: false, candidateId: null, type: null });
      // Refresh list to update status if needed
      const updated = await activeCourseService.getEnrolledCandidates(id);
      setEnrolledCandidates(updated);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send email"));
    }
  };

  const handleSendOfflineEmail = async (candidateId) => {
    try {
      await activeCourseService.emailCandidate(id, candidateId, "offline");
      toast.success("Offline Welcome Letter sent");
      setEmailModal({ isOpen: false, candidateId: null, type: null });
      const updated = await activeCourseService.getEnrolledCandidates(id);
      setEnrolledCandidates(updated);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send email"));
    }
  };

  const openVenueModal = async (candidateId) => {
    try {
      const data = await activeCourseService.getCandidateVenue(id, candidateId);
      setVenueModal({ isOpen: true, candidateId, data: data || {} });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load venue details"));
    }
  };

  const handleSaveVenue = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      await activeCourseService.updateCandidateVenue(
        id,
        venueModal.candidateId,
        formData,
      );
      toast.success("Venue details updated");
      setVenueModal({ isOpen: false, candidateId: null, data: null });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update venue"));
    }
  };

  const courseTabs = [
    { id: "details", label: "Details" },
    { id: "candidates", label: "Candidates" },
    { id: "attendance", label: "Attendance" },
    {
      id: "assessment",
      label: isTrainerCourseReadOnly ? "Submissions" : "Assessment",
    },
    { id: "feedbacks", label: "Feedbacks" },
    { id: "certificates", label: "Certificates" },
  ];

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div>
      <Meta title={id ? "Edit Course" : "Add Course"} />

      {/* Header */}
      <PageHeader
        title={id ? "Edit Course" : "Create New Course"}
        subtitle={
          courseData
            ? `${courseData.course_name} (${courseData.course_id})`
            : ""
        }
        compact={true}
        backTo={backRoute}
      />
      <div className="min-h-screen bg-slate-50 pb-20">
        {/* Progress Bar */}
        {id && (
          <div className="bg-white border-b border-slate-200 px-8 py-4">
            <div className="flex justify-between text-sm mb-1 font-medium text-slate-600">
              <span>Course Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Messages */}
        {courseData?.cancelation_reason && (
          <div className="mx-8 mt-6 bg-red-50 border border-red-200 p-4 rounded-xl flex gap-3 text-red-700">
            <AlertTriangle className="shrink-0" />
            <div>
              <h4 className="font-bold">Course Cancelled</h4>
              <p className="text-sm">{courseData.cancelation_reason}</p>
            </div>
          </div>
        )}
        {courseData?.completion_reason && (
          <div className="mx-8 mt-6 bg-green-50 border border-green-200 p-4 rounded-xl flex gap-3 text-green-700">
            <Check className="shrink-0" />
            <div>
              <h4 className="font-bold">Course Completed</h4>
              <p className="text-sm">{courseData.completion_reason}</p>
            </div>
          </div>
        )}

        <div className="max-w-none p-8 space-y-8">
          {/* Tabs */}
          {id && (
            <div className="flex border-b border-slate-200">
              {courseTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize",
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Details Tab Content */}
          {activeTab === "details" && (
            <div className="space-y-8">
              <form id="course-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-6 text-lg font-bold text-slate-800">
                        <BookOpen size={20} className="text-blue-600" />
                        <h3>Course Details</h3>
                      </div>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <SelectField
                            label="Topic"
                            name="topic"
                            required
                            disabled={isTrainerCourseReadOnly}
                            register={register}
                            errors={errors}
                            options={masterCourses.map((mc) => ({
                              value: mc.id,
                              label: mc.topic,
                            }))}
                          />
                          <InputField
                            label="Course Name"
                            name="course_name"
                            required
                            disabled={isTrainerCourseReadOnly}
                            register={register}
                            errors={errors}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InputField
                            label="Master Course Name"
                            name="master_course_name"
                            readOnly
                            register={register}
                            errors={errors}
                          />
                          {id && (
                            <InputField
                              label="Course ID"
                              name="course_id"
                              readOnly
                              register={register}
                              errors={errors}
                            />
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <SelectField
                            label="Status"
                            name="status"
                            disabled
                            register={register}
                            errors={errors}
                            options={[
                              "Initiated",
                              "Course Started",
                              "Assessment Initiated",
                              "Feedback Generated",
                              "Certificate Generated",
                              "Course Completed",
                              "Cancelled",
                            ].map((s) => ({ value: s, label: s }))}
                          />
                          <SelectField
                            label="Course Level"
                            name="course_level"
                            disabled={isTrainerCourseReadOnly}
                            register={register}
                            errors={errors}
                            options={[
                              { value: "Operational", label: "Operational" },
                              { value: "Management", label: "Management" },
                            ]}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <SelectField
                            label="Type of Course"
                            name="course_type"
                            disabled={isTrainerCourseReadOnly}
                            register={register}
                            errors={errors}
                            options={[
                              { value: "Inhouse", label: "Inhouse" },
                              { value: "Outhouse", label: "Outhouse" },
                              { value: "CBT", label: "CBT" },
                              {
                                value: "Inhouse (Third party)",
                                label: "Inhouse (Third party)",
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-6 text-lg font-bold text-slate-800">
                        <Calendar size={20} className="text-blue-600" />
                        <h3>Schedule & Location</h3>
                      </div>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <InputField
                            label="Start Date"
                            name="start_date"
                            type="date"
                            required
                            disabled={isTrainerCourseReadOnly}
                            max={endDate}
                            register={register}
                            errors={errors}
                          />
                          <InputField
                            label="End Date"
                            name="end_date"
                            type="date"
                            required
                            disabled={isTrainerCourseReadOnly}
                            min={startDate}
                            register={register}
                            errors={errors}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InputField
                            label="Start Time"
                            name="start_time"
                            type="time"
                            disabled={isTrainerCourseReadOnly}
                            register={register}
                            errors={errors}
                          />
                          <InputField
                            label="End Time"
                            name="end_time"
                            type="time"
                            disabled={isTrainerCourseReadOnly}
                            register={register}
                            errors={errors}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <InputField
                            label="No. of Days"
                            name="no_of_days"
                            type="number"
                            readOnly
                            register={register}
                            errors={errors}
                          />
                          <SelectField
                            label="Location Type"
                            name="type_of_location"
                            disabled={isTrainerCourseReadOnly}
                            register={register}
                            errors={errors}
                            options={[
                              { value: "Online", label: "Online" },
                              { value: "Offline", label: "Offline" },
                              { value: "Manual", label: "Manual" },
                            ]}
                          />
                        </div>
                        {/* Conditional Location Fields */}
                        {typeOfLocation === "Offline" && (
                          <SelectField
                            label="Location of Training"
                            name="location_id"
                            disabled={isTrainerCourseReadOnly}
                            register={register}
                            errors={errors}
                            options={[
                              ...locations.map((loc) => ({
                                value: loc.location_name,
                                label: loc.location_name,
                              })),
                              { value: "Other", label: "Other" },
                            ]}
                          />
                        )}

                        {((typeOfLocation === "Offline" &&
                          watch("location_id") === "Other") ||
                          typeOfLocation === "Manual") && (
                          <InputField
                            label="Specify Location"
                            name="other_location"
                            required
                            disabled={isTrainerCourseReadOnly}
                            register={register}
                            errors={errors}
                            placeholder="Enter location"
                          />
                        )}

                        {typeOfLocation === "Online" && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <InputField
                                label="Zoom Link"
                                name="zoom_link"
                                disabled={isTrainerCourseReadOnly}
                                register={register}
                                errors={errors}
                              />
                              <InputField
                                label="WhatsApp Group"
                                name="whatsapp_link"
                                disabled={isTrainerCourseReadOnly}
                                register={register}
                                errors={errors}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <InputField
                                label="Zoom ID"
                                name="zoom_username"
                                disabled={isTrainerCourseReadOnly}
                                register={register}
                                errors={errors}
                              />
                              <InputField
                                label="Zoom Password"
                                name="zoom_password"
                                disabled={isTrainerCourseReadOnly}
                                register={register}
                                errors={errors}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-6 text-lg font-bold text-slate-800">
                        <Users size={20} className="text-blue-600" />
                        <h3>Trainers & Info</h3>
                      </div>
                      <div className="space-y-6">
                        <SelectField
                          label="Primary Trainer"
                          name="primary_trainer_id"
                          required
                          disabled={isTrainerCourseReadOnly}
                          register={register}
                          errors={errors}
                          options={trainers.map((t) => ({
                            value: t.id,
                            label: `${t.first_name} ${t.last_name}`,
                          }))}
                        />

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 block">
                            Secondary Trainer
                          </label>
                          <Controller
                            control={control}
                            name="secondary_trainer_ids"
                            render={({ field }) => (
                              <MultiSelectInput
                                value={field.value}
                                onChange={field.onChange}
                                disabled={isTrainerCourseReadOnly}
                                options={trainers.map((t) => ({
                                  value: t.id,
                                  label: `${t.first_name} ${t.last_name}`,
                                }))}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-6 text-lg font-bold text-slate-800">
                        <FileText size={20} className="text-blue-600" />
                        <h3>Description & Remarks</h3>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 block">
                            Description
                          </label>
                          <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                              <ReactQuill
                                {...field}
                                theme="snow"
                                readOnly={false}
                              />
                            )}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 block">
                            Remarks
                          </label>
                          <Controller
                            name="remarks"
                            control={control}
                            render={({ field }) => (
                              <ReactQuill
                                {...field}
                                theme="snow"
                                readOnly={false}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 sm:p-6 -mx-8 -mb-8 flex justify-between items-center z-10 mt-8 rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  {id ? (
                    <div className="flex gap-2">
                      {!isTrainerRole && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleEmailTrainers}
                          className="gap-2"
                        >
                          <Mail size={16} /> Email Trainers
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div />
                  )}
                  <div className="flex gap-4 w-full sm:w-auto items-center">
                    <button
                      type="button"
                      onClick={() => navigate(backRoute)}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
                    >
                      Cancel
                    </button>
                    {id &&
                      !isTrainerRole &&
                      !["Cancelled", "Course Completed"].includes(
                        courseData?.status,
                      ) && (
                        <>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() =>
                              setActionModal({
                                isOpen: true,
                                type: "cancel",
                                reason: "",
                              })
                            }
                          >
                            <Trash2 size={16} className="mr-2" /> Cancel Course
                          </Button>
                          <Button
                            type="button"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() =>
                              setActionModal({
                                isOpen: true,
                                type: "complete",
                                reason: "",
                              })
                            }
                          >
                            <Check size={16} className="mr-2" /> Complete Course
                          </Button>
                        </>
                      )}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70 text-sm"
                    >
                      {isSubmitting ? (
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>
                        {isTrainerCourseReadOnly
                          ? "Save Description & Remarks"
                          : id
                            ? "Save Changes"
                            : "Create Course"}
                      </span>
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Candidates Tab */}
          {activeTab === "candidates" && (
            <CandidatesTab
              candidates={enrolledCandidates}
              onAdd={openCandidateModal}
              onEmail={(cid) =>
                setEmailModal({ isOpen: true, candidateId: cid })
              }
              onVenue={openVenueModal}
              onDelete={(cid) =>
                setDeleteModal({ isOpen: true, candidateId: cid, remark: "" })
              }
              onStatusPoolChange={handleStatusPoolChange}
              isTrainerRole={isTrainerRole}
              courseEnded={courseEnded}
              typeOfLocation={typeOfLocation}
            />
          )}

          {/* Attendance Tab */}
          {activeTab === "attendance" && (
            <AttendanceTab courseId={id} isTrainerRole={isTrainerRole} />
          )}

          {/* Assessment / Submissions Tab */}
          {activeTab === "assessment" && (
            <AssessmentTab courseId={id} isTrainerRole={isTrainerRole} />
          )}

          {/* Feedbacks Tab */}
          {activeTab === "feedbacks" && (
            <FeedbackTab courseId={id} isTrainerRole={isTrainerRole} />
          )}

          {/* Certificates Tab */}
          {activeTab === "certificates" && (
            <CertificateTab courseId={id} isTrainerRole={isTrainerRole} />
          )}
        </div>

        {/* Modals */}
        <CandidateDeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() =>
            setDeleteModal({ isOpen: false, candidateId: null, remark: "" })
          }
          onConfirm={handleDeleteCandidate}
          remark={deleteModal.remark}
          setRemark={(val) => setDeleteModal({ ...deleteModal, remark: val })}
        />

        <CandidateSelectionModal
          isOpen={isCandidateModalOpen}
          onClose={() => setIsCandidateModalOpen(false)}
          availableCandidates={availableCandidates}
          selectedCandidates={selectedCandidates}
          setSelectedCandidates={setSelectedCandidates}
          candidateSearch={candidateSearch}
          setCandidateSearch={setCandidateSearch}
          onAdd={handleAddCandidates}
        />

        <CourseActionModal
          isOpen={actionModal.isOpen}
          onClose={() =>
            setActionModal({ isOpen: false, type: null, reason: "" })
          }
          onConfirm={handleCourseAction}
          type={actionModal.type}
          reason={actionModal.reason}
          setReason={(val) => setActionModal({ ...actionModal, reason: val })}
        />

        <EmailTypeModal
          isOpen={emailModal.isOpen}
          onClose={() => setEmailModal({ isOpen: false, candidateId: null })}
          onSendOnline={handleSendOnlineEmail}
          onSendOffline={handleSendOfflineEmail}
          candidateId={emailModal.candidateId}
        />

        <VenueModal
          isOpen={venueModal.isOpen}
          onClose={() =>
            setVenueModal({ isOpen: false, candidateId: null, data: null })
          }
          onSubmit={handleSaveVenue}
          data={venueModal.data}
        />
      </div>
    </div>
  );
};

export default ActiveCourseForm;
