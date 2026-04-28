import React, { useState, useEffect } from 'react';
import { getErrorMessage } from '../../../lib/utils/errorUtils';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { ClipboardList, Play, CheckCircle2, History, AlertCircle } from "lucide-react";
import api from '../../../lib/api';
import { toast } from "sonner";
import AssessmentPlayer from './AssessmentPlayer';
import { formatDate } from '../../../lib/utils/dateUtils';

const CandidateAssessmentTab = ({ courseId }) => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeAssessment, setActiveAssessment] = useState(null);

    useEffect(() => {
        fetchAssessments();
    }, [courseId]);

    const fetchAssessments = async () => {
        try {
            const response = await api.get(`/assessment/course/${courseId}/candidate-list`);
            setAssessments(response.data.data || []);
        } catch (error) {
            console.error("Error fetching assessments:", error);
            toast.error(getErrorMessage(error, "Failed to load assessments"));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10 text-slate-400">Loading assessments...</div>;

    if (activeAssessment) {
        return (
            <AssessmentPlayer 
                assessmentId={activeAssessment.id} 
                courseId={courseId}
                onClose={() => {
                    setActiveAssessment(null);
                    fetchAssessments();
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                    <ClipboardList className="h-6 w-6 mr-2 text-primary" />
                    Course Assessments
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assessments.length === 0 ? (
                    <Card className="col-span-full border-dashed p-10 text-center">
                        <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No assessments scheduled for this course yet.</p>
                    </Card>
                ) : (
                    assessments.map((assessment) => {
                        const score = assessment.latest_score;
                        const attempts = assessment.attempts || 0;
                        const isPassed = score !== null && score >= 60;
                        const canReTest = attempts < assessment.max_attempts && (!isPassed);

                        return (
                            <Card key={assessment.id} className="bg-white/80 backdrop-blur-xl border-white/60 shadow-sm overflow-hidden group">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                                            {assessment.type_of_test}
                                        </Badge>
                                        {score !== null && (
                                            <Badge className={isPassed ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"}>
                                                {isPassed ? "PASSED" : "RE-TEST REQUIRED"}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="mt-2 text-lg group-hover:text-primary transition-colors">
                                        {assessment.type_of_test}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                            <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Score</div>
                                            <div className="text-xl font-bold text-slate-700">
                                                {score !== null ? `${score}%` : '--'}
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                            <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Attempts</div>
                                            <div className="text-xl font-bold text-slate-700">
                                                {attempts} / {assessment.max_attempts}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center text-sm text-slate-500">
                                        <History className="h-4 w-4 mr-2" />
                                        <span>Latest Attempt: {assessment.latest_attempt_date ? formatDate(assessment.latest_attempt_date) : 'N/A'}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50/50 border-t border-slate-100 flex gap-2">
                                    {isPassed ? (
                                        <div className="w-full flex items-center justify-center p-2 text-emerald-600 font-medium">
                                            <CheckCircle2 className="h-5 w-5 mr-2" />
                                            Assessment Completed
                                        </div>
                                    ) : attempts >= assessment.max_attempts ? (
                                        <div className="w-full flex items-center justify-center p-2 text-rose-500 font-medium">
                                            <AlertCircle className="h-5 w-5 mr-2" />
                                            Max Attempts Reached
                                        </div>
                                    ) : (
                                        <Button 
                                            className="w-full bg-primary hover:bg-primary/90"
                                            onClick={() => setActiveAssessment(assessment)}
                                        >
                                            <Play className="h-4 w-4 mr-2" />
                                            {attempts === 0 ? "Start Assessment" : "Take Re-Test"}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CandidateAssessmentTab;


