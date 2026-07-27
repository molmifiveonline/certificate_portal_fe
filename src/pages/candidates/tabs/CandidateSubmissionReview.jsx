import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Download, Check, X } from "lucide-react";
import assessmentService from "../../../services/assessmentService";
import { toast } from "sonner";

const CandidateSubmissionReview = ({ resultId, onClose }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await assessmentService.getSubmissionDetail(resultId);
                if (response.success) {
                    setData(response.data);
                } else {
                    toast.error("Failed to load review details");
                    onClose();
                }
            } catch (error) {
                console.error("Error fetching submission details:", error);
                toast.error("An error occurred while loading details");
                onClose();
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [resultId, onClose]);

    const handleDownloadPdf = async () => {
        if (!data) return;
        try {
            setIsDownloading(true);
            const response = await assessmentService.downloadSubmissionPdf(resultId);
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
            setTimeout(() => window.URL.revokeObjectURL(url), 10000);
        } catch (error) {
            console.error("PDF download error:", error);
            toast.error("Failed to download PDF");
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) return null;

    const { result, answers } = data;
    const percentage = result.total_questions > 0 
        ? Math.round((result.correct_answers / result.total_questions) * 100) 
        : 0;
    const isPassed = percentage >= 60;
    const canDownload = result.type_of_test === 2 || result.type_of_test === "2";

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
            {/* Header Block */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onClose}
                        className="rounded-xl h-10 w-10 text-slate-500 hover:text-slate-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Review Results</h3>
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{result.assessment_title || 'Assessment'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {canDownload && (
                        <Button 
                            variant="outline" 
                            onClick={handleDownloadPdf}
                            disabled={isDownloading}
                            className="rounded-xl flex items-center gap-2 border-slate-200 hover:bg-slate-50"
                        >
                            <Download className="h-4 w-4" />
                            {isDownloading ? "Downloading..." : "PDF Result"}
                        </Button>
                    )}
                    <Badge className={isPassed ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"}>
                        {isPassed ? "PASSED" : "FAILED"}
                    </Badge>
                </div>
            </div>

            {/* Score Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/80 backdrop-blur-xl border-slate-100 shadow-sm">
                    <CardContent className="p-6 text-center">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Final Score</div>
                        <div className={`text-4xl font-black ${isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {percentage}%
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-xl border-slate-100 shadow-sm">
                    <CardContent className="p-6 text-center">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Correct Answers</div>
                        <div className="text-4xl font-black text-slate-700">
                            {result.correct_answers} / {result.total_questions}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-xl border-slate-100 shadow-sm">
                    <CardContent className="p-6 text-center">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Result Status</div>
                        <div className={`text-2xl font-bold flex items-center justify-center gap-2 h-10 ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isPassed ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                            {isPassed ? "Successful" : "Needs Re-Test"}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Questions List */}
            <Card className="bg-white/80 backdrop-blur-xl border-slate-100 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 p-6">
                    <CardTitle className="text-lg font-bold text-slate-800">Question & Answer Sheet</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-8 divide-y divide-slate-100">
                    {answers.map((ans, index) => {
                        const options = [
                            { key: "option_a", label: "A", text: ans.option_a, img: ans.opt_img_a },
                            { key: "option_b", label: "B", text: ans.option_b, img: ans.opt_img_b },
                            { key: "option_c", label: "C", text: ans.option_c, img: ans.opt_img_c },
                            { key: "option_d", label: "D", text: ans.option_d, img: ans.opt_img_d }
                        ];

                        return (
                            <div key={ans.id} className={`pt-8 first:pt-0 space-y-4`}>
                                {/* Question Text */}
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 flex items-center justify-center bg-slate-100 text-slate-700 font-bold rounded-xl h-8 w-8 text-sm">
                                        Q{index + 1}
                                    </span>
                                    <h4 className="font-semibold text-slate-800 text-base leading-relaxed pt-1">
                                        {ans.question}
                                    </h4>
                                </div>

                                {/* Optional Question Image */}
                                {ans.image && (
                                    <div className="ml-11">
                                        <img 
                                            src={ans.image} 
                                            alt={`Question ${index + 1}`} 
                                            className="max-h-64 object-contain rounded-2xl border border-slate-150"
                                        />
                                    </div>
                                )}

                                {/* Options List */}
                                <div className="ml-11 space-y-3">
                                    {options.map((opt) => {
                                        if (!opt.text) return null;

                                        const isSelected = ans.selected_option === opt.key || ans.selected_option === opt.key.replace("option_", "opt_");
                                        const isCorrect = ans.correct_option === opt.key || ans.correct_option === opt.key.replace("option_", "opt_");

                                        let optionBg = "bg-white border-slate-100";
                                        let optionText = "text-slate-700";
                                        let labelNode = null;

                                        if (isCorrect) {
                                            optionBg = "bg-emerald-50 border-emerald-200 shadow-sm shadow-emerald-50";
                                            optionText = "text-emerald-900 font-medium";
                                            if (isSelected) {
                                                labelNode = (
                                                    <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-100/60 px-2 py-1 rounded-lg">
                                                        <Check className="h-3.5 w-3.5" /> Correct choice
                                                    </span>
                                                );
                                            } else {
                                                labelNode = (
                                                    <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-100/60 px-2 py-1 rounded-lg">
                                                        Correct Answer
                                                    </span>
                                                );
                                            }
                                        } else if (isSelected && !isCorrect) {
                                            optionBg = "bg-rose-50 border-rose-200";
                                            optionText = "text-rose-900 font-medium";
                                            labelNode = (
                                                <span className="ml-auto flex items-center gap-1.5 text-xs text-rose-600 font-semibold bg-rose-100/60 px-2 py-1 rounded-lg">
                                                    <X className="h-3.5 w-3.5" /> Your choice
                                                </span>
                                            );
                                        }

                                        return (
                                            <div 
                                                key={opt.key}
                                                className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 ${optionBg}`}
                                            >
                                                <span className={`text-base ${optionText} flex items-center gap-3 w-full`}>
                                                    {opt.img && (
                                                        <img 
                                                            src={opt.img} 
                                                            alt={`Option ${opt.label}`} 
                                                            className="max-h-20 object-contain rounded-lg border border-slate-150 mr-2"
                                                        />
                                                    )}
                                                    <span>{opt.text}</span>
                                                    {labelNode}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
                <CardFooter className="bg-slate-50/50 p-6 flex justify-center border-t border-slate-100">
                    <Button className="px-10 h-11 text-base font-bold rounded-xl" onClick={onClose}>
                        Close Review
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default CandidateSubmissionReview;
