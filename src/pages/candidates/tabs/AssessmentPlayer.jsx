import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { RadioGroupItem } from "../../../components/ui/RadioGroup";
import { Label } from "../../../components/ui/Label";
import { Timer, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Send } from "lucide-react";
import api from '../../../lib/api';
import { toast } from "sonner";

const AssessmentPlayer = ({ assessmentId, courseId, onClose }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await api.get(`/assessment/${assessmentId}/play-questions`);
                setQuestions(response.data.data || []);
            } catch (error) {
                console.error("Error fetching questions:", error);
                toast.error("Failed to load questions");
                onClose();
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [assessmentId, onClose]);

    const handleOptionSelect = (qId, option) => {
        setAnswers(prev => ({
            ...prev,
            [qId]: option
        }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (Object.keys(answers).length < questions.length) {
            toast.warning(`Please answer all questions. You have answered ${Object.keys(answers).length} of ${questions.length}.`);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                assessment_id: assessmentId,
                course_id: courseId,
                answers: questions.map(q => ({
                    question_id: q.id,
                    selected_option: answers[q.id] || null
                }))
            };

            const response = await api.post('/assessment/submit', payload);

            setResult(response.data.data);
            toast.success("Assessment submitted successfully!");
        } catch (error) {
            console.error("Error submitting assessment:", error);
            toast.error("Failed to submit assessment");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-400 font-medium">Preparing questions...</div>;

    if (result) {
        const isPassed = result.score >= 60;
        return (
            <div className="max-w-2xl mx-auto py-12 animate-in zoom-in-95 duration-300">
                <Card className={`overflow-hidden border-2 ${isPassed ? 'border-emerald-100' : 'border-rose-100'}`}>
                    <div className={`h-2 w-full ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <CardHeader className="text-center pb-2">
                        <div className={`mx-auto p-4 rounded-full w-fit mb-4 ${isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {isPassed ? <CheckCircle2 className="h-12 w-12" /> : <AlertCircle className="h-12 w-12" />}
                        </div>
                        <CardTitle className="text-3xl font-bold">Assessment Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 py-8">
                        <div className="flex justify-center gap-12">
                            <div className="text-center">
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Final Score</div>
                                <div className={`text-5xl font-black ${isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {result.score}%
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Accuracy</div>
                                <div className="text-5xl font-black text-slate-700">
                                    {result.correct_answers}/{result.total_questions}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                            <p className="text-slate-600 leading-relaxed font-medium">
                                {isPassed 
                                    ? "Excellent! You have successfully passed the assessment and met the certification requirements." 
                                    : "You didn't reach the required 60% pass mark. Please review the course materials and try again."}
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 p-6 flex justify-center">
                        <Button className="px-10 h-12 text-lg font-bold rounded-xl" onClick={onClose}>
                            Close & Continue
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Player Header */}
            <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-xl text-primary font-bold">
                        {currentIndex + 1} / {questions.length}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Knowledge Assessment</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Keep going!</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2">
                        <Timer className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-600">Untimed</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="rounded-lg text-slate-400 hover:text-rose-500">
                        Exit
                    </Button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                    className="bg-primary h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" 
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
            </div>

            {/* Question Card */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/60 shadow-xl rounded-3xl overflow-hidden min-h-[400px] flex flex-col">
                <CardContent className="p-8 md:p-12 flex-grow">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-10">
                        {currentQuestion.question}
                    </h2>

                    <div className="space-y-4">
                        {['option_a', 'option_b', 'option_c', 'option_d'].map((optKey, idx) => {
                            const optValue = currentQuestion[optKey];
                            if (!optValue) return null;
                            const isSelected = answers[currentQuestion.id] === optKey;

                            return (
                                <div key={idx} className="relative group">
                                    <Label
                                        htmlFor={`${currentQuestion.id}-${idx}`}
                                        className={`
                                            flex items-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200
                                            ${isSelected 
                                                ? 'bg-primary/5 border-primary shadow-md shadow-primary/10' 
                                                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'}
                                        `}
                                    >
                                        <RadioGroupItem 
                                            value={optKey} 
                                            id={`${currentQuestion.id}-${idx}`} 
                                            checked={answers[currentQuestion.id] === optKey}
                                            onChange={() => handleOptionSelect(currentQuestion.id, optKey)}
                                            name={`question-${currentQuestion.id}`}
                                            className="mr-4 border-slate-300 text-primary" 
                                        />
                                        <span className={`text-base font-medium ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
                                            {optValue}
                                        </span>
                                    </Label>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
                
                <CardFooter className="bg-slate-50/50 p-8 flex justify-between border-t border-slate-100">
                    <Button 
                        variant="ghost" 
                        onClick={handlePrev} 
                        disabled={currentIndex === 0}
                        className="rounded-xl h-12 px-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                    </Button>
                    
                    {currentIndex === questions.length - 1 ? (
                        <Button 
                            className="bg-primary hover:bg-primary/90 rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? "Submitting..." : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit Results
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button 
                            className="bg-slate-900 hover:bg-slate-800 rounded-xl h-12 px-8 font-bold"
                            onClick={handleNext}
                        >
                            Next Question <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default AssessmentPlayer;


