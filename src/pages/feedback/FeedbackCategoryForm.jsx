import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import feedbackCategoryService from "../../services/feedbackCategoryService";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const FeedbackCategoryForm = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategory = async () => {
            if (initialData?.id) {
                setLoading(true);
                try {
                    const data = await feedbackCategoryService.getById(initialData.id);
                    setFormData({
                        name: data.name || "",
                        description: data.description || "",
                    });
                } catch (error) {
                    console.error("Error fetching category details:", error);
                    toast.error("Failed to load category details");
                    // Fallback to initialData if API fails
                    setFormData({
                        name: initialData.name || "",
                        description: initialData.description || "",
                    });
                } finally {
                    setLoading(false);
                }
            } else {
                setFormData({
                    name: "",
                    description: "",
                });
            }
        };

        if (isOpen) {
            fetchCategory();
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDescriptionChange = (value) => {
        setFormData((prev) => ({ ...prev, description: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (initialData) {
                await feedbackCategoryService.update(initialData.id, formData);
                toast.success("Feedback Category updated successfully");
            } else {
                await feedbackCategoryService.create(formData);
                toast.success("Feedback Category created successfully");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving feedback category:", error);
            toast.error(
                error.response?.data?.message || "Failed to save feedback category"
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl border border-white/40 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">
                        {initialData ? "Edit Category" : "Add Category"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            placeholder="Enter category name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                        </label>
                        <ReactQuill
                            theme="snow"
                            value={formData.description}
                            onChange={handleDescriptionChange}
                            className="bg-white/50 rounded-xl overflow-hidden"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : initialData ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackCategoryForm;
