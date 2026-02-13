import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import feedbackQuestionService from "../../services/feedbackQuestionService";
import feedbackCategoryService from "../../services/feedbackCategoryService";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const FeedbackQuestionForm = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        category_id: initialData?.category_id || "",
        question: initialData?.question || "",
        type: initialData?.type || "rating",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const result = await feedbackCategoryService.getAll({ limit: 1000 });
                setCategories(result.data);
            } catch (error) {
                toast.error("Failed to load categories");
            }
        };
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    useEffect(() => {
        console.log("Form - Initial Data received:", initialData);
        if (initialData) {
            console.log("Form - Setting form data from initialData:", initialData);
            setFormData({
                category_id: initialData.category_id || "",
                question: initialData.question || "",
                type: initialData.type || "rating",
            });
        } else {
            setFormData({
                category_id: "",
                question: "",
                type: "rating",
            });
        }
    }, [initialData, isOpen]);

    // Debug render
    console.log("Form - Current formData:", formData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (value) => {
        setFormData((prev) => ({ ...prev, question: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (initialData) {
                await feedbackQuestionService.update(initialData.id, formData);
                toast.success("Feedback Question updated successfully");
            } else {
                await feedbackQuestionService.create(formData);
                toast.success("Feedback Question created successfully");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving feedback question:", error);
            toast.error(
                error.response?.data?.message || "Failed to save feedback question"
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
                        {initialData ? "Edit Question" : "Add Question"}
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
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="category_id"
                            required
                            value={formData.category_id}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: `right 0.5rem center`,
                                backgroundRepeat: `no-repeat`,
                                backgroundSize: `1.5em 1.5em`,
                                paddingRight: `2.5rem`,
                            }}
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Question <span className="text-red-500">*</span>
                        </label>
                        {/* Debugging: Show raw value */}
                        <div className="mb-2 text-xs text-gray-500">
                            Current Value Length: {formData.question?.length || 0}
                        </div>
                        {/* <textarea 
                            className="w-full h-20 p-2 text-sm border rounded mb-2" 
                            value={formData.question} 
                            readOnly 
                        /> */}
                        <textarea
                            className="w-full h-20 p-2 text-sm border rounded mb-2"
                            value={formData.question}
                            readOnly
                        />

                        <div className="bg-white/50 rounded-xl" style={{ minHeight: '200px' }}>
                            <ReactQuill
                                key={initialData?.id || "new"}
                                theme="snow"
                                value={formData.question}
                                onChange={handleQuestionChange}
                                className="h-40"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Type
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: `right 0.5rem center`,
                                backgroundRepeat: `no-repeat`,
                                backgroundSize: `1.5em 1.5em`,
                                paddingRight: `2.5rem`,
                            }}
                        >
                            <option value="rating">Rating (1-5)</option>
                            <option value="text">Text Answer</option>
                            <option value="yes_no">Yes/No</option>
                        </select>
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

export default FeedbackQuestionForm;
