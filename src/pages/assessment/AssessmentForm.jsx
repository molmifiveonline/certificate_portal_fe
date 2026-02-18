import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../components/common/Meta";
import { ArrowLeft, Save, Check } from "lucide-react";

import { useNavigate, useParams, Link } from "react-router-dom";
import assessmentService from "../../services/assessmentService";
import { toast } from "sonner";
import { ASSESSMENT_TYPES, QUESTION_COUNTS, QUESTION_CHOICES } from "../../lib/constants";

const AssessmentForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        title: "",
        course_id: "",
        type_of_test: "3",
        candidate_ids: "",
        num_of_questions: "10",
        questions_choice: "auto",
        question_ids: "",
    });

    const [courses, setCourses] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(false);


    const loadCourses = useCallback(async (typeOfTest) => {
        setLoadingCourses(true);
        try {
            const response = await assessmentService.getActiveCourses(typeOfTest);
            setCourses(response.data || []);
        } catch (error) {
            console.error("Failed to load courses:", error);
        } finally {
            setLoadingCourses(false);
        }
    }, []);


    const loadCandidates = useCallback(async (courseId) => {
        if (!courseId) {
            setCandidates([]);
            return;
        }
        setLoadingCandidates(true);
        try {
            const response = await assessmentService.getCandidatesByCourse(courseId);
            setCandidates(response.data || []);
        } catch (error) {
            console.error("Failed to load candidates:", error);
        } finally {
            setLoadingCandidates(false);
        }
    }, []);


    const loadQuestions = useCallback(async (courseId, typeOfTest) => {
        if (!courseId) {
            setQuestions([]);
            return;
        }
        setLoadingQuestions(true);
        try {
            const response = await assessmentService.getQuestionsByCourse(courseId, typeOfTest);
            setQuestions(response.data || []);
        } catch (error) {
            console.error("Failed to load questions:", error);
        } finally {
            setLoadingQuestions(false);
        }
    }, []);


    useEffect(() => {
        loadCourses(formData.type_of_test);
    }, []);


    useEffect(() => {
        if (isEdit) {
            const loadAssessment = async () => {
                try {
                    const response = await assessmentService.getAssessmentById(id);
                    const data = response.data;
                    setFormData({
                        title: data.title,
                        course_id: data.course_id,
                        type_of_test: data.type_of_test,
                        candidate_ids: data.candidate_ids || "",
                        num_of_questions: String(data.num_of_questions),
                        questions_choice: data.questions_choice || "auto",
                        question_ids: data.question_ids || "",
                    });


                    await loadCourses(data.type_of_test);
                    if (data.course_id) {
                        await loadCandidates(data.course_id);
                        await loadQuestions(data.course_id, data.type_of_test);
                    }


                    if (data.candidate_ids) {
                        setSelectedCandidates(data.candidate_ids.split(",").filter(Boolean));
                    }


                    if (data.question_ids) {
                        setSelectedQuestions(data.question_ids.split(",").filter(Boolean));
                    }
                } catch (error) {
                    toast.error("Failed to load assessment data.");
                    navigate("/assessment/assessments");
                }
            };
            loadAssessment();
        }
    }, [id, isEdit]);

    const handleTypeOfTestChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            type_of_test: value,
            course_id: "",
            candidate_ids: "",
            question_ids: "",
        }));
        setSelectedCandidates([]);
        setSelectedQuestions([]);
        setCandidates([]);
        setQuestions([]);
        loadCourses(value);
    };

    const handleCourseChange = (courseId) => {
        setFormData((prev) => ({
            ...prev,
            course_id: courseId,
            candidate_ids: "",
            question_ids: "",
        }));
        setSelectedCandidates([]);
        setSelectedQuestions([]);
        if (courseId) {
            loadCandidates(courseId);
            loadQuestions(courseId, formData.type_of_test);
        } else {
            setCandidates([]);
            setQuestions([]);
        }
    };

    const handleCandidateToggle = (candidateId) => {
        setSelectedCandidates((prev) => {
            if (prev.includes(candidateId)) {
                return prev.filter((id) => id !== candidateId);
            }
            return [...prev, candidateId];
        });
    };

    const handleQuestionToggle = (questionId) => {
        setSelectedQuestions((prev) => {
            if (prev.includes(questionId)) {
                return prev.filter((id) => id !== questionId);
            }
            return [...prev, questionId];
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Please enter a title.");
            return;
        }
        if (!formData.course_id) {
            toast.error("Please select a course.");
            return;
        }

        if (formData.questions_choice === "manual") {
            const numQ = parseInt(formData.num_of_questions);
            if (selectedQuestions.length < numQ) {
                toast.error(`Please select at least ${numQ} questions.`);
                return;
            }
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                candidate_ids: formData.type_of_test === "3"
                    ? selectedCandidates.join(",")
                    : "",
                question_ids: formData.questions_choice === "manual"
                    ? selectedQuestions.join(",")
                    : "",
            };

            if (isEdit) {
                await assessmentService.updateAssessment(id, payload);
                toast.success("Assessment updated successfully.");
            } else {
                await assessmentService.createAssessment(payload);
                toast.success("Assessment created successfully.");
            }
            navigate("/assessment/assessments");
        } catch (error) {
            toast.error(isEdit ? "Failed to update assessment." : "Failed to create assessment.");
        } finally {
            setLoading(false);
        }
    };


    const InputField = ({ label, value, onChange, placeholder, required }) => (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm"
                required={required}
            />
        </div>
    );

    const SelectField = ({ label, value, onChange, options, loading, placeholder, required }) => (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                value={value}
                onChange={onChange}
                className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm"
                required={required}
            >
                <option value="">{placeholder}</option>
                {loading ? (
                    <option disabled>Loading...</option>
                ) : (
                    options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))
                )}
            </select>
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto w-full bg-slate-50">
            <Meta title={isEdit ? "Edit Assessment" : "Add Assessment"} />

            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">{isEdit ? 'Edit Assessment' : 'New Assessment'}</h1>
                        <p className="text-sm text-slate-500">
                            {isEdit ? 'Update assessment details and configuration' : 'Configure and publish a new assessment'}
                        </p>
                    </div>
                    <Link
                        to="/assessment/assessments"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to List
                    </Link>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 max-w-[1600px] mx-auto space-y-8">

                {/* 1. Basic Details Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                        Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Assessment Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Final Certification Exam 2024"
                            required
                        />
                        <SelectField
                            label="Course"
                            value={formData.course_id}
                            onChange={(e) => handleCourseChange(e.target.value)}
                            placeholder="Select a course..."
                            loading={loadingCourses}
                            required
                            options={courses.map(c => ({ value: c.id, label: `${c.course_name} (${c.course_code})` }))}
                        />
                    </div>
                </div>

                {/* 2. Configuration Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
                        Configuration
                    </h3>

                    <div className="space-y-8">
                        {/* Type of Test Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Assessment Type <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {ASSESSMENT_TYPES.map((opt) => (
                                    <div
                                        key={opt.value}
                                        onClick={() => handleTypeOfTestChange(opt.value)}
                                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md ${formData.type_of_test === opt.value
                                            ? 'border-blue-600 bg-blue-50/50'
                                            : 'border-slate-100 bg-slate-50/50 hover:border-blue-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.type_of_test === opt.value ? 'border-blue-600' : 'border-slate-300'
                                                }`}>
                                                {formData.type_of_test === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                                            </div>
                                            <span className={`font-semibold ${formData.type_of_test === opt.value ? 'text-blue-700' : 'text-slate-600'}`}>
                                                {opt.label}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Number of Questions */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Number of Questions
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {QUESTION_COUNTS.map((val) => (
                                    <div
                                        key={val}
                                        onClick={() => setFormData({ ...formData, num_of_questions: val })}
                                        className={`cursor-pointer px-4 py-2 rounded-lg border transition-all ${formData.num_of_questions === val
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className="font-medium">{val} Questions</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Questions Choice (Auto vs Manual) */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Question Selection Method
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {QUESTION_CHOICES.map((opt) => (
                                    <div
                                        key={opt.value}
                                        onClick={() => setFormData({ ...formData, questions_choice: opt.value })}
                                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all flex items-center gap-3 ${formData.questions_choice === opt.value
                                            ? 'border-indigo-600 bg-indigo-50/50'
                                            : 'border-slate-100 bg-slate-50/50 hover:border-indigo-200'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.questions_choice === opt.value ? 'border-indigo-600' : 'border-slate-300'
                                            }`}>
                                            {formData.questions_choice === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                                        </div>
                                        <div>
                                            <span className={`block font-semibold ${formData.questions_choice === opt.value ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                {opt.label}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {opt.value === 'auto' ? 'System randomly selects questions' : 'Manually pick specific questions'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Selection Card (Candidates & Manual Questions) */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Candidates Selection */}
                    {formData.type_of_test === "3" && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                                Select Candidates
                                <span className="ml-auto text-xs font-normal bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                    {selectedCandidates.length} Selected
                                </span>
                            </h3>

                            <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/50 p-2 space-y-1">
                                {loadingCandidates ? (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">Loading candidates...</div>
                                ) : candidates.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                                        <p>{formData.course_id ? "No candidates found" : "Select a course first"}</p>
                                    </div>
                                ) : (
                                    candidates.map((c) => (
                                        <div
                                            key={c.id}
                                            onClick={() => handleCandidateToggle(c.id)}
                                            className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all border ${selectedCandidates.includes(c.id)
                                                ? 'bg-blue-50 border-blue-200 shadow-sm'
                                                : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCandidates.includes(c.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                                                }`}>
                                                {selectedCandidates.includes(c.id) && <Check size={12} className="text-white" />}
                                            </div>
                                            <span className={`text-sm ${selectedCandidates.includes(c.id) ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>
                                                {c.candidate_name}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Manual Question Selection */}
                    {formData.questions_choice === "manual" && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px] xl:col-span-1 col-span-1">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                                Select Questions
                                <span className={`ml-auto text-xs font-normal px-2 py-1 rounded-full ${selectedQuestions.length >= parseInt(formData.num_of_questions)
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {selectedQuestions.length} / {formData.num_of_questions} Selected
                                </span>
                            </h3>

                            <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/50 p-2 space-y-1">
                                {loadingQuestions ? (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">Loading questions...</div>
                                ) : questions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                                        <p>{formData.course_id ? "No questions found" : "Select a course first"}</p>
                                    </div>
                                ) : (
                                    questions.map((q) => (
                                        <div
                                            key={q.id}
                                            onClick={() => handleQuestionToggle(q.id)}
                                            className={`p-3 rounded-lg cursor-pointer flex items-start gap-3 transition-all border ${selectedQuestions.includes(q.id)
                                                ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                                : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors mt-0.5 shrink-0 ${selectedQuestions.includes(q.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'
                                                }`}>
                                                {selectedQuestions.includes(q.id) && <Check size={12} className="text-white" />}
                                            </div>
                                            <span className={`text-sm ${selectedQuestions.includes(q.id) ? 'text-indigo-700 font-medium' : 'text-slate-600'}`}>
                                                {q.question}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 -mx-8 -mb-8 flex justify-end shadow-lg">
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/assessment/assessments')}
                            className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <Save size={18} />
                            <span>{loading ? "Saving..." : isEdit ? "Update Assessment" : "Save Assessment"}</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AssessmentForm;
