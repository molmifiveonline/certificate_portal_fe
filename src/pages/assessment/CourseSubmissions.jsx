import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Meta from "../../components/common/Meta";
import { Search, RefreshCcw, Eye, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { debounce } from "lodash";
import assessmentService from "../../services/assessmentService";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
import { toast } from "sonner";
import { formatDate } from "../../lib/utils/dateUtils";
import BackButton from '../../components/common/BackButton';

const CourseSubmissions = () => {
    const { courseId } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);

    const updateDebouncedSearch = useCallback(
        debounce((value) => {
            setDebouncedSearch(value);
            setPage(1);
        }, 500),
        []
    );

    useEffect(() => {
        updateDebouncedSearch(searchTerm);
    }, [searchTerm, updateDebouncedSearch]);

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await assessmentService.getCourseSubmissions(
                courseId,
                {
                    page,
                    limit,
                    search: debouncedSearch,
                }
            );
            setSubmissions(response.data || []);
            setTotalPages(response.totalPages || 1);
            setTotalCount(response.totalCount || 0);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch submissions.");
        } finally {
            setLoading(false);
        }
    }, [courseId, page, limit, debouncedSearch]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const courseName =
        submissions.length > 0 ? submissions[0].course_name : "Course";

    const getTypeLabel = (type) => {
        const labels = { "1": "Pre Course", "2": "Post Course", "3": "Daily" };
        return labels[type] || type || "N/A";
    };

    const getScoreBadgeClass = (score) => {
        if (score >= 80) return "bg-green-100 text-green-800";
        if (score >= 50) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    };

    const columns = [
        {
            key: "first_name",
            label: "Candidate Name",
            render: (_val, row) => (
                <span className="font-medium text-slate-700">
                    {row.first_name} {row.last_name}
                </span>
            ),
        },
        {
            key: "email",
            label: "Email",
            render: (val) => (
                <span className="text-slate-500 text-sm">{val}</span>
            ),
        },
        {
            key: "assessment_title",
            label: "Assessment",
            render: (val) => val || "N/A",
        },
        {
            key: "score",
            label: "Score",
            render: (val, row) => (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getScoreBadgeClass(parseFloat(val))}`}
                >
                    {val != null ? `${val}%` : "N/A"} ({row.correct_answers}/
                    {row.total_questions})
                </span>
            ),
        },
        {
            key: "attempt_number",
            label: "Attempt",
            render: (val) => (
                <span className="text-slate-600">#{val}</span>
            ),
        },
        {
            key: "created_at",
            label: "Submitted On",
            render: (val) =>
                val ? formatDate(val) : "N/A",
        },
        {
            key: "actions",
            label: "Action",
            align: "center",
            render: (_val, row) => (
                <div className="flex items-center justify-center gap-2">
                    <Link
                        to={`/assessment/submission/${row.result_id}`}
                        className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-all inline-block"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto">
            <Meta
                title={`Submissions - ${courseName}`}
                description="View candidate submissions"
            />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <BackButton to="/assessment/submitted" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                            Candidate Submissions
                        </h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {courseName}
                        </p>
                    </div>
                </div>
            </div>

            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by candidate name or email..."
                                className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 w-full md:w-auto items-center">
                            <span className="text-xs text-slate-400">
                                {totalCount} submission
                                {totalCount !== 1 ? "s" : ""}
                            </span>
                            <button
                                onClick={fetchSubmissions}
                                className="h-10 w-10 bg-white/50 border border-slate-200/60 hover:bg-white/80 rounded-xl flex items-center justify-center text-slate-600 transition-all"
                            >
                                <RefreshCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <DataTable
                columns={columns}
                data={submissions}
                loading={loading}
                emptyMessage="No submissions found for this course."
                currentPage={page}
                limit={limit}
                rowKey="result_id"
            />

            <TablePagination
                currentPage={page}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                }}
            />
        </div>
    );
};

export default CourseSubmissions;
