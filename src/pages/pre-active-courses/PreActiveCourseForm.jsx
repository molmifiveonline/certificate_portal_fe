import React, { useState, useEffect, useRef } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Save, BookOpen, Calendar, FileText } from "lucide-react";
import preActiveCourseService from "../../services/preActiveCourseService";
import api from "../../lib/api";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import locationService from "../../services/locationService";
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";

const SelectField = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  required,
  ...props
}) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-slate-700 block text-left">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${error ? "border-red-500" : "border-slate-200"} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm cursor-pointer`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <span className="text-red-500 text-xs">{error}</span>}
  </div>
);

const InputField = ({ label, name, error, required, className = "", ...props }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-slate-700 block text-left">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Input
      name={name}
      error={error}
      className={`${error ? "border-red-500" : "border-slate-200"} ${className}`.trim()}
      placeholder={props.placeholder || (props.type === "date" ? "DD-MM-YYYY" : "")}
      {...props}
    />
    {error && <span className="text-red-500 text-xs">{error}</span>}
  </div>
);

const PreActiveCourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const containerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [masterCourses, setMasterCourses] = useState([]);
  const [locations, setLocations] = useState([]);

  const [formData, setFormData] = useState({
    topic: "", // maps to master_course_id and topic internally via controller
    course_name: "",
    start_date: "",
    end_date: "",
    days: "",
    type_of_course: "", // 'In house', 'Out house', 'CBT', 'Inhouse (third party)'
    type_of_location: "", // 'Online', 'Offline'
    location_id: "",
    other_location: "",
    description: "",
    remarks: "",
  });

  const [errors, setErrors] = useState({});

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pre-Active Courses", href: "/pre-active-courses" },
    { label: isEditMode ? "Edit Course" : "Create Course", href: "#" },
  ];

  useEffect(() => {
    fetchDependancies();
    if (isEditMode) {
      fetchCourseDetails();
    }
  }, [id, isEditMode]);

  const getSelectedMasterCourse = (masterCourseId) =>
    masterCourses.find((course) => String(course.id) === String(masterCourseId));

  const fetchDependancies = async () => {
    try {
      const [coursesRes, locRes] = await Promise.all([
        api.get("/master-courses", { params: { limit: 100 } }), // Get all master courses
        locationService.getLocations({ limit: 100 }),
      ]);
      setMasterCourses(coursesRes.data?.data || []);
      setLocations(locRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching dependencies:", error);
      toast.error(getErrorMessage(error, "Failed to load form dependencies"));
    }
  };

  const fetchCourseDetails = async () => {
    try {
      setInitialLoading(true);
      const data = await preActiveCourseService.getById(id);

      setFormData({
        topic: data.master_course_id || "",
        course_name: data.course_name || "",
        start_date: data.start_date ? data.start_date.split("T")[0] : "",
        end_date: data.end_date ? data.end_date.split("T")[0] : "",
        days: data.no_of_days || "",
        type_of_course: data.course_type || "", // the backend expects type_of_course on create, maps to course_type internally, mapping back
        type_of_location: data.type_of_location || "",
        location_id: data.location_id || "",
        other_location: data.other_location || "",
        description: data.description || "",
        remarks: data.remarks || "",
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch course details"));
      navigate("/pre-active-courses");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "start_date" || name === "end_date") {
      const start = name === "start_date" ? value : formData.start_date;
      const end = name === "end_date" ? value : formData.end_date;
      if (start && end) {
        const diffMs = new Date(end) - new Date(start);
        const diffDays = Math.max(
          0,
          Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1,
        );
        setFormData((prev) => ({ ...prev, days: diffDays }));
      }
    }
  };

  const handleMasterCourseChange = (e) => {
    const mcId = e.target.value;
    const selected = getSelectedMasterCourse(mcId);

    setFormData((prev) => ({
      ...prev,
      topic: mcId,
      course_name: selected?.master_course_name || "",
      description: selected?.description || "",
      remarks: selected?.remarks || "",
    }));

    // Clear errors for both topic and course_name
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (mcId) delete newErrors.topic;
      if (selected && selected.master_course_name) delete newErrors.course_name;
      return newErrors;
    });
  };

  const handleDescriptionChange = (content) => {
    setFormData((prev) => ({ ...prev, description: content }));
  };

  const handleRemarksChange = (content) => {
    setFormData((prev) => ({ ...prev, remarks: content }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.topic) newErrors.topic = "Master Course Topic is required";
    if (!formData.course_name)
      newErrors.course_name = "Course Name is required";
    if (!formData.start_date) newErrors.start_date = "Start Date is required";
    if (!formData.end_date) newErrors.end_date = "End Date is required";
    if (!formData.type_of_course)
      newErrors.type_of_course = "Course Type is required";

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        newErrors.end_date = "End date cannot be earlier than start date";
      }
    }

    setErrors(newErrors);

    // Auto-scroll to first error
    if (Object.keys(newErrors).length > 0 && containerRef.current) {
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorElement = containerRef.current.querySelector(
        `[name="${firstErrorKey}"]`,
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement.focus();
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await preActiveCourseService.update(id, formData);
        toast.success("Course updated successfully");
      } else {
        await preActiveCourseService.create(formData);
        toast.success("Course created successfully");
      }
      navigate("/pre-active-courses");
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to ${isEditMode ? "update" : "create"} course`));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Meta
        title={isEditMode ? "Edit Pre-Active Course" : "Add Pre-Active Course"}
      />

      {/* Header */}
      <PageHeader
        title={isEditMode ? 'Edit Pre-Active Course' : 'Create Pre-Active Course'}
        subtitle={isEditMode ? `Updating ${formData.course_name}` : 'Setup a new pre-active course for nominations'}
        compact={true}
        backTo="/pre-active-courses"
      />
      <div className="min-h-screen bg-slate-50" ref={containerRef}>
        <div className="max-w-[1600px] mx-auto p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Left Column: Basic Details */}
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-6 text-lg font-bold text-slate-800">
                    <BookOpen size={20} className="text-blue-600" />
                    <h3>Course Details</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SelectField
                        label="Course Topic"
                        name="topic"
                        value={formData.topic}
                        onChange={handleMasterCourseChange}
                        options={[
                          { label: "Select Topic", value: "" },
                          ...masterCourses.map((c) => ({
                            label: c.topic,
                            value: c.id,
                          })),
                        ]}
                        error={errors.topic}
                        required
                      />

                      <InputField
                        label="Master Course Name"
                        name="course_name"
                        value={formData.course_name}
                        readOnly
                        placeholder="Course Name"
                        error={errors.course_name}
                        required
                        className="bg-slate-100 cursor-not-allowed"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SelectField
                        label="Type of Course"
                        name="type_of_course"
                        value={formData.type_of_course}
                        onChange={handleChange}
                        options={[
                          { label: "Select Type", value: "" },
                          { label: "In house", value: "In house" },
                          { label: "Out house", value: "Out house" },
                          { label: "CBT", value: "CBT" },
                          {
                            label: "Inhouse (third party)",
                            value: "Inhouse (third party)",
                          },
                        ]}
                        error={errors.type_of_course}
                        required
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        label="Start Date"
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        error={errors.start_date}
                        required
                        max={formData.end_date}
                      />

                      <InputField
                        label="End Date"
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        error={errors.end_date}
                        required
                        min={formData.start_date}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        label="Duration (Days)"
                        type="number"
                        name="days"
                        value={formData.days}
                        readOnly
                        className="bg-slate-50"
                      />
                      <SelectField
                        label="Location of Training"
                        name="type_of_location"
                        value={formData.type_of_location}
                        onChange={handleChange}
                        options={[
                          { label: "Select Location Type", value: "" },
                          { label: "Online", value: "Online" },
                          { label: "Offline", value: "Offline" },
                        ]}
                      />
                    </div>

                    {formData.type_of_location === "Offline" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectField
                          label="Training Venue"
                          name="location_id"
                          value={formData.location_id}
                          onChange={handleChange}
                          options={[
                            { label: "Select Location", value: "" },
                            ...locations.map((loc) => ({
                              label: loc.location_name,
                              value: loc.id,
                            })),
                            { label: "Other", value: "other" },
                          ]}
                        />

                        {formData.location_id === "other" && (
                          <InputField
                            label="Enter Other Location"
                            name="other_location"
                            value={formData.other_location}
                            onChange={handleChange}
                            placeholder="Enter alternative location"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Descriptions */}
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-6 text-lg font-bold text-slate-800">
                    <FileText size={20} className="text-blue-600" />
                    <h3>Description & Remarks</h3>
                  </div>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 block">
                        Course Description
                      </label>
                      <div className="prose-slate">
                        <ReactQuill
                          theme="snow"
                          value={formData.description}
                          onChange={handleDescriptionChange}
                          className="h-48 mb-12"
                          placeholder="Enter course description here..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 block">
                        Remarks
                      </label>
                      <div className="prose-slate">
                        <ReactQuill
                          theme="snow"
                          value={formData.remarks}
                          onChange={handleRemarksChange}
                          className="h-32 mb-12"
                          placeholder="Enter any remarks..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 sm:p-6 -mx-8 -mb-8 flex justify-end z-10 mt-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-b-xl">
              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate("/pre-active-courses")}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70 text-sm min-w-[160px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>
                        {isEditMode ? "Update" : "Create"} Pre-Active Course
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PreActiveCourseForm;


