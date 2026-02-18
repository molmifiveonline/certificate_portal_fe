import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import feedbackAnswerService from "../../services/feedbackAnswerService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Meta from "../../components/common/Meta";
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import BackButton from '../../components/common/BackButton';

const SubmittedFeedbackDetails = () => {
    const { candidateId, activeCourseId } = useParams();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const data = await feedbackAnswerService.getSubmissionDetails(
                    candidateId,
                    activeCourseId
                );
                setSubmission(data);
            } catch (err) {
                setError("Failed to fetch submission details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [candidateId, activeCourseId]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>;

    if (!submission) return <div className="p-4 text-slate-500">No data found.</div>;

    const { candidate, answers } = submission;

    return (
        <div className="flex-1 overflow-y-auto">
            <Meta title="Feedback Details" description="View feedback submission details" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <BackButton to="/feedback/submitted" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                            Feedback Details
                        </h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            Submission for {candidate.first_name} {candidate.last_name}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Candidate Info Card */}
                <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg h-fit">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                                <User className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-800">Candidate Info</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Full Name</p>
                                    <p className="text-slate-700 font-medium truncate">
                                        {candidate.first_name} {candidate.last_name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Email</p>
                                    <p className="text-slate-700 font-medium truncate">{candidate.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Mobile</p>
                                    <p className="text-slate-700 font-medium">{candidate.mobile}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 space-y-3 mt-2">
                                <div className="flex items-start gap-3">
                                    <Briefcase className="w-4 h-4 text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Rank</p>
                                        <p className="text-slate-700 font-medium">{candidate.rank}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Manning Company</p>
                                        <p className="text-slate-700 font-medium">{candidate.manning_company}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FileText className="w-4 h-4 text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Active Course ID</p>
                                        <p className="text-slate-700 font-medium break-all">{activeCourseId}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Responses Card */}
                <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg lg:col-span-2">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-800">Feedback Responses</h3>
                        </div>

                        <div className="space-y-4">
                            {answers.length > 0 ? (
                                answers.map((ans, index) => (
                                    <div key={ans.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h4 className="text-slate-800 font-medium leading-relaxed">
                                                {index + 1}. {ans.question}
                                            </h4>
                                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold uppercase whitespace-nowrap">
                                                {ans.type}
                                            </span>
                                        </div>

                                        <div className="pl-4 border-l-2 border-indigo-100">
                                            {ans.feedback_question_option_text ? (
                                                <div className="text-indigo-600 font-medium bg-indigo-50/50 inline-block px-3 py-1.5 rounded-lg">
                                                    {ans.feedback_question_option_text}
                                                </div>
                                            ) : ans.answer ? (
                                                <div
                                                    className="prose prose-sm text-slate-600 max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: ans.answer }}
                                                />
                                            ) : (
                                                <span className="text-slate-400 italic text-sm">No answer provided</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    No answers recorded for this submission.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SubmittedFeedbackDetails;
