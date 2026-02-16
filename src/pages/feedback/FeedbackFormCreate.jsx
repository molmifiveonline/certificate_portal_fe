import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Meta from "../../components/common/Meta";
import { ArrowLeft, Save, Plus, Trash2, X, Check, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";
import feedbackCategoryService from "../../services/feedbackCategoryService";
import feedbackFormService from "../../services/feedbackFormService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const MultiSelect = ({ options, selectedValues, onChange, placeholder = "Select..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (value) => {
        const newSelected = selectedValues.includes(value)
            ? selectedValues.filter(v => v !== value)
            : [...selectedValues, value];
        onChange(newSelected);
    };

    const selectedLabels = options
        .filter(opt => selectedValues.includes(opt.value))
        .map(opt => opt.label);

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 bg-white/50 border border-slate-200/60 rounded-xl cursor-pointer flex items-center justify-between min-h-[42px]"
            >
                <div className="flex flex-wrap gap-1">
                    {selectedLabels.length > 0 ? (
                        selectedLabels.map(label => (
                            <span key={label} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md">
                                {label}
                            </span>
                        ))
                    ) : (
                        <span className="text-slate-400">{placeholder}</span>
                    )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {options.map(option => (
                        <div
                            key={option.value}
                            onClick={() => toggleOption(option.value)}
                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-2 text-sm text-slate-700"
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedValues.includes(option.value) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                {selectedValues.includes(option.value) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const FeedbackFormCreate = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    // Form State
    const [title, setTitle] = useState("");
    const [typeOfCourse, setTypeOfCourse] = useState("All");
    const [status, setStatus] = useState(1);

    // Complex State: Dictionary of Category ID -> Array of Questions
    const [selectedCategories, setSelectedCategories] = useState([]); // List of category IDs
    const [categoryQuestions, setCategoryQuestions] = useState({});

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Categories
                const catResult = await feedbackCategoryService.getAll({ limit: 100 });
                const allCategories = catResult.data;
                setCategories(allCategories);

                // 2. Fetch Form Data if Edit Mode
                if (isEditMode) {
                    const form = await feedbackFormService.getById(id);
                    setTitle(form.title);
                    setTypeOfCourse(form.type_of_course);
                    setStatus(form.status);

                    const loadedSelectedCats = Object.keys(form.questions);
                    setSelectedCategories(loadedSelectedCats);

                    const loadedQuestions = {};
                    loadedSelectedCats.forEach(catId => {
                        loadedQuestions[catId] = form.questions[catId].questions;
                    });
                    setCategoryQuestions(loadedQuestions);
                } else {
                    // New Mode: Start with NO categories selected
                    setSelectedCategories([]);
                    setCategoryQuestions({});
                }
            } catch (error) {
                console.error("Error loading data:", error);
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id, isEditMode]);

    const handleCategoryChange = (newSelectedIds) => {
        // Identify added categories
        const added = newSelectedIds.filter(id => !selectedCategories.includes(id));
        // Identify removed categories
        const removed = selectedCategories.filter(id => !newSelectedIds.includes(id));

        // Update selected list
        setSelectedCategories(newSelectedIds);

        // Update questions map
        const newQuestionsMap = { ...categoryQuestions };

        // Initialize added categories
        added.forEach(id => {
            newQuestionsMap[id] = [];
        });

        // Clean up removed categories
        removed.forEach(id => {
            delete newQuestionsMap[id];
        });

        setCategoryQuestions(newQuestionsMap);
    };

    const handleAddQuestion = (catId) => {
        const newQuestion = {
            id: crypto.randomUUID(),
            question: "",
            type: "rating", // Default to rating as requested
            options: [] // Empty options by default
        };

        setCategoryQuestions({
            ...categoryQuestions,
            [catId]: [...(categoryQuestions[catId] || []), newQuestion]
        });
    };

    const handleRemoveQuestion = (catId, qIdx) => {
        const updatedQs = [...categoryQuestions[catId]];
        updatedQs.splice(qIdx, 1);
        setCategoryQuestions({
            ...categoryQuestions,
            [catId]: updatedQs
        });
    };

    const handleQuestionChange = (catId, qIdx, field, value) => {
        const updatedQs = [...categoryQuestions[catId]];
        updatedQs[qIdx] = { ...updatedQs[qIdx], [field]: value };
        setCategoryQuestions({
            ...categoryQuestions,
            [catId]: updatedQs
        });
    };

    const handleAddOption = (catId, qIdx) => {
        const updatedQs = [...categoryQuestions[catId]];
        updatedQs[qIdx].options.push(""); // Add empty option
        setCategoryQuestions({
            ...categoryQuestions,
            [catId]: updatedQs
        });
    };

    const handleOptionChange = (catId, qIdx, optIdx, value) => {
        const updatedQs = [...categoryQuestions[catId]];
        updatedQs[qIdx].options[optIdx] = value;
        setCategoryQuestions({
            ...categoryQuestions,
            [catId]: updatedQs
        });
    };

    const handleRemoveOption = (catId, qIdx, optIdx) => {
        const updatedQs = [...categoryQuestions[catId]];
        updatedQs[qIdx].options.splice(optIdx, 1);
        setCategoryQuestions({
            ...categoryQuestions,
            [catId]: updatedQs
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        const payload = {
            title,
            type_of_course: typeOfCourse,
            status,
            category_questions: categoryQuestions
        };

        try {
            if (isEditMode) {
                await feedbackFormService.update(id, payload);
                toast.success("Feedback form updated successfully");
            } else {
                await feedbackFormService.create(payload);
                toast.success("Feedback form created successfully");
            }
            navigate("/feedback/forms");
        } catch (error) {
            console.error("Error saving form:", error);
            toast.error("Failed to save feedback form");
        }
    };

    if (loading) return <LoadingSpinner />;

    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <Meta title={isEditMode ? "Edit Feedback Form" : "Create Feedback Form"} />

            <div className="w-full px-4 pb-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pt-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/feedback/forms")}
                            className="p-2 rounded-xl bg-white/50 border border-slate-200/60 text-slate-500 hover:text-slate-700 hover:bg-white/80 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                {isEditMode ? "Edit Feedback Form" : "Create Feedback Form"}
                            </h1>
                            <p className="text-slate-500 text-sm">
                                Define structure and questions
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Form
                    </button>
                </div>

                {/* Main Form Area */}
                <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-6 w-full" style={{ overflow: 'visible', position: 'relative', zIndex: 20 }}>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800">
                            Form Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6" style={{ overflow: 'visible' }}>
                        {/* 1. Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Form Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="e.g. Course Feedback 2024"
                            />
                        </div>

                        {/* 2. Categories (Multi-select) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Categories <span className="text-red-500">*</span>
                            </label>
                            <MultiSelect
                                options={categoryOptions}
                                selectedValues={selectedCategories}
                                onChange={handleCategoryChange}
                                placeholder="Select Categories (Objectives, Design, etc.)"
                            />
                            <p className="text-xs text-slate-400 mt-1">
                                Selected categories will appear below for question addition.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 3. Type of Course */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Type Of Course
                                </label>
                                <select
                                    value={typeOfCourse}
                                    onChange={(e) => setTypeOfCourse(e.target.value)}
                                    className="w-full px-4 py-2 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                >
                                    <option value="All">All Courses</option>
                                    <option value="STCW">STCW</option>
                                    <option value="Offshore">Offshore</option>
                                    <option value="Value Added">Value Added</option>
                                </select>
                            </div>

                            {/* 4. Status */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Status
                                </label>
                                <div className="flex items-center gap-4 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={status === 1}
                                            onChange={() => setStatus(1)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-sm text-slate-700">Active</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={status === 0}
                                            onChange={() => setStatus(0)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-sm text-slate-700">Inactive</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Categories Sections - Always show ALL categories */}
                <div className="space-y-6">
                    {categories.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                            No categories available.
                        </div>
                    ) : (
                        categories.map(category => {
                            const catId = category.id;
                            const questions = categoryQuestions[catId] || [];

                            return (
                                <Card key={catId} className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg overflow-visible">
                                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                                        <CardTitle className="text-lg font-bold text-slate-800">
                                            {category.name}
                                        </CardTitle>
                                        <button
                                            onClick={() => handleAddQuestion(catId)}
                                            className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" /> Add Question
                                        </button>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        {questions.length === 0 && (
                                            <div className="text-center py-4 text-slate-400 text-sm italic">
                                                No questions added yet.
                                            </div>
                                        )}
                                        {questions.map((q, qIdx) => (
                                            <div key={qIdx} className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                                                        {/* Question Type */}
                                                        <div className="md:col-span-3">
                                                            <label className="block text-xs font-semibold text-slate-500 mb-1">
                                                                Format
                                                            </label>
                                                            <select
                                                                value={q.type}
                                                                onChange={(e) => handleQuestionChange(catId, qIdx, "type", e.target.value)}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                                                            >
                                                                <option value="rating">Ratings</option>
                                                                <option value="text">Input Text</option>
                                                                <option value="dropdown">Dropdown</option>
                                                                <option value="radio">Radio Button</option>
                                                            </select>
                                                        </div>

                                                        {/* Question Text */}
                                                        <div className="md:col-span-9">
                                                            <label className="block text-xs font-semibold text-slate-500 mb-1">
                                                                Question
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={q.question}
                                                                onChange={(e) => handleQuestionChange(catId, qIdx, "question", e.target.value)}
                                                                placeholder="Enter your question here..."
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                                                            />
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRemoveQuestion(catId, qIdx)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-6"
                                                        title="Remove Question"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Options for Radio/Dropdown */}
                                                {(q.type === 'radio' || q.type === 'dropdown') && (
                                                    <div className="mt-4 pl-4 border-l-2 border-slate-200 ml-1 space-y-2">
                                                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                                                            Options
                                                        </label>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {q.options && q.options.map((opt, optIdx) => (
                                                                <div key={optIdx} className="flex gap-2 items-center">
                                                                    <input
                                                                        type="text"
                                                                        value={opt}
                                                                        onChange={(e) => handleOptionChange(catId, qIdx, optIdx, e.target.value)}
                                                                        placeholder={`Option ${optIdx + 1}`}
                                                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleRemoveOption(catId, qIdx, optIdx)}
                                                                        className="text-slate-400 hover:text-red-500"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={() => handleAddOption(catId, qIdx)}
                                                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"
                                                        >
                                                            <Plus className="w-3 h-3" /> Add Option
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackFormCreate;
