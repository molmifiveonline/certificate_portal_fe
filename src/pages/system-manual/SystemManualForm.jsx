import React, { useState, useEffect } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import { Form, Formik, Field } from "formik";
import * as Yup from "yup";
import SearchableSelect from "../../components/ui/SearchableSelect";
import { Save, FileText, Link as LinkIcon, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { toast } from "sonner";
import { systemManualCategoryService } from "../../services/systemManualCategoryService";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const validationSchema = Yup.object().shape({
    title: Yup.string()
        .required("Title is required")
        .max(255, "Title must be at most 255 characters"),
    category_id: Yup.string()
        .required("Category is required"),
    document_type: Yup.string()
        .oneOf(['file', 'url'])
        .required("Document type is required"),
    url_link: Yup.string().when("document_type", {
        is: 'url',
        then: () => Yup.string()
            .url("Must be a valid URL")
            .required("URL is required when document type is URL"),
        otherwise: () => Yup.string().nullable()
    }),
});

const SystemManualForm = ({
    initialData = null,
    onSubmit,
    isSubmitting,
    onCancel,
}) => {
    const defaultValues = {
        title: "",
        category_id: "",
        document_type: "file",
        url_link: "",
        document_file: null
    };

    const initialValues = initialData
        ? {
            title: initialData.title || "",
            category_id: initialData.category_id || "",
            document_type: initialData.document_type || "file",
            url_link: initialData.url_link || "",
            document_file: null // Edit mode will show existing file name but we don't bind it here
        }
        : defaultValues;

    const [categories, setCategories] = useState([]);
    
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await systemManualCategoryService.getCategories({ limit: 100 });
                if (response.success && response.data) {
                    setCategories(Array.isArray(response.data.data) ? response.data.data : []);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Failed to load categories");
            }
        };
        fetchCategories();
    }, []);

    const [filePreview, setFilePreview] = useState(
        initialData?.file_original_name || null
    );

    const [previewUrl, setPreviewUrl] = useState(
        initialData?.document_type === 'file' && initialData?.file_name
            ? `${API_URL}/uploads/system_manual/${initialData.file_name}`
            : null
    );

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e, setFieldValue) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            // Validate file type (matching the input's 'accept' attribute)
            const allowedTypes = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png)$/i;
            if (allowedTypes.test(file.name)) {
                if (file.type.startsWith("image/") && file.size > 500 * 1024) {
                    toast.error("Image size must be less than 500 KB");
                    return;
                }
                setFieldValue("document_file", file);
                setFilePreview(file.name);
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                toast.error("Unsupported file type. Please upload PDF, Word, Excel, PowerPoint, or Image files.");
            }
        }
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            if (values.document_type === 'file' && !values.document_file && !initialData?.file_name) {
                toast.error("Please upload a document.");
                setSubmitting(false);
                return;
            }
            await onSubmit(values);
        } catch (error) {
            console.error("Form submission error:", error);
            toast.error(getErrorMessage(error, "Failed to save manual"));
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
            {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setFieldTouched }) => (
                <Form className="space-y-6">
                    <Card className="rounded-2xl border-white/40 bg-white/60 shadow-xl overflow-hidden backdrop-blur-xl">
                        <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-white border-b border-indigo-100/50 pb-8 px-8">
                            <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-500">
                                Manual Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Title Field */}
                                <div className="space-y-2 relative col-span-1 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <Field
                                        name="title"
                                        type="text"
                                        className={`w-full px-4 py-3 bg-white/80 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${errors.title && touched.title
                                            ? "border-red-300 focus:border-red-500 bg-red-50/50"
                                            : "border-slate-200 focus:border-indigo-500"
                                            }`}
                                        placeholder="Enter manual title"
                                        onBlur={(e) => {
                                            handleBlur(e);
                                            setFieldTouched('title', true, false);
                                        }}
                                    />
                                    {errors.title && touched.title && (
                                        <div className="text-red-500 text-sm mt-1">{errors.title}</div>
                                    )}
                                </div>

                                {/* Category Field */}
                                <div className="space-y-2 relative col-span-1 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <SearchableSelect
                                        name="category_id"
                                        value={values.category_id}
                                        onChange={(val) => {
                                            setFieldValue("category_id", val);
                                        }}
                                        onBlur={(e) => {
                                            handleBlur(e);
                                            setFieldTouched('category_id', true, false);
                                        }}
                                        options={categories.map((cat) => ({
                                            value: cat.id,
                                            label: cat.name,
                                        }))}
                                        placeholder="Select Category"
                                        error={!!(errors.category_id && touched.category_id)}
                                    />
                                    {errors.category_id && touched.category_id && (
                                        <div className="text-red-500 text-sm mt-1">{errors.category_id}</div>
                                    )}
                                </div>

                                {/* Document Type Field */}
                                <div className="space-y-2 relative col-span-1 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        Document Type <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-6 mt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <Field type="radio" name="document_type" value="file" className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                                            <span className="text-slate-700 font-medium">Upload File</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <Field type="radio" name="document_type" value="url" className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                                            <span className="text-slate-700 font-medium">Link URL</span>
                                        </label>
                                    </div>
                                    {errors.document_type && touched.document_type && (
                                        <div className="text-red-500 text-sm mt-1">{errors.document_type}</div>
                                    )}
                                </div>

                                {/* Conditional File Upload */}
                                {values.document_type === 'file' && (
                                    <div className="space-y-2 relative col-span-1 md:col-span-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            Document File <span className="text-red-500">*</span>
                                        </label>
                                        <div
                                            className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all cursor-pointer ${isDragging
                                                ? "border-indigo-500 bg-indigo-50/50 scale-[1.01]"
                                                : "border-slate-300 hover:bg-slate-50"
                                                }`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, setFieldValue)}
                                        >
                                            <div className="space-y-1 text-center flex flex-col items-center pointer-events-none">
                                                <div className="bg-indigo-100 p-3 rounded-full mb-2">
                                                    <Upload className="mx-auto h-8 w-8 text-indigo-500" />
                                                </div>
                                                <div className="flex text-sm text-slate-600">
                                                    <label htmlFor="document_file" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                        <span>Upload a file</span>
                                                        <input
                                                            id="document_file"
                                                            name="document_file"
                                                            type="file"
                                                            className="sr-only"
                                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                                                            onChange={(event) => {
                                                                const file = event.currentTarget.files[0];
                                                                if (file) {
                                                                    if (file.type.startsWith("image/") && file.size > 500 * 1024) {
                                                                        toast.error("Image size must be less than 500 KB");
                                                                        event.target.value = "";
                                                                        return;
                                                                    }
                                                                    setFieldValue("document_file", file);
                                                                    setFilePreview(file.name);
                                                                    setPreviewUrl(URL.createObjectURL(file));
                                                                } else {
                                                                    setFieldValue("document_file", null);
                                                                    setFilePreview(initialData?.file_original_name || null);
                                                                    setPreviewUrl(
                                                                        initialData?.document_type === 'file' && initialData?.file_name
                                                                            ? `${API_URL}/uploads/system_manual/${initialData.file_name}`
                                                                            : null
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    PDF, DOC, DOCX, XLS, PPT, JPG, PNG up to 10MB
                                                </p>
                                            </div>
                                        </div>
                                        {filePreview && (
                                            <p className="text-sm text-indigo-600 mt-2 font-medium flex items-center gap-2">
                                                <FileText className="w-4 h-4" /> Selected: {filePreview}
                                            </p>
                                        )}
                                        {previewUrl && (
                                            <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center text-sm font-medium text-slate-700">
                                                    Document Preview
                                                    <a href={previewUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1">
                                                        <LinkIcon className="w-3 h-3" /> Open in new tab
                                                    </a>
                                                </div>
                                                <div className="h-64 sm:h-96 w-full bg-slate-100 flex items-center justify-center p-4">
                                                    {filePreview && filePreview.match(/\.(jpeg|jpg|png|gif|svg)$/i) ? (
                                                        <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg shadow-sm" />
                                                    ) : filePreview && filePreview.match(/\.(pdf)$/i) ? (
                                                        <iframe src={previewUrl} title="PDF Preview" className="w-full h-full border-0 rounded-lg shadow-sm" />
                                                    ) : (
                                                        <div className="text-slate-500 flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                                            <FileText className="w-12 h-12 mb-3 text-indigo-300" />
                                                            <p className="font-semibold text-slate-700">Preview not available</p>
                                                            <p className="text-xs mt-1">Downloading may be required for this file type.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {errors.document_file && touched.document_file && (
                                            <div className="text-red-500 text-sm mt-1">{errors.document_file}</div>
                                        )}
                                    </div>
                                )}

                                {/* Conditional URL Input */}
                                {values.document_type === 'url' && (
                                    <div className="space-y-2 relative col-span-1 md:col-span-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            URL Link <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <LinkIcon className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <Field
                                                name="url_link"
                                                type="text"
                                                className={`w-full pl-10 pr-4 py-3 bg-white/80 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${errors.url_link && touched.url_link
                                                    ? "border-red-300 focus:border-red-500 bg-red-50/50"
                                                    : "border-slate-200 focus:border-emerald-500"
                                                    }`}
                                                placeholder="https://example.com/document"
                                                onBlur={(e) => {
                                                    handleBlur(e);
                                                    setFieldTouched('url_link', true, false);
                                                }}
                                            />
                                        </div>
                                        {errors.url_link && touched.url_link && (
                                            <div className="text-red-500 text-sm mt-1">{errors.url_link}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="sticky bottom-0 z-10 bg-white border-t border-slate-200 p-4 sm:p-6 -mb-8 flex justify-end mt-8 rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex gap-4 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70 text-sm"
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>{initialData ? 'Update Manual' : 'Add Manual'}</span>
                            </button>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default SystemManualForm;


