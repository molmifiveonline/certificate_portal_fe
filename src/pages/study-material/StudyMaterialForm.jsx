import React, { useState, useEffect, useRef } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import { Form, Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import SearchableSelect from "../../components/ui/SearchableSelect";
import { Save, Upload, X, File, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import api from "../../lib/api";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const validationSchema = Yup.object().shape({
  master_course_id: Yup.string().required("Master course is required"),
  category: Yup.string()
    .required("category is required")
    .max(255, "category must be at most 255 characters"),
  user_type: Yup.string().required("User Type is required"),
  access_type: Yup.string().required("Access Type is required"),
});

const StudyMaterialForm = ({
  initialData = null,
  onSubmit,
  isSubmitting,
  onCancel,
  onDelete,
}) => {
  const defaultValues = {
    master_course_id: "",
    category: "",
    user_type: "both",
    access_type: "view",
  };

  const initialValues = initialData
    ? {
        master_course_id: initialData.master_course_id || "",
        category: initialData.category || "",
        user_type: initialData.user_type || "both",
        access_type: initialData.access_type || "view",
      }
    : defaultValues;

  const [masterCourses, setMasterCourses] = useState([]);

  // File upload states
  const fileInputRef = useRef(null);
  const [existingFiles, setExistingFiles] = useState(initialData?.files || []);
  const [newFiles, setNewFiles] = useState([]);
  const [removedFileIds, setRemovedFileIds] = useState([]);

  useEffect(() => {
    const fetchMasterCourses = async () => {
      try {
        const response = await api.get("/master-courses", {
          params: { limit: 1000 },
        });
        if (response.data && response.data.data) {
          setMasterCourses(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching master courses:", error);
        toast.error("Failed to load master courses");
      }
    };
    fetchMasterCourses();
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFileObjects = files.map((file) => {
      // Get original name without extension to use as default display name
      const lastDotIndex = file.name.lastIndexOf(".");
      const defaultDisplayName =
        lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;

      return {
        file,
        id: Math.random().toString(36).substring(7),
        display_name: defaultDisplayName,
        original_name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      };
    });

    setNewFiles((prev) => [...prev, ...newFileObjects]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeNewFile = (id) => {
    setNewFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const removeExistingFile = (fileId) => {
    setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
    setRemovedFileIds((prev) => [...prev, fileId]);
  };

  const updateNewFileDisplayName = (id, newName) => {
    setNewFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, display_name: newName } : f)),
    );
  };

  const updateExistingFileDisplayName = (id, newName) => {
    setExistingFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, display_name: newName } : f)),
    );
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      formData.append("master_course_id", values.master_course_id);
      formData.append("category", values.category);
      formData.append("user_type", values.user_type);
      formData.append("access_type", values.access_type);

      // Append new files
      const newFileDisplayNames = [];
      newFiles.forEach((fileObj) => {
        formData.append("files", fileObj.file);
        newFileDisplayNames.push(fileObj.display_name);
      });

      // Need to pass display names along with files
      if (newFileDisplayNames.length > 0) {
        formData.append(
          "new_file_display_names",
          JSON.stringify(newFileDisplayNames),
        );
        // For initial create API that expects file_display_names
        formData.append(
          "file_display_names",
          JSON.stringify(newFileDisplayNames),
        );
      }

      // If editing, handle existing and removed files
      if (initialData) {
        if (removedFileIds.length > 0) {
          formData.append("removed_files", JSON.stringify(removedFileIds));
        }

        // Track display name updates for existing files
        const existingFilesUpdates = existingFiles.map((f) => ({
          id: f.id,
          display_name: f.display_name,
        }));
        if (existingFilesUpdates.length > 0) {
          formData.append(
            "existing_file_display_names",
            JSON.stringify(existingFilesUpdates),
          );
        }
      }

      await onSubmit(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue, errors, touched }) => (
        <Form className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-800">
                Material Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      Master course <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      options={masterCourses.map((c) => ({
                        value: c.id,
                        label: c.master_course_name,
                      }))}
                      value={values.master_course_id}
                      onChange={(val) => setFieldValue("master_course_id", val)}
                      placeholder="Select Master Course"
                      error={
                        touched.master_course_id
                          ? errors.master_course_id
                          : undefined
                      }
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="category"
                      value={values.category}
                      onChange={(e) =>
                        setFieldValue("category", e.target.value)
                      }
                      placeholder="e.g. Navigation Basics"
                      error={touched.category ? errors.category : undefined}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">
                      User Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Field
                          type="radio"
                          name="user_type"
                          value="trainer"
                          className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span className="text-sm text-slate-700">Trainer</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Field
                          type="radio"
                          name="user_type"
                          value="candidate"
                          className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span className="text-sm text-slate-700">
                          Candidate
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Field
                          type="radio"
                          name="user_type"
                          value="both"
                          className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span className="text-sm text-slate-700">Both</span>
                      </label>
                    </div>
                    <ErrorMessage
                      name="user_type"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">
                      Access Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Field
                          type="radio"
                          name="access_type"
                          value="view"
                          className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span className="text-sm text-slate-700">View</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Field
                          type="radio"
                          name="access_type"
                          value="view_download"
                          className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span className="text-sm text-slate-700">
                          View & Download
                        </span>
                      </label>
                    </div>
                    <ErrorMessage
                      name="access_type"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center justify-between">
                <span>Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 text-center">
                  PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                />
              </div>

              {/* Existing Files */}
              {existingFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-700 border-b pb-2">
                    Existing Files
                  </h4>
                  <div className="space-y-3">
                    {existingFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg shadow-sm"
                      >
                        <div className="h-10 w-10 rounded bg-indigo-50 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Input
                            label="Display Name"
                            value={file.display_name}
                            onChange={(e) =>
                              updateExistingFileDisplayName(
                                file.id,
                                e.target.value,
                              )
                            }
                            className="h-8 text-sm mt-1"
                          />
                          <p className="text-xs text-slate-500 truncate mt-1">
                            Original: {file.file_original_name}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExistingFile(file.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Files */}
              {newFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-700 border-b pb-2">
                    New Files to Upload
                  </h4>
                  <div className="space-y-3">
                    {newFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-4 p-3 bg-white border border-indigo-200 rounded-lg shadow-sm bg-indigo-50/30"
                      >
                        <div className="h-10 w-10 rounded bg-indigo-100 flex items-center justify-center shrink-0">
                          <File className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Input
                            label="Display Name"
                            value={file.display_name}
                            onChange={(e) =>
                              updateNewFileDisplayName(file.id, e.target.value)
                            }
                            className="h-8 text-sm mt-1"
                          />
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-500 truncate">
                              Original: {file.original_name}
                            </p>
                            <span className="text-xs text-slate-400">•</span>
                            <p className="text-xs text-slate-500">
                              {file.size}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNewFile(file.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between items-center pt-4">
            <div>
              {onDelete && initialData && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={onDelete}
                  disabled={isSubmitting}
                >
                  Delete Material
                </Button>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {initialData ? "Update" : "Create"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default StudyMaterialForm;
