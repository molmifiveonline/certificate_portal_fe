import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import { Link, useParams, useLocation } from "react-router-dom";
import Meta from "../../components/common/Meta";
import { Search, Eye, Send } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { debounce } from "lodash";
import feedbackAnswerService from "../../services/feedbackAnswerService";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
import PageHeader from "../../components/common/PageHeader";
import { toast } from "sonner";
import { formatDate } from "../../lib/utils/utils";

const FeedbackCandidateList = () => {
    const { activeCourseId } = useParams();
    const location = useLocation();
    const isTrainerRoute = location.pathname.includes('/trainer-feedback');
    const basePath = isTrainerRoute ? '/trainer-feedback' : '/feedback/submitted';

    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);
    const [courseName, setCourseName] = useState("");

    // Use useMemo for debounced search to avoid recreation on every render
    const updateDebouncedSearch = useMemo(
        () => debounce((value) => {
            setDebouncedSearch(value);
            setPage(1);
        }, 500),
        [setDebouncedSearch, setPage]
    );

    useEffect(() => {
        updateDebouncedSearch(searchTerm);
    }, [searchTerm, updateDebouncedSearch]);

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await feedbackAnswerService.getSubmissions({
                page,
                limit,
                search: debouncedSearch,
                active_course_id: activeCourseId,
            });
            setSubmissions(response.data);
            setTotalPages(response.totalPages);
            setTotalCount(response.totalCount);

            if (response.data.length > 0) {
                setCourseName(response.data[0].active_course_name);
            }
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, "Failed to fetch candidate submissions."));
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch, activeCourseId]);

    useEffect(() => {
        if (activeCourseId) {
            fetchSubmissions();
        }
    }, [fetchSubmissions, activeCourseId]);

    const columns = [
        {
            key: "employee_id",
            label: "Employee ID",
            render: (val) => val || "N/A",
        },
        {
            key: "first_name",
            label: "Candidate Name",
            render: (_val, row) => (
                <div className="font-medium text-slate-700">
                    {row.first_name} {row.last_name}
                </div>
            ),
        },
        {
            key: "rank",
            label: "Rank",
            render: (val) => val || "-",
        },
        {
            key: "effective_date",
            label: "Submitted On",
            render: (val) => formatDate(val),
        },
        {
            key: "actions",
            label: "Actions",
            render: (_val, row) => (
                <div className="flex items-center gap-2">
                    <Link
                        to={`${basePath}/${isTrainerRoute ? 'submitted/' : ''}${row.candidate_id}/${row.active_course_id}`}
                        className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-all inline-block"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => toast.info("Resend Email functionality pending")}
                        className="p-1.5 rounded-full text-slate-600 hover:bg-slate-100 transition-all inline-block"
                        title="Resend Email"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto">
            <Meta title="Course Candidates" description="View Candidate Feedback Submissions" />

            <PageHeader
                title="Course Candidates"
                subtitle={courseName ? `Showing submissions for: ${courseName}` : "Showing candidate submissions"}
                compact={true}
                backTo={basePath}
                backLabel="Back to Courses"
            />

            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <DataTable
                columns={columns}
                data={submissions}
                loading={loading}
                emptyMessage="No candidated submissions found for this course."
                currentPage={page}
                limit={limit}
                rowKey="candidate_id"
            />

            <TablePagination
                currentPage={page}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={setLimit}
            />
        </div>
    );
};

export default FeedbackCandidateList;


