import React, { useState, useEffect, useCallback } from 'react';
import { getErrorMessage } from '../../../lib/utils/errorUtils';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { CheckCircle2, Send, Star, AlertCircle } from "lucide-react";
import api from '../../../lib/api';
import { toast } from "sonner";
import { formatDate } from '../../../lib/utils/dateUtils';

const normalizeQuestionOptions = (question) => {
    if (!Array.isArray(question.options)) return [];

    return question.options.map((option, index) => {
        if (typeof option === "string") {
            return {
                id: null,
                option_text: option,
                value: option,
                key: `${question.id}-${index}-${option}`,
            };
        }

        const optionText = option.option_text || option.label || option.value || "";
        return {
            id: option.id || null,
            option_text: optionText,
            value: optionText,
            key: option.id || `${question.id}-${index}-${optionText}`,
        };
    });
};

const normalizeFeedbackCategories = (form) => {
    if (!form) return [];

    if (Array.isArray(form.categories)) {
        return form.categories.map((category) => ({
            id: category.id,
            category_name: category.category_name || category.name,
            questions: (category.questions || []).map((question) => ({
                id: question.id,
                question: question.question || question.question_text || "",
                type: String(question.type || question.question_type || "text").toLowerCase(),
                options: normalizeQuestionOptions(question),
            })),
        }));
    }

    return Object.entries(form.questions || {}).map(([categoryId, category]) => ({
        id: categoryId,
        category_name: category.category_name || category.name,
        questions: (category.questions || []).map((question) => ({
            id: question.id,
            question: question.question || question.question_text || "",
            type: String(question.type || question.question_type || "text").toLowerCase(),
            options: normalizeQuestionOptions(question),
        })),
    }));
};

