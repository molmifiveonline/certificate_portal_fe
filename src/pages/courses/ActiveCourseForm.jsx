import React, { useState, useEffect } from "react";
import Meta from "../../components/common/Meta";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../lib/api";
import activeCourseService from "../../services/activeCourseService";
// import candidateService from '../../services/candidateService'; // Not used directly, using activeCourseService
import {
    Save,
    ArrowLeft,
    BookOpen,
    MapPin,
    Calendar,
    FileText,
    Video,
    Clock,
    Users,
    Link as LinkIcon,
    Check,
    ChevronDown,
    Trash2,
    Mail,
    AlertTriangle,
    AlertCircle,
    RefreshCcw,
} from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils/utils";
import BackButton from "../../components/common/BackButton";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

// Custom MultiSelect Component
const MultiSelectInput = ({ value = [], onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (optionValue) => {
        const newValue = value.includes(optionValue)
            ? value.filter((v) => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    const selectedLabels = options
        .filter((opt) => value.includes(opt.value))
        .map((opt) => opt.label);

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 flex items-center justify-between cursor-pointer focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-slate-600"
            >
                <span className="truncate">
                    {selectedLabels.length > 0
                        ? selectedLabels.join(", ")
                        : "Select trainers..."}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto p-1">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => toggleOption(opt.value)}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm text-slate-600"
                        >
                            <div
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${value.includes(opt.value) ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}
                            >
                                {value.includes(opt.value) && (
                                    <Check size={12} className="text-white" />
                                )}
                            </div>
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ==========================================
// Helper: generate dates between start and end
// ==========================================
const generateDateRange = (start, end) => {
    const dates = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const current = new Date(startDate);
    while (current <= endDate) {
        dates.push(current.toISOString().slice(0, 10));
        current.setDate(current.getDate() + 1);
    }
    return dates;
};

const formatDateDMY = (dateStr) => {
    if (!dateStr) return "-";
    // dateStr can be YYYY-MM-DD or DD-MM-YY based on context
    if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts[0].length === 4) {
            // YYYY-MM-DD
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
    }
    return dateStr;
};

// ==========================================
// ATTENDANCE REMARK MODAL
// ==========================================
const AttendanceRemarkModal = ({
    isOpen,
    onClose,
    onSubmit,
    status,
    candidateName,
    date,
}) => {
    const [reason, setReason] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {status === "holiday" ? "Mark Holiday" : "Mark Absent"}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {candidateName} - {formatDateDMY(date)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
                    >
                        <Trash2 size={20} className="rotate-45" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Reason / Remark <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            autoFocus
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={`Enter reason for ${status}...`}
                            className="w-full h-32 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none text-slate-600"
                        />
                    </div>
                </div>
                <div className="p-6 bg-slate-50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button disabled={!reason.trim()} onClick={() => onSubmit(reason)}>
                        Save Status
                    </Button>
                </div>
            </div>
        </div>
    );
};
// FEEDBACK TAB
// ==========================================
const FeedbackTab = ({ courseId }) => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await activeCourseService.getFeedbackStatus(courseId);
                setCandidates(res.candidates || []);
            } catch (err) {
                toast.error("Failed to load feedback status");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId]);

    if (loading)
        return (
            <div className="flex justify-center py-12 text-slate-500">Loading...</div>
        );

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" /> Feedback Status
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-slate-600">#</th>
                            <th className="px-6 py-3 font-semibold text-slate-600">
                                Employee ID
                            </th>
                            <th className="px-6 py-3 font-semibold text-slate-600">
                                Candidate Name
                            </th>
                            <th className="px-6 py-3 font-semibold text-slate-600 text-center">
                                Feedback Completed
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-slate-400">
                                    No candidates enrolled
                                </td>
                            </tr>
                        ) : (
                            candidates.map((c, i) => (
                                <tr
                                    key={c.candidate_id}
                                    className="border-b border-slate-50 hover:bg-slate-25"
                                >
                                    <td className="px-6 py-3 text-slate-500">{i + 1}</td>
                                    <td className="px-6 py-3 font-mono text-slate-600">
                                        {c.empId || "-"}
                                    </td>
                                    <td className="px-6 py-3 font-medium text-slate-800">
                                        {c.candidate_name}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={!!c.feedback_completed}
                                            readOnly
                                            className="h-4 w-4 accent-blue-600"
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ==========================================
// ASSESSMENT TAB
// ==========================================
const AssessmentTab = ({ courseId }) => {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingEmail, setSendingEmail] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await activeCourseService.getAssessmentScores(courseId);
                setCandidates(res.candidates || []);
            } catch (err) {
                toast.error("Failed to load assessment scores");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId]);

    const handleSendEmail = async (candidate) => {
        const assessmentId =
            candidate.post_assessment_id || candidate.pre_assessment_id;
        if (!assessmentId) return;
        setSendingEmail(candidate.candidate_id);
        try {
            await activeCourseService.sendAssessmentEmail(
                courseId,
                candidate.candidate_id,
                assessmentId,
            );
            toast.success("Assessment email sent successfully!");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to send email");
        } finally {
            setSendingEmail(null);
        }
    };

    const handleGenerateReport = async () => {
        try {
            const response = await api.get(`/active-courses/${courseId}/training-report`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Training_Report.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Training report downloaded successfully!");
        } catch (error) {
            toast.error("Failed to generate training report");
        }
    };

    if (loading)
        return (
            <div className="flex justify-center py-12 text-slate-500">Loading...</div>
        );

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" /> Assessment Scores
                </h3>
                <div className="flex gap-2">
                    <Button
                        onClick={() => navigate(`/assessments/new?course_id=${courseId}`)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
                    >
                        Create Assessment
                    </Button>
                    <Button onClick={handleGenerateReport} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm">
                        Generate Training Report
                    </Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-slate-600">#</th>
                            <th className="px-6 py-3 font-semibold text-slate-600">
                                Employee ID
                            </th>
                            <th className="px-6 py-3 font-semibold text-slate-600">
                                Candidate Name
                            </th>
                            <th className="px-6 py-3 font-semibold text-slate-600 text-center">
                                Pre Score
                            </th>
                            <th className="px-6 py-3 font-semibold text-slate-600 text-center">
                                Post Score
                            </th>
                            <th className="px-6 py-3 font-semibold text-slate-600 text-center">
                                Status
                            </th>
                            <th className="px-6 py-3 font-semibold text-slate-600 text-center">
                                Email
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-8 text-slate-400">
                                    No candidates enrolled
                                </td>
                            </tr>
                        ) : (
                            candidates.map((c, i) => {
                                const hasAssessment =
                                    c.pre_assessment_id || c.post_assessment_id;
                                return (
                                    <tr
                                        key={c.candidate_id}
                                        className="border-b border-slate-50 hover:bg-slate-25"
                                    >
                                        <td className="px-6 py-3 text-slate-500">{i + 1}</td>
                                        <td className="px-6 py-3 font-mono text-slate-600">
                                            {c.empId || "-"}
                                        </td>
                                        <td className="px-6 py-3 font-medium text-slate-800">
                                            {c.candidate_name}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            {c.pre_score !== null ? (
                                                `${c.pre_score}/${c.pre_total}`
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            {c.post_score !== null ? (
                                                `${c.post_score}/${c.post_total}`
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            {c.post_score !== null ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                                    Completed
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-500">
                                                    Pending
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <button
                                                onClick={() => handleSendEmail(c)}
                                                disabled={
                                                    !hasAssessment || sendingEmail === c.candidate_id
                                                }
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                                    hasAssessment
                                                        ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                                                        : "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed",
                                                )}
                                                title={
                                                    hasAssessment
                                                        ? "Send assessment result email"
                                                        : "No assessment results yet"
                                                }
                                            >
                                                <Mail size={14} />
                                                {sendingEmail === c.candidate_id
                                                    ? "Sending..."
                                                    : "Email"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ==========================================
// ATTENDANCE TAB
// ==========================================
const AttendanceTab = ({ courseId }) => {
    const [candidates, setCandidates] = useState([]);
    const [dates, setDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [remarkModal, setRemarkModal] = useState({
        open: false,
        candidate: null,
        date: null,
        status: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await activeCourseService.getAttendance(courseId);
                setCandidates(res.candidates || []);
                if (res.start_date && res.end_date) {
                    setDates(
                        generateDateRange(
                            res.start_date.slice(0, 10),
                            res.end_date.slice(0, 10),
                        ),
                    );
                }
            } catch (err) {
                toast.error("Failed to load attendance");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId]);

    const getStatus = (candidate, date) => {
        const present = candidate.is_present ? candidate.is_present.split(",") : [];
        const holidays = candidate.holidays ? candidate.holidays.split(",") : [];
        if (present.includes(date)) return "present";
        if (holidays.includes(date)) return "holiday";
        return "absent";
    };

    const getReason = (candidate, date) => {
        if (!candidate.absent_reasons) return null;
        try {
            const reasons =
                typeof candidate.absent_reasons === "string"
                    ? JSON.parse(candidate.absent_reasons)
                    : candidate.absent_reasons;
            return reasons[date] || null;
        } catch (e) {
            return null;
        }
    };

    const handleToggle = async (candidate, date) => {
        const currentStatus = getStatus(candidate, date);
        const nextStatus =
            currentStatus === "absent"
                ? "present"
                : currentStatus === "present"
                    ? "holiday"
                    : "absent";

        if (nextStatus === "absent" || nextStatus === "holiday") {
            setRemarkModal({
                open: true,
                candidate,
                date,
                status: nextStatus,
            });
            return;
        }

        // status 'present' - save immediately
        saveAttendance(candidate, date, nextStatus);
    };

    const saveAttendance = async (candidate, date, status, reason = null) => {
        try {
            await activeCourseService.saveAttendanceSingle(
                courseId,
                candidate.candidate_id,
                date,
                status,
                reason,
            );
            // Update local state
            setCandidates((prev) =>
                prev.map((c) => {
                    if (c.candidate_id !== candidate.candidate_id) return c;
                    let present = c.is_present
                        ? c.is_present.split(",").filter(Boolean)
                        : [];
                    let holidays = c.holidays
                        ? c.holidays.split(",").filter(Boolean)
                        : [];
                    let reasons = {};
                    try {
                        reasons = c.absent_reasons
                            ? typeof c.absent_reasons === "string"
                                ? JSON.parse(c.absent_reasons)
                                : c.absent_reasons
                            : {};
                    } catch (e) { }

                    if (status === "present") {
                        if (!present.includes(date)) present.push(date);
                        holidays = holidays.filter((d) => d !== date);
                        delete reasons[date];
                    } else if (status === "holiday") {
                        if (!holidays.includes(date)) holidays.push(date);
                        present = present.filter((d) => d !== date);
                        if (reason) reasons[date] = reason;
                    } else {
                        present = present.filter((d) => d !== date);
                        holidays = holidays.filter((d) => d !== date);
                        if (reason) reasons[date] = reason;
                    }

                    return {
                        ...c,
                        is_present: present.join(","),
                        holidays: holidays.join(","),
                        absent_reasons: JSON.stringify(reasons),
                    };
                }),
            );
            if (remarkModal.open) {
                setRemarkModal({
                    open: false,
                    candidate: null,
                    date: null,
                    status: null,
                });
                toast.success("Attendance updated");
            }
        } catch (err) {
            toast.error("Failed to save attendance");
        }
    };

    if (loading)
        return (
            <div className="flex justify-center py-12 text-slate-500">Loading...</div>
        );

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Calendar size={20} className="text-blue-600" /> Attendance
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Click cells to cycle:{" "}
                    <span className="text-red-500 font-medium">Absent</span> →{" "}
                    <span className="text-green-600 font-medium">Present</span> →{" "}
                    <span className="text-yellow-600 font-medium">Holiday</span>
                </p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-slate-600 sticky left-0 bg-slate-50 z-10 min-w-[200px]">
                                Candidate
                            </th>
                            {dates.map((date) => (
                                <th
                                    key={date}
                                    className="px-2 py-3 font-semibold text-slate-600 text-center text-xs whitespace-nowrap"
                                >
                                    {new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                    })}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={1 + dates.length}
                                    className="text-center py-8 text-slate-400"
                                >
                                    No candidates enrolled
                                </td>
                            </tr>
                        ) : (
                            candidates.map((c) => (
                                <tr key={c.candidate_id} className="border-b border-slate-50">
                                    <td className="px-4 py-2 font-medium text-slate-800 sticky left-0 bg-white z-10">
                                        <div className="text-sm">{c.candidate_name}</div>
                                        <div className="text-xs text-slate-400">
                                            {c.empId || ""}
                                        </div>
                                    </td>
                                    {dates.map((date) => {
                                        const status = getStatus(c, date);
                                        const reason = getReason(c, date);
                                        const bg =
                                            status === "present"
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : status === "holiday"
                                                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                                    : "bg-red-50 text-red-500 hover:bg-red-100";
                                        const label =
                                            status === "present"
                                                ? "P"
                                                : status === "holiday"
                                                    ? "H"
                                                    : "A";
                                        return (
                                            <td key={date} className="px-1 py-2 text-center">
                                                <div className="flex flex-col items-center">
                                                    <button
                                                        onClick={() => handleToggle(c, date)}
                                                        className={`w-8 h-8 rounded-md text-xs font-bold transition-colors ${bg} flex items-center justify-center relative group`}
                                                        title={`${c.candidate_name} - ${formatDateDMY(date)} - ${status}${reason ? ": " + reason : ""}`}
                                                    >
                                                        {label}
                                                    </button>
                                                    {reason && (
                                                        <span
                                                            className="text-[10px] text-slate-400 mt-0.5 max-w-[40px] truncate"
                                                            title={reason}
                                                        >
                                                            {reason}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AttendanceRemarkModal
                isOpen={remarkModal.open}
                onClose={() =>
                    setRemarkModal({
                        open: false,
                        candidate: null,
                        date: null,
                        status: null,
                    })
                }
                status={remarkModal.status}
                candidateName={remarkModal.candidate?.candidate_name}
                date={remarkModal.date}
                onSubmit={(reason) =>
                    saveAttendance(
                        remarkModal.candidate,
                        remarkModal.date,
                        remarkModal.status,
                        reason,
                    )
                }
            />
        </div>
    );
};

// ==========================================
// CERTIFICATE TAB
// ==========================================
const CertificateTab = ({ courseId }) => {
    const [candidates, setCandidates] = useState([]);
    const [dates, setDates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await activeCourseService.getCertificateData(courseId);
                setCandidates(res.candidates || []);
                if (res.start_date && res.end_date) {
                    setDates(
                        generateDateRange(
                            res.start_date.slice(0, 10),
                            res.end_date.slice(0, 10),
                        ),
                    );
                }
            } catch (err) {
                toast.error("Failed to load certificate data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId]);

    const calcAttendance = (candidate) => {
        if (dates.length === 0) return 0;
        const present = candidate.is_present
            ? candidate.is_present.split(",").filter(Boolean)
            : [];
        const holidays = candidate.holidays
            ? candidate.holidays.split(",").filter(Boolean)
            : [];
        const workingDays = dates.length - holidays.length;
        if (workingDays <= 0) return 100;
        return Math.round((present.length / workingDays) * 100);
    };

    const isEligible = (candidate) => {
        const attendance = calcAttendance(candidate);
        const score = candidate.post_score || 0;
        const attempt = candidate.post_score_attempt || 1;

        // >60% post score for 1st attempt, >70% for retest
        const requiredScore = attempt > 1 ? 70 : 60;

        return attendance >= 100 && score >= requiredScore && !!candidate.feedback_completed;
    };

    const handleGenerateCertificate = async (candidateId) => {
        try {
            await activeCourseService.generateCertificate(courseId, candidateId);
            toast.success("Certificate generated");
            // Refresh data
            const res = await activeCourseService.getCertificateData(courseId);
            setCandidates(res.candidates || []);
        } catch (err) {
            toast.error("Failed to generate certificate");
        }
    };

    const handleToggleActive = async (candidateId, currentValue) => {
        try {
            await activeCourseService.updateCertificateActive(
                courseId,
                candidateId,
                currentValue ? 0 : 1,
            );
            setCandidates((prev) =>
                prev.map((c) =>
                    c.candidate_id === candidateId
                        ? { ...c, active: currentValue ? 0 : 1 }
                        : c,
                ),
            );
            toast.success("Status updated");
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleToggleHide = async (certificateId, currentValue) => {
        try {
            await activeCourseService.updateCertificateHide(
                courseId,
                certificateId,
                currentValue ? 0 : 1,
            );
            setCandidates((prev) =>
                prev.map((c) =>
                    c.certificate_id === certificateId
                        ? { ...c, is_hidden: currentValue ? 0 : 1 }
                        : c,
                ),
            );
            toast.success("Certificate visibility updated");
        } catch (err) {
            toast.error("Failed to update certificate visibility");
        }
    };

    if (loading)
        return (
            <div className="flex justify-center py-12 text-slate-500">Loading...</div>
        );

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" /> Certificates
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Eligible: 100% attendance + (≥60% 1st test OR ≥70% retest) + feedback completed
                </p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-slate-600">#</th>
                            <th className="px-4 py-3 font-semibold text-slate-600">
                                Employee ID
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-600">
                                Candidate Name
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-600 text-center" title="Post Score (Attempt)">
                                Assessment
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                                Attendance
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                                Feedback
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                                Generated
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                                Active
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                                Date
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                                View
                            </th>
                            <th className="px-4 py-3 font-semibold text-slate-600 text-center">
                                Hide
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center py-8 text-slate-400">
                                    No candidates enrolled
                                </td>
                            </tr>
                        ) : (
                            candidates.map((c, i) => {
                                const attendance = calcAttendance(c);
                                const eligible = isEligible(c);
                                return (
                                    <tr
                                        key={c.candidate_id}
                                        className="border-b border-slate-50 hover:bg-slate-25"
                                    >
                                        <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                                        <td className="px-4 py-3 font-mono text-slate-600">
                                            {c.empId || "-"}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-800">
                                            {c.candidate_name}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={
                                                    c.post_score >= 60
                                                        ? "text-green-600 font-semibold"
                                                        : "text-red-500 font-semibold"
                                                }
                                            >
                                                {c.post_score ?? "-"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={
                                                    attendance >= 100
                                                        ? "text-green-600 font-semibold"
                                                        : "text-red-500 font-semibold"
                                                }
                                            >
                                                {attendance}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={!!c.feedback_completed}
                                                readOnly
                                                className="h-4 w-4 accent-blue-600"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {c.certficate_generated ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200 cursor-default">
                                                    Generated
                                                </Badge>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant={eligible ? "default" : "outline"}
                                                    disabled={!eligible}
                                                    onClick={() =>
                                                        handleGenerateCertificate(c.candidate_id)
                                                    }
                                                    className="text-xs"
                                                >
                                                    Generate
                                                </Button>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {c.certficate_generated && (
                                                <button
                                                    onClick={() =>
                                                        handleToggleActive(c.candidate_id, c.active)
                                                    }
                                                    className={`w-10 h-5 rounded-full relative transition-colors ${c.active ? "bg-green-500" : "bg-slate-300"}`}
                                                >
                                                    <span
                                                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${c.active ? "left-5" : "left-0.5"}`}
                                                    />
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-500 text-xs">
                                            {c.generated_date ? formatDateDMY(c.generated_date) : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {c.certficate_generated && c.certificate_id ? (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => window.open(`/certificates/print/${c.certificate_id}`, '_blank')}
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <FileText size={16} />
                                                </Button>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {c.certficate_generated && c.certificate_id ? (
                                                <button
                                                    onClick={() =>
                                                        handleToggleHide(c.certificate_id, c.is_hidden)
                                                    }
                                                    className={`w-10 h-5 rounded-full relative transition-colors ${c.is_hidden ? "bg-red-500" : "bg-slate-300"}`}
                                                >
                                                    <span
                                                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${c.is_hidden ? "left-5" : "left-0.5"}`}
                                                    />
                                                </button>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ActiveCourseForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors },
    } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(!!id);
    const [activeTab, setActiveTab] = useState("details");

    // Data State
    const [courseData, setCourseData] = useState(null);
    const [masterCourses, setMasterCourses] = useState([]);
    const [locations, setLocations] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [enrolledCandidates, setEnrolledCandidates] = useState([]);

    // Modal State
    const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
    const [availableCandidates, setAvailableCandidates] = useState([]);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [candidateSearch, setCandidateSearch] = useState("");

    // Action Modals
    const [actionModal, setActionModal] = useState({
        isOpen: false,
        type: null,
        reason: "",
    });
    const [emailModal, setEmailModal] = useState({
        isOpen: false,
        candidateId: null,
        type: null,
    }); // type: 'online' | 'offline'

    const [venueModal, setVenueModal] = useState({
        isOpen: false,
        candidateId: null,
        data: null,
    });
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        candidateId: null,
        remark: "",
    });

    const typeOfLocation = watch("type_of_location");
    const selectedTopic = watch("topic");
    const startDate = watch("start_date");
    const endDate = watch("end_date");

    // Auto-calculate Days from Start/End Date
    useEffect(() => {
        if (startDate && endDate) {
            const diffMs = new Date(endDate) - new Date(startDate);
            const diffDays = Math.max(
                0,
                Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1,
            );
            setValue("no_of_days", diffDays);
        } else {
            setValue("no_of_days", "");
        }
    }, [startDate, endDate, setValue]);

    // Calculate Progress
    const calculateProgress = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        const total = end - start;
        const elapsed = today - start;
        if (total <= 0) return 0;
        const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
        return Math.round(progress);
    };

    const progress = calculateProgress();

    const isPastEndDate = () => {
        if (!endDate) return false;
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return new Date() > end;
    };
    const courseEnded = isPastEndDate();

    // Fetch Dependencies
    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const [mcRes, locRes, trRes] = await Promise.all([
                    api.get("/master-courses"),
                    api.get("/locations"),
                    api.get("/trainer"),
                ]);

                const getArrayData = (res) => {
                    if (Array.isArray(res.data)) return res.data;
                    if (res.data && Array.isArray(res.data.data)) return res.data.data;
                    return [];
                };
                setMasterCourses(getArrayData(mcRes));
                setLocations(locRes.data.data.data || getArrayData(locRes));
                setTrainers(getArrayData(trRes));
            } catch (error) {
                console.error("Error fetching dependencies:", error);
                toast.error("Failed to load form dependencies");
            }
        };
        fetchDependencies();
    }, []);

    // Fetch Course & Candidates
    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const course = await activeCourseService.getCourseById(id);
                    setCourseData(course);

                    // Reset form
                    reset({
                        ...course,
                        topic: course.topic || "",
                        start_date: course.start_date
                            ? new Date(course.start_date).toISOString().split("T")[0]
                            : "",
                        end_date: course.end_date
                            ? new Date(course.end_date).toISOString().split("T")[0]
                            : "",
                        whatsapp_link: course.whatsapp_link || "",
                        zoom_link: course.zoom_link || "",
                        status: course.status || "Initiated",
                        primary_trainer_id: course.primary_trainer_id || "",
                        secondary_trainer_ids: course.secondary_trainer_ids
                            ? course.secondary_trainer_ids.split(",")
                            : [],
                        no_of_days: course.no_of_days || "",
                        type_of_location: course.type_of_location || "",
                        location_id: course.location_id || "",
                        other_location: course.other_location || "",
                    });

                    // Fetch Candidates
                    const candidates =
                        await activeCourseService.getEnrolledCandidates(id);
                    setEnrolledCandidates(candidates);
                } catch (error) {
                    console.error("Error fetching data:", error);
                    toast.error("Failed to load course data");
                    navigate("/active-courses");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [id, navigate, reset]);

    // Auto-populate from Master Course
    useEffect(() => {
        if (selectedTopic && masterCourses.length > 0) {
            const selectedMC = masterCourses.find((mc) => mc.id === selectedTopic);
            if (selectedMC) {
                setValue("master_course_id", selectedMC.id);
                setValue("master_course_name", selectedMC.master_course_name);
                if (!id) {
                    // Only overwrite description/remarks on create
                    setValue("description", selectedMC.description);
                    setValue("remarks", selectedMC.remarks);
                }
            }
        }
    }, [selectedTopic, masterCourses, setValue, id]);

    // Fetch Available Candidates for Modal
    const openCandidateModal = async () => {
        try {
            const avail = await activeCourseService.getAvailableCandidates(id);
            setAvailableCandidates(avail);
            setSelectedCandidates([]);
            setIsCandidateModalOpen(true);
        } catch (error) {
            toast.error("Failed to load candidates");
        }
    };

    // Handlers
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (!data.master_course_name) {
                const mc = masterCourses.find((m) => m.id === data.topic);
                if (mc) data.master_course_name = mc.master_course_name;
            }

            const payload = {
                ...data,
                secondary_trainer_ids: Array.isArray(data.secondary_trainer_ids)
                    ? data.secondary_trainer_ids.join(",")
                    : data.secondary_trainer_ids,
            };

            // Normalize location field
            if (payload.type_of_location === "Offline") {
                if (payload.location_id === "Other") {
                    payload.location = payload.other_location;
                } else {
                    const loc = locations.find((l) => l.id == payload.location_id);
                    if (loc) {
                        payload.location = loc.location_name;
                        // Keep location_id just in case, but location field is what DB usually stores as string?
                        // Check DB: existing code uses `location` column.
                    }
                }
            } else {
                payload.location = payload.other_location || "";
            }

            if (id) {
                await activeCourseService.updateCourse(id, payload);
                toast.success("Course updated successfully");
            } else {
                await activeCourseService.createCourse(payload);
                toast.success("Course created successfully");
                navigate("/active-courses");
            }
        } catch (error) {
            console.error("Error saving course:", error);
            toast.error(error.response?.data?.message || "Failed to save course");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddCandidates = async () => {
        try {
            await activeCourseService.enrollCandidates(
                id,
                selectedCandidates,
                courseData.primary_trainer_id,
            );
            toast.success("Candidates enrolled successfully");
            setIsCandidateModalOpen(false);
            const updated = await activeCourseService.getEnrolledCandidates(id);
            setEnrolledCandidates(updated);
        } catch (error) {
            toast.error("Failed to enroll candidates");
        }
    };

    const handleDeleteCandidate = async () => {
        if (!deleteModal.remark) {
            toast.error("Please provide a remark for deletion");
            return;
        }
        try {
            await activeCourseService.removeCandidate(
                id,
                deleteModal.candidateId,
                deleteModal.remark,
            );
            setEnrolledCandidates((prev) =>
                prev.filter((c) => c.candidate_id !== deleteModal.candidateId),
            );
            toast.success("Candidate removed");
            setDeleteModal({ isOpen: false, candidateId: null, remark: "" });
        } catch (error) {
            toast.error("Failed to remove candidate");
        }
    };

    const handleStatusPoolChange = async (candidateId, newStatus) => {
        try {
            await activeCourseService.updateStatusPool(id, candidateId, newStatus);
            setEnrolledCandidates((prev) =>
                prev.map((c) =>
                    c.candidate_id === candidateId ? { ...c, status_pool: newStatus } : c,
                ),
            );
            toast.success("Status pool updated");
        } catch (error) {
            toast.error("Failed to update status pool");
        }
    };

    const handleCourseAction = async () => {
        if (!actionModal.reason) {
            toast.error("Please provide a reason");
            return;
        }
        try {
            if (actionModal.type === "cancel") {
                await activeCourseService.cancelCourse(id, actionModal.reason);
                toast.success("Course cancelled");
            } else {
                await activeCourseService.completeCourse(id, actionModal.reason);
                toast.success("Course completed");
            }
            // Refresh data
            const updated = await activeCourseService.getCourseById(id);
            setCourseData(updated);
            setValue("status", updated.status);
            setActionModal({ isOpen: false, type: null, reason: "" });
        } catch (error) {
            toast.error(`Failed to ${actionModal.type} course`);
        }
    };

    const handleEmailPrimaryTrainer = async () => {
        if (
            !window.confirm("Send enrollment confirmation email to Primary Trainer?")
        )
            return;
        try {
            await activeCourseService.emailPrimaryTrainer(id);
            toast.success("Email sent to Primary Trainer");
        } catch (error) {
            toast.error("Failed to send email");
        }
    };

    const handleSendOnlineEmail = async (candidateId) => {
        try {
            await activeCourseService.emailCandidate(id, candidateId, "online");
            toast.success("Online Welcome Letter sent");
            setEmailModal({ isOpen: false, candidateId: null, type: null });
            // Refresh list to update status if needed
            const updated = await activeCourseService.getEnrolledCandidates(id);
            setEnrolledCandidates(updated);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send email");
        }
    };

    const handleSendOfflineEmail = async (candidateId) => {
        try {
            await activeCourseService.emailCandidate(id, candidateId, "offline");
            toast.success("Offline Welcome Letter sent");
            setEmailModal({ isOpen: false, candidateId: null, type: null });
            const updated = await activeCourseService.getEnrolledCandidates(id);
            setEnrolledCandidates(updated);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send email");
        }
    };

    const openVenueModal = async (candidateId) => {
        try {
            const data = await activeCourseService.getCandidateVenue(id, candidateId);
            setVenueModal({ isOpen: true, candidateId, data: data || {} });
        } catch (error) {
            toast.error("Failed to load venue details");
        }
    };

    const handleSaveVenue = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            await activeCourseService.updateCandidateVenue(
                id,
                venueModal.candidateId,
                formData,
            );
            toast.success("Venue details updated");
            setVenueModal({ isOpen: false, candidateId: null, data: null });
        } catch (error) {
            toast.error("Failed to update venue");
        }
    };

    // Helper Components
    const InputField = ({
        label,
        name,
        type = "text",
        required,
        readOnly,
        placeholder,
    }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                {...register(name, {
                    required: required ? `${label} is required` : false,
                })}
                readOnly={readOnly}
                placeholder={placeholder}
                className={cn(
                    "w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm outline-none",
                    readOnly && "bg-slate-100 cursor-not-allowed text-slate-500",
                )}
            />
            {errors[name] && (
                <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>
            )}
        </div>
    );

    const SelectField = ({
        label,
        name,
        options,
        required,
        disabled,
        children,
    }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select
                    {...register(name, {
                        required: required ? `${label} is required` : false,
                    })}
                    disabled={disabled}
                    className={cn(
                        "w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm outline-none appearance-none",
                        disabled && "bg-slate-100 cursor-not-allowed text-slate-500",
                    )}
                >
                    <option value="">Select {label}</option>
                    {options
                        ? options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))
                        : children}
                </select>
                <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
            </div>
            {errors[name] && (
                <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>
            )}
        </div>
    );

    if (isLoading)
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Meta title={id ? "Edit Course" : "Add Course"} />

            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex items-center justify-between shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">
                        {id ? "Edit Course" : "Create New Course"}
                    </h1>
                    {courseData && (
                        <p className="text-sm text-slate-500">
                            {courseData.course_name} ({courseData.course_id})
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <BackButton to="/active-courses" />
                </div>
            </div>

            {/* Progress Bar */}
            {id && (
                <div className="bg-white border-b border-slate-200 px-8 py-4">
                    <div className="flex justify-between text-sm mb-1 font-medium text-slate-600">
                        <span>Course Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Status Messages */}
            {courseData?.cancelation_reason && (
                <div className="mx-8 mt-6 bg-red-50 border border-red-200 p-4 rounded-xl flex gap-3 text-red-700">
                    <AlertTriangle className="shrink-0" />
                    <div>
                        <h4 className="font-bold">Course Cancelled</h4>
                        <p className="text-sm">{courseData.cancelation_reason}</p>
                    </div>
                </div>
            )}
            {courseData?.completion_reason && (
                <div className="mx-8 mt-6 bg-green-50 border border-green-200 p-4 rounded-xl flex gap-3 text-green-700">
                    <Check className="shrink-0" />
                    <div>
                        <h4 className="font-bold">Course Completed</h4>
                        <p className="text-sm">{courseData.completion_reason}</p>
                    </div>
                </div>
            )}

            <div className="max-w-none p-8 space-y-8">
                {/* Tabs */}
                {id && (
                    <div className="flex border-b border-slate-200">
                        {[
                            "details",
                            "attendance",
                            "assessment",
                            "feedbacks",
                            "certificates",
                        ].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize",
                                    activeTab === tab
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-slate-500 hover:text-slate-700",
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                )}

                {/* Details Tab Content */}
                {activeTab === "details" && (
                    <div className="space-y-8">
                        <form id="course-form" onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <div className="space-y-8">
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-6 text-lg font-bold text-slate-800">
                                            <BookOpen size={20} className="text-blue-600" />
                                            <h3>Course Details</h3>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <SelectField
                                                    label="Topic"
                                                    name="topic"
                                                    required
                                                    options={masterCourses.map((mc) => ({
                                                        value: mc.id,
                                                        label: mc.topic,
                                                    }))}
                                                />
                                                <InputField
                                                    label="Course Name"
                                                    name="course_name"
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField
                                                    label="Master Course Name"
                                                    name="master_course_name"
                                                    readOnly
                                                />
                                                {id && (
                                                    <InputField
                                                        label="Course ID"
                                                        name="course_id"
                                                        readOnly
                                                    />
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <SelectField
                                                    label="Status"
                                                    name="status"
                                                    disabled
                                                    options={[
                                                        "Initiated",
                                                        "Course Started",
                                                        "Assessment Initiated",
                                                        "Feedback Generated",
                                                        "Certificate Generated",
                                                        "Course Completed",
                                                        "Cancelled",
                                                    ].map((s) => ({ value: s, label: s }))}
                                                />
                                                <SelectField
                                                    label="Course Level"
                                                    name="course_level"
                                                    options={[
                                                        { value: "Operational", label: "Operational" },
                                                        { value: "Management", label: "Management" },
                                                    ]}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <SelectField
                                                    label="Type of Course"
                                                    name="course_type"
                                                    options={[
                                                        { value: "Inhouse", label: "Inhouse" },
                                                        { value: "Outhouse", label: "Outhouse" },
                                                        { value: "CBT", label: "CBT" },
                                                        {
                                                            value: "Inhouse (Third party)",
                                                            label: "Inhouse (Third party)",
                                                        },
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-6 text-lg font-bold text-slate-800">
                                            <Calendar size={20} className="text-blue-600" />
                                            <h3>Schedule & Location</h3>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField
                                                    label="Start Date"
                                                    name="start_date"
                                                    type="date"
                                                    required
                                                />
                                                <InputField
                                                    label="End Date"
                                                    name="end_date"
                                                    type="date"
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField
                                                    label="Start Time"
                                                    name="start_time"
                                                    type="time"
                                                />
                                                <InputField
                                                    label="End Time"
                                                    name="end_time"
                                                    type="time"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField
                                                    label="No. of Days"
                                                    name="no_of_days"
                                                    type="number"
                                                    readOnly
                                                />
                                                <SelectField
                                                    label="Location Type"
                                                    name="type_of_location"
                                                    options={[
                                                        { value: "Online", label: "Online" },
                                                        { value: "Offline", label: "Offline" },
                                                        { value: "Manual", label: "Manual" },
                                                    ]}
                                                />
                                            </div>
                                            {/* Conditional Location Fields */}
                                            {typeOfLocation === "Offline" && (
                                                <SelectField
                                                    label="Venue / Location"
                                                    name="location_id"
                                                    options={[
                                                        ...locations.map((loc) => ({
                                                            value: loc.location_name,
                                                            label: loc.location_name,
                                                        })),
                                                        { value: "Other", label: "Other" },
                                                    ]}
                                                />
                                            )}

                                            {((typeOfLocation === "Offline" &&
                                                watch("location_id") === "Other") ||
                                                typeOfLocation === "Manual") && (
                                                    <InputField
                                                        label="Specify Location"
                                                        name="other_location"
                                                        required
                                                        placeholder="Enter location"
                                                    />
                                                )}

                                            {typeOfLocation === "Online" && (
                                                <>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <InputField label="Zoom Link" name="zoom_link" />
                                                        <InputField
                                                            label="WhatsApp Link"
                                                            name="whatsapp_link"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <InputField
                                                            label="Zoom Username"
                                                            name="zoom_username"
                                                        />
                                                        <InputField
                                                            label="Zoom Password"
                                                            name="zoom_password"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-6 text-lg font-bold text-slate-800">
                                            <Users size={20} className="text-blue-600" />
                                            <h3>Trainers & Info</h3>
                                        </div>
                                        <div className="space-y-6">
                                            <SelectField
                                                label="Primary Trainer"
                                                name="primary_trainer_id"
                                                required
                                                options={trainers.map((t) => ({
                                                    value: t.id,
                                                    label: `${t.first_name} ${t.last_name}`,
                                                }))}
                                            />
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700 block">
                                                    Secondary Trainers
                                                </label>
                                                <Controller
                                                    control={control}
                                                    name="secondary_trainer_ids"
                                                    render={({ field }) => (
                                                        <MultiSelectInput
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            options={trainers.map((t) => ({
                                                                value: t.id,
                                                                label: `${t.first_name} ${t.last_name}`,
                                                            }))}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-2 mb-6 text-lg font-bold text-slate-800">
                                            <FileText size={20} className="text-blue-600" />
                                            <h3>Description & Remarks</h3>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700 block">
                                                    Description
                                                </label>
                                                <Controller
                                                    name="description"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <ReactQuill {...field} theme="snow" />
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700 block">
                                                    Remarks
                                                </label>
                                                <Controller
                                                    name="remarks"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <ReactQuill {...field} theme="snow" />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 sm:p-6 -mx-8 -mb-8 flex justify-between items-center z-10 mt-8 rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                {id ? (
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleEmailPrimaryTrainer}
                                            className="gap-2"
                                        >
                                            <Mail size={16} /> Email Primary Trainer
                                        </Button>
                                    </div>
                                ) : <div />}
                                <div className="flex gap-4 w-full sm:w-auto items-center">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/active-courses")}
                                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                    {id && !["Cancelled", "Course Completed"].includes(courseData?.status) && (
                                        <>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={() =>
                                                    setActionModal({ isOpen: true, type: "cancel", reason: "" })
                                                }
                                            >
                                                Cancel Course
                                            </Button>
                                            <Button
                                                type="button"
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() =>
                                                    setActionModal({
                                                        isOpen: true,
                                                        type: "complete",
                                                        reason: "",
                                                    })
                                                }
                                            >
                                                Complete Course
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70 text-sm"
                                    >
                                        {isSubmitting ? (
                                            <RefreshCcw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        <span>{id ? "Save Changes" : "Create Course"}</span>
                                    </Button>
                                </div>
                            </div>
                        </form>

                        {/* Candidate Management Section */}
                        {id && (
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
                                        <Users size={20} className="text-blue-600" />
                                        <h3>Enrolled Candidates</h3>
                                    </div>
                                    <Button onClick={openCandidateModal} disabled={courseEnded}>+ Add Candidates</Button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 text-left text-sm font-semibold text-slate-600">
                                            <tr>
                                                <th className="px-4 py-3">Emp ID</th>
                                                <th className="px-4 py-3">Candidate Name</th>
                                                <th className="px-4 py-3">Rank</th>
                                                <th className="px-4 py-3">Passport</th>
                                                <th className="px-4 py-3">Seaman No</th>
                                                <th className="px-4 py-3">Manager</th>
                                                <th className="px-4 py-3">Status Pool</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {enrolledCandidates.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan="5"
                                                        className="px-4 py-8 text-center text-slate-500"
                                                    >
                                                        No candidates enrolled yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                enrolledCandidates.map((candidate) => (
                                                    <tr key={candidate.id} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3 text-sm text-slate-600">
                                                            {candidate.empId}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                                            {candidate.candidate_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-600">
                                                            {candidate.rank}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-600">
                                                            {candidate.cdc_passport}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-600">
                                                            {candidate.seaman_book_no}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-slate-600">
                                                            {candidate.manager}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <select
                                                                value={candidate.status_pool || ""}
                                                                onChange={(e) =>
                                                                    handleStatusPoolChange(
                                                                        candidate.candidate_id,
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                className="h-9 px-3 rounded-lg border border-slate-200 text-sm focus:border-blue-500 outline-none"
                                                            >
                                                                <option value="">Select Status</option>
                                                                <option value="LNG">LNG</option>
                                                                <option value="LPG">LPG</option>
                                                                <option value="DRY">DRY</option>
                                                                <option value="TANKERS">TANKERS</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setEmailModal({
                                                                        isOpen: true,
                                                                        candidateId: candidate.candidate_id,
                                                                    })
                                                                }
                                                                title="Send Email"
                                                            >
                                                                <Mail
                                                                    size={16}
                                                                    className={
                                                                        candidate.candidate_email_status
                                                                            ? "text-green-500"
                                                                            : "text-slate-400"
                                                                    }
                                                                />
                                                            </Button>
                                                            {typeOfLocation !== "Online" && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        openVenueModal(candidate.candidate_id)
                                                                    }
                                                                    title="Edit Venue"
                                                                >
                                                                    {/* Use a pencil icon */}
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        width="16"
                                                                        height="16"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        className="lucide lucide-pencil"
                                                                    >
                                                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                                        <path d="m15 5 4 4" />
                                                                    </svg>
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                disabled={courseEnded}
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                                                                onClick={() =>
                                                                    setDeleteModal({
                                                                        isOpen: true,
                                                                        candidateId: candidate.candidate_id,
                                                                        remark: "",
                                                                    })
                                                                }
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Attendance Tab */}
                {activeTab === "attendance" && <AttendanceTab courseId={id} />}

                {/* Assessment Tab */}
                {activeTab === "assessment" && <AssessmentTab courseId={id} />}

                {/* Feedbacks Tab */}
                {activeTab === "feedbacks" && <FeedbackTab courseId={id} />}

                {/* Certificates Tab */}
                {activeTab === "certificates" && <CertificateTab courseId={id} />}
            </div>

            {/* Delete Candidate Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50">
                            <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                                <AlertTriangle size={20} /> Remove Candidate
                            </h3>
                            <button
                                onClick={() =>
                                    setDeleteModal({
                                        isOpen: false,
                                        candidateId: null,
                                        remark: "",
                                    })
                                }
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-slate-600 text-sm">
                                Are you sure you want to remove this candidate? This action will
                                mark them as deleted. Please provide a reason.
                            </p>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">
                                    Reason / Remark
                                </label>
                                <textarea
                                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none h-24"
                                    placeholder="Enter reason for removal..."
                                    value={deleteModal.remark}
                                    onChange={(e) =>
                                        setDeleteModal({ ...deleteModal, remark: e.target.value })
                                    }
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        setDeleteModal({
                                            isOpen: false,
                                            candidateId: null,
                                            remark: "",
                                        })
                                    }
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteCandidate}
                                    disabled={!deleteModal.remark}
                                >
                                    Remove Candidate
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Candidate Selection Modal */}
            {isCandidateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold">Select Candidates</h3>
                            <button
                                onClick={() => setIsCandidateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-4 border-b border-slate-100">
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                className="w-full px-4 py-2 border rounded-lg"
                                value={candidateSearch}
                                onChange={(e) => setCandidateSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 font-semibold text-slate-600 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2">Select</th>
                                        <th className="px-4 py-2">Name</th>
                                        <th className="px-4 py-2">Emp ID</th>
                                        <th className="px-4 py-2">Rank</th>
                                        <th className="px-4 py-2">Passport</th>
                                        <th className="px-4 py-2">Seaman No.</th>
                                        <th className="px-4 py-2">Manager</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {availableCandidates
                                        .filter((c) => {
                                            const name =
                                                `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
                                            const search = candidateSearch.toLowerCase();
                                            return (
                                                name.includes(search) ||
                                                c.empId?.toLowerCase().includes(search)
                                            );
                                        })
                                        .map((candidate) => (
                                            <tr
                                                key={candidate.id}
                                                className="hover:bg-slate-50 border-b border-slate-50"
                                            >
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCandidates.includes(candidate.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked)
                                                                setSelectedCandidates([
                                                                    ...selectedCandidates,
                                                                    candidate.id,
                                                                ]);
                                                            else
                                                                setSelectedCandidates(
                                                                    selectedCandidates.filter(
                                                                        (id) => id !== candidate.id,
                                                                    ),
                                                                );
                                                        }}
                                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {candidate.first_name} {candidate.last_name}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">
                                                    {candidate.empId}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">
                                                    {candidate.rank}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">
                                                    {candidate.cdc_passport || "-"}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">
                                                    {candidate.seaman_book_no || "-"}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">
                                                    {candidate.manager || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
                            <Button
                                variant="outline"
                                onClick={() => setIsCandidateModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddCandidates}
                                disabled={selectedCandidates.length === 0}
                            >
                                Add {selectedCandidates.length} Candidates
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Modal (Cancel/Complete) */}
            {actionModal.isOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-6">
                        <h3 className="text-lg font-bold mb-4 capitalize">
                            {actionModal.type} Course
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Please provide a reason for{" "}
                            {actionModal.type === "cancel" ? "cancelling" : "completing"} this
                            course.
                        </p>
                        <textarea
                            className="w-full h-32 p-3 border rounded-lg resize-none mb-6 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type reason here..."
                            value={actionModal.reason}
                            onChange={(e) =>
                                setActionModal({ ...actionModal, reason: e.target.value })
                            }
                        />
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setActionModal({ isOpen: false, type: null, reason: "" })
                                }
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={
                                    actionModal.type === "cancel" ? "destructive" : "default"
                                }
                                onClick={handleCourseAction}
                                className={
                                    actionModal.type === "complete"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : ""
                                }
                            >
                                Confirm{" "}
                                {actionModal.type === "cancel" ? "Cancellation" : "Completion"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* Email Modal */}
            {emailModal.isOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
                        <h3 className="text-lg font-bold mb-4">Send Welcome Letter</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Select the type of email to send.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => handleSendOnlineEmail(emailModal.candidateId)}
                                className="w-full justify-start gap-2"
                            >
                                <Video size={16} /> Online Class (Zoom)
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleSendOfflineEmail(emailModal.candidateId)}
                                className="w-full justify-start gap-2"
                            >
                                <MapPin size={16} /> Offline Class (Venue)
                            </Button>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button
                                variant="ghost"
                                onClick={() =>
                                    setEmailModal({ isOpen: false, candidateId: null })
                                }
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Venue Modal */}
            {venueModal.isOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4">Edit Candidate Venue</h3>
                        <form onSubmit={handleSaveVenue} className="space-y-4">
                            <InputField
                                label="Venue Name"
                                name="venue_name"
                                defaultValue={venueModal.data?.venue_name}
                                placeholder="e.g. Hotel ..."
                            />
                            <InputField
                                label="Venue Address"
                                name="venue_address"
                                defaultValue={venueModal.data?.venue_address}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="Contact"
                                    name="venue_contact"
                                    defaultValue={venueModal.data?.venue_contact}
                                />
                                <InputField
                                    label="Email"
                                    name="venue_email"
                                    defaultValue={venueModal.data?.venue_email}
                                />
                            </div>
                            <InputField
                                label="Map Link"
                                name="venue_map_link"
                                defaultValue={venueModal.data?.venue_map_link}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="Offline Date"
                                    name="offline_date"
                                    type="date"
                                    defaultValue={venueModal.data?.offline_date}
                                />
                                <InputField
                                    label="Remarks"
                                    name="remarks"
                                    defaultValue={venueModal.data?.remarks}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 block">
                                    Attach Files
                                </label>
                                <input
                                    type="file"
                                    name="venue_files"
                                    multiple
                                    className="text-sm"
                                />
                                <p className="text-xs text-slate-500">
                                    Allowed: Images, PDF, Word
                                </p>
                            </div>

                            {venueModal.data?.files && venueModal.data.files.length > 0 && (
                                <div className="mt-2 text-sm">
                                    <p className="font-medium">Uploaded Files:</p>
                                    <ul className="list-disc pl-5">
                                        {venueModal.data.files.map((f) => (
                                            <li key={f.id}>{f.file_name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setVenueModal({
                                            isOpen: false,
                                            candidateId: null,
                                            data: null,
                                        })
                                    }
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Save Venue Details</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveCourseForm;
