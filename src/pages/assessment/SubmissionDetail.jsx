import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import assessmentService from "../../services/assessmentService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Meta from "../../components/common/Meta";
import {
    ArrowLeft,
    User,
    Mail,
    CheckCircle,
    XCircle,
    ClipboardCheck,
    Award,
    Hash,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { formatDate } from "../../lib/utils/dateUtils";
import BackButton from '../../components/common/BackButton';

const SubmissionDetail = () => {
    const { resultId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const response =
                    await assessmentService.getSubmissionDetail(resultId);
                setData(response.data);
            } catch (err) {
                setError("Failed to fetch submission details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [resultId]);

    if (loading) return <LoadingSpinner />;
    if (error)
        return (
            <div className="p-4 text-red-500 bg-red-50 rounded-lg">
                {error}
            </div>
        );
    if (!data)
        return <div className="p-4 text-slate-500">No data found.</div>;

    const { result, answers } = data;

    const backLink = `/assessment/submitted/${result.course_id}`;

    return (
        <div className="flex-1 overflow-y-auto">
            <Meta
                title="Submission Details"
                description="View assessment submission details"
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <BackButton to={backLink} />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                            Submitted Assessment
                        </h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {result.first_name} {result.last_name} -{" "}
                            {result.assessment_title}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Candidate & Score Info Card */}
                <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg h-fit">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                                <User className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-800">
                                Candidate Info
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                        Full Name
                                    </p>
                                    <p className="text-slate-700 font-medium truncate">
                                        {result.first_name} {result.last_name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                        Email
                                    </p>
                                    <p className="text-slate-700 font-medium truncate">
                                        {result.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Score summary card */}
                        <div className="p-4 rounded-xl bg-slate-50 space-y-3 mt-6">
                            <div className="flex items-start gap-3">
                                <Award className="w-4 h-4 text-slate-400 mt-1" />
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Score
                                    </p>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {result.score != null
                                            ? `${result.score}%`
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Correct / Total
                                    </p>
                                    <p className="text-slate-700 font-medium">
                                        {result.correct_answers} /{" "}
                                        {result.total_questions}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Hash className="w-4 h-4 text-slate-400 mt-1" />
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Attempt #
                                    </p>
                                    <p className="text-slate-700 font-medium">
                                        {result.attempt_number}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <ClipboardCheck className="w-4 h-4 text-slate-400 mt-1" />
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Course
                                    </p>
                                    <p className="text-slate-700 font-medium">
                                        {result.course_name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <ClipboardCheck className="w-4 h-4 text-slate-400 mt-1" />
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Submitted On
                                    </p>
                                    <p className="text-slate-700 font-medium">
                                        {result.created_at
                                            ? formatDate(result.created_at)
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Questions & Answers Card */}
                <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg lg:col-span-2">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                                <ClipboardCheck className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-800">
                                Questions & Answers
                            </h3>
                            <span className="ml-auto text-sm text-slate-400">
                                {answers.length} question
                                {answers.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        <div className="space-y-5">
                            {answers.length > 0 ? (
                                answers.map((ans, index) => {
                                    const options = [
                                        {
                                            key: "option_a",
                                            label: "A",
                                            text: ans.option_a,
                                            img: ans.opt_img_a,
                                        },
                                        {
                                            key: "option_b",
                                            label: "B",
                                            text: ans.option_b,
                                            img: ans.opt_img_b,
                                        },
                                        {
                                            key: "option_c",
                                            label: "C",
                                            text: ans.option_c,
                                            img: ans.opt_img_c,
                                        },
                                        {
                                            key: "option_d",
                                            label: "D",
                                            text: ans.option_d,
                                            img: ans.opt_img_d,
                                        },
                                    ];

                                    return (
                                        <div
                                            key={ans.id}
                                            className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm"
                                        >
                                            {/* Question */}
                                            <div className="flex items-start gap-3 mb-4">
                                                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                                                    {index + 1}
                                                </span>
                                                <p className="text-slate-800 font-medium leading-relaxed pt-1">
                                                    {ans.question}
                                                </p>
                                            </div>

                                            {/* Question Image */}
                                            {ans.image && (
                                                <div className="mb-4 ml-11">
                                                    <img
                                                        src={ans.image}
                                                        alt="Question"
                                                        className="max-w-xs rounded-lg border border-slate-200"
                                                    />
                                                </div>
                                            )}

                                            {/* Options */}
                                            <div className="ml-11 space-y-2">
                                                {options.map((opt) => {
                                                    if (!opt.text) return null;

                                                    const isSelected =
                                                        ans.selected_option ===
                                                        opt.key;
                                                    const isCorrect =
                                                        ans.correct_option ===
                                                        opt.key;

                                                    let bgClass =
                                                        "bg-slate-50 border-slate-100";
                                                    let iconEl = null;

                                                    if (isCorrect) {
                                                        bgClass =
                                                            "bg-green-50 border-green-200";
                                                    }
                                                    if (
                                                        isSelected &&
                                                        !isCorrect
                                                    ) {
                                                        bgClass =
                                                            "bg-red-50 border-red-200";
                                                    }

                                                    if (
                                                        isSelected &&
                                                        isCorrect
                                                    ) {
                                                        iconEl = (
                                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                        );
                                                    } else if (
                                                        isSelected &&
                                                        !isCorrect
                                                    ) {
                                                        iconEl = (
                                                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                                        );
                                                    } else if (
                                                        !isSelected &&
                                                        isCorrect
                                                    ) {
                                                        iconEl = (
                                                            <span className="text-xs text-green-600 font-semibold whitespace-nowrap flex-shrink-0">
                                                                Correct Answer
                                                            </span>
                                                        );
                                                    }

                                                    return (
                                                        <div
                                                            key={opt.key}
                                                            className={`flex items-center gap-3 p-3 rounded-xl border ${bgClass} transition-all`}
                                                        >
                                                            <span className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                                                                {opt.label}
                                                            </span>
                                                            <span className="text-slate-700 text-sm flex-1">
                                                                {opt.text}
                                                            </span>
                                                            {iconEl}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
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

export default SubmissionDetail;
