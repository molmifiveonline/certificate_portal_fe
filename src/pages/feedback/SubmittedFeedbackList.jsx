import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Meta from "../../components/common/Meta";
import { Search, Eye, Download, Send } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { debounce } from "lodash";
import feedbackAnswerService from "../../services/feedbackAnswerService";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
import { toast } from "sonner";

const SubmittedFeedbackList = () => {
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
            const response = await feedbackAnswerService.getSubmissions({
                page,
                limit,
                search: debouncedSearch,
            });
            setSubmissions(response.data);
            setTotalPages(response.totalPages);
            setTotalCount(response.totalCount);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch submissions.");
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const columns = [
        {
            key: "active_course_name",
            label: "Active Course Name",
        },
        {
            key: "employee_id",
            label: "Employee ID",
            render: (val) => val || "-",
        },
        {
            key: "first_name",
            label: "Employee Name",
            render: (_val, row) => (
                <span className="font-medium text-slate-700">
                    {row.first_name} {row.last_name}
                </span>
            ),
        },
        {
            key: "average_rating",
            label: "Average Rating",
            render: (val) => val ? Number(val).toFixed(1) : "-",
        },
        {
            key: "actions",
            label: "Actions",
            render: (_val, row) => (
                <div className="flex items-center gap-2">
                    <Link
                        to={`/feedback/submitted/${row.candidate_id}/${row.active_course_id}`}
                        className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-all inline-block"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => toast.info("Download PDF functionality pending")}
                        className="p-1.5 rounded-full text-slate-600 hover:bg-slate-100 transition-all inline-block"
                        title="Download PDF"
                    >
                        <Download className="w-4 h-4" />
                    </button>
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
            <Meta title="Submitted Feedback" description="View Submitted Feedback" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                        Submitted Feedback
                    </h1>
                    <p className="text-slate-500 mt-1">
                        View feedback submitted by candidates
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
                                placeholder="Search by candidate name or email..."
                                className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <DataTable
                columns={columns}
                data={submissions}
                loading={loading}
                emptyMessage="No submissions found."
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
        </div >
    );
};

export default SubmittedFeedbackList;