const CandidateFeedbackTab = ({ courseId }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formValues, setFormValues] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const fetchStatus = useCallback(async () => {
        try {
            const response = await api.get(`/feedback-answers/status/${courseId}`);
            setStatus(response.data);
            
            // Initialize form values
            if (response.data.form) {
                const initial = {};
                normalizeFeedbackCategories(response.data.form).forEach(cat => {
                    cat.questions.forEach(q => {
                        initial[q.id] = {
                            question_id: q.id,
                            category_id: cat.id,
                            feedback_id: response.data.form.id,
                            answer: '',
                            option_id: null,
                            option_text: ''
                        };
                    });
                });
                setFormValues(initial);
            } else {
                setFormValues({});
            }
        } catch (error) {
            console.error("Error fetching feedback status:", error);
            toast.error(getErrorMessage(error, "Failed to load feedback form"));
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const handleRatingChange = (qId, option) => {
        const answer = option.value || option.option_text || "";
        setFormValues(prev => ({
            ...prev,
            [qId]: {
                ...prev[qId],
                option_id: option.id || null,
                option_text: option.option_text || answer,
                answer
            }
        }));
    };

    const handleTextChange = (qId, val) => {
        setFormValues(prev => ({
            ...prev,
            [qId]: {
                ...prev[qId],
                answer: val
            }
        }));
    };

    const handleSubmit = async () => {
        // Validation: simple check if all questions are answered
        const unanswered = Object.values(formValues).some(v => !v.answer);
        if (unanswered) {
            toast.warning("Please answer all questions before submitting.");
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/feedback-answers/candidate-submit', {
                active_course_id: courseId,
                answers: Object.values(formValues)
            });
            toast.success("Feedback submitted successfully!");
            fetchStatus();
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast.error(getErrorMessage(error, "Failed to submit feedback"));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-10 text-slate-400">Loading feedback form...</div>;

    const feedbackCategories = normalizeFeedbackCategories(status?.form);

    if (status?.hasSubmitted) {
        return (
            <Card className="max-w-2xl mx-auto border-emerald-100 bg-emerald-50/30">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-emerald-100 p-4 rounded-full mb-6 text-emerald-600">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
                    <p className="text-slate-600 mb-8 max-w-sm">
                        You have already submitted your feedback for this course on 
                        <span className="font-bold text-slate-900"> {formatDate(status.submittedDate)}</span>.
                    </p>
                    <Badge variant="outline" className="bg-white text-emerald-600 border-emerald-200 px-4 py-1">
                        Feedback Recorded
                    </Badge>
                </CardContent>
            </Card>
        );
    }

    if (!status?.form) {
        return (
            <Card className="max-w-2xl mx-auto border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <AlertCircle className="h-10 w-10 mb-4" />
                    <p>{status?.message || "No feedback form assigned to this course mode."}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                    Your Opinion Matters
                </h3>
                <p className="text-slate-500">
                    Your feedback helps us improve the quality of our training programs.
                </p>
            </div>

            {feedbackCategories.map((category) => (
                <Card key={category.id} className="bg-white/80 backdrop-blur-xl border-white/60 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
                        <CardTitle className="text-lg font-bold text-primary tracking-tight">
                            {category.category_name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {category.questions.map((question, idx) => (
                            <div key={question.id} className={`p-8 ${idx !== category.questions.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                <p className="text-slate-700 font-medium mb-6 flex gap-3">
                                    <span className="text-slate-300 font-bold">{idx + 1}.</span>
                                    {question.question}
                                </p>
                                
                                {question.type === 'rating' ? (
                                    <div className="flex flex-wrap gap-3">
                                        {[1, 2, 3, 4, 5].map((rating) => {
                                            const opt = {
                                                id: null,
                                                option_text: String(rating),
                                                value: String(rating),
                                            };
                                            const isSelected = formValues[question.id]?.answer === String(rating);
                                            return (
                                                <button
                                                    key={rating}
                                                    onClick={() => handleRatingChange(question.id, opt)}
                                                    className={`
                                                        px-5 py-3 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2
                                                        ${isSelected 
                                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105' 
                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5'}
                                                    `}
                                                >
                                                    <Star className={`h-4 w-4 ${isSelected ? 'fill-white' : ''}`} />
                                                    {rating}
                                                </button>
                                            )
                                        })}
                                    </div>
                                ) : question.type === 'radio' ? (
                                    <div className="flex flex-wrap gap-3">
                                        {question.options.map((opt) => {
                                            const currentValue = formValues[question.id] || {};
                                            const isSelected = opt.id
                                                ? currentValue.option_id === opt.id
                                                : currentValue.answer === opt.value;
                                            return (
                                                <button
                                                    key={opt.key}
                                                    onClick={() => handleRatingChange(question.id, opt)}
                                                    className={`
                                                        px-5 py-3 rounded-xl border text-sm font-medium transition-all duration-200
                                                        ${isSelected 
                                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105' 
                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5'}
                                                    `}
                                                >
                                                    {opt.option_text}
                                                </button>
                                            )
                                        })}
                                    </div>
                                ) : question.type === 'dropdown' ? (
                                    <select
                                        className="w-full p-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none text-slate-600 bg-white"
                                        value={formValues[question.id]?.answer || ''}
                                        onChange={(e) => {
                                            const selectedOption = question.options.find(
                                                (opt) => opt.value === e.target.value,
                                            );
                                            handleRatingChange(question.id, selectedOption || {
                                                id: null,
                                                option_text: e.target.value,
                                                value: e.target.value,
                                            });
                                        }}
                                    >
                                        <option value="">Select an answer</option>
                                        {question.options.map((opt) => (
                                            <option key={opt.key} value={opt.value}>
                                                {opt.option_text}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <textarea
                                        className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none text-slate-600"
                                        placeholder="Type your feedback here..."
                                        value={formValues[question.id]?.answer || ''}
                                        onChange={(e) => handleTextChange(question.id, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}

            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-6">
                <Button 
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-lg font-bold shadow-2xl shadow-primary/30 rounded-2xl group"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Submitting Feedback...
                        </span>
                    ) : (
                        <span className="flex items-center">
                            <Send className="h-5 w-5 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            Submit Comprehensive Feedback
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default CandidateFeedbackTab;


