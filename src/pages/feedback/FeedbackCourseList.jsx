import React, { useState, useEffect, useCallback } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import { Link, useLocation } from "react-router-dom";
import Meta from "../../components/common/Meta";
import { Search, Users } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { debounce } from "lodash";
import feedbackAnswerService from "../../services/feedbackAnswerService";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
import { toast } from "sonner";
import { formatDate } from "../../lib/utils/utils";

const FeedbackCourseList = () => {
    const location = useLocation();
    const isTrainerRoute = location.pathname.includes('/trainer-feedback');
    const basePath = isTrainerRoute ? '/trainer-feedback' : '/feedback/submitted';

    const [courses, setCourses] = useState([]);
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

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const response = await feedbackAnswerService.getFeedbackCourses({
                page,
                limit,
                search: debouncedSearch,
            });
            setCourses(response.data);
            setTotalPages(response.totalPages);
            setTotalCount(response.totalCount);
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, "Failed to fetch feedback courses."));
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const columns = [
        {
            key: "active_course_code",
            label: "Course Code",
            render: (val) => val || "N/A",
        },
        {
            key: "active_course_name",
            label: "Active Course Name",
            render: (val, row) => (
                <div>
                    <span className="font-medium text-slate-700 block">{val}</span>
                    <span className="text-xs text-slate-500">
                        {formatDate(row.start_date)} - {formatDate(row.end_date)}
                    </span>
                </div>
            )
        },
        {
            key: "total_candidates",
            label: "Feedback Count",
            render: (val) => (
                <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                    <Users className="w-4 h-4" />
                    {val} Submissions
                </div>
            )
        },
        {
            key: "latest_feedback_date",
            label: "Latest Feedback",
            render: (val) => formatDate(val),
        },
        {
            key: "actions",
            label: "Actions",
            render: (_val, row) => (
                <div className="flex items-center gap-2">
                    <Link
                        to={`${basePath}/candidates/${row.active_course_id}`}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        title="View Candidates"
                    >
                        View Candidates
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto">
            <Meta title="Feedback Courses" description="View Courses with Submitted Feedback" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight page-title">
                        Submitted Feedback
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Select an active course to view submitted candidate feedback
                    </p>
                </div>
            </div>

            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by course name or code..."
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
                data={courses}
                loading={loading}
                emptyMessage="No feedback courses found."
                currentPage={page}
                limit={limit}
                rowKey="active_course_id"
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

export default FeedbackCourseList;


