import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Meta from "../../components/common/Meta";
import { Search, Eye, ClipboardList, FileDown } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { debounce } from "lodash";
import assessmentService from "../../services/assessmentService";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
import { toast } from "sonner";

const SubmittedAssessmentList = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);
    const [isExporting, setIsExporting] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);
    const [courseFilter, setCourseFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [courses, setCourses] = useState([]);

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
            const params = { page, limit, search: debouncedSearch };
            if (courseFilter) params.course_id = courseFilter;
            if (typeFilter) params.type_of_test = typeFilter;
            const response = await assessmentService.getAllPaginatedSubmissions(params);
            setSubmissions(response.data || []);
            setTotalPages(response.totalPages || 1);
            setTotalCount(response.totalCount || 0);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch submitted assessments.");
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch, courseFilter, typeFilter]);

    // Fetch courses for filter dropdown
    useEffect(() => {
        assessmentService.getActiveCourses().then((res) => {
            setCourses(res.data || []);
        }).catch(() => { });
    }, []);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const getTypeLabel = (type) => {
        const labels = { "1": "Pre Course", "2": "Post Course", "3": "Daily" };
        return labels[type] || type || "N/A";
    };

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const response = await assessmentService.exportSubmittedAssessments({
                search: debouncedSearch,
            });

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Submitted_Assessments.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Submitted assessments exported successfully");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export submitted assessments");
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadPdf = async (row) => {
        try {
            setDownloadingId(row.result_id);
            const response = await assessmentService.downloadSubmissionPdf(row.result_id);
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
            setTimeout(() => window.URL.revokeObjectURL(url), 10000);
            toast.success("PDF opened in new tab");
        } catch (error) {
            console.error("PDF open error:", error);
            toast.error("Failed to open PDF");
        } finally {
            setDownloadingId(null);
        }
    };

    const getTypeBadgeClass = (type) => {
        if (type === "1") return "bg-blue-100 text-blue-800";
        if (type === "2") return "bg-green-100 text-green-800";
        return "bg-orange-100 text-orange-800";
    };

    const columns = [
        {
            key: "course_name",
            label: "Active Course Name",
            render: (val) => (
                <span className="font-medium text-slate-700">{val || "N/A"}</span>
            ),
        },
        {
            key: "employee_id",
            label: "Employee ID",
            render: (val) => (
                <span className="text-slate-600">{val || "--"}</span>
            ),
        },
        {
            key: "candidate_name",
            label: "Employee Name",
            render: (_val, row) => (
                <span className="font-medium text-slate-700">
                    {row.first_name} {row.last_name}
                </span>
            ),
        },
        {
            key: "type_of_test",
            label: "Type of Test",
            render: (val) => (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(val)}`}
                >
                    {getTypeLabel(val)}
                </span>
            ),
        },
        {
            key: "score",
            label: "Score",
            render: (_val, row) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                    {row.score} / {row.total_questions}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            align: "center",
            render: (_val, row) => (
                <div className="flex items-center justify-center gap-2">
                    <Link
                        to={`/assessment/submission/${row.result_id}`}
                        className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-all inline-block"
                        title="View Submission"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    {(row.type_of_test == 2 || row.type_of_test == "2") ? (
                        <button
                            onClick={() => handleDownloadPdf(row)}
                            disabled={downloadingId === row.result_id}
                            className="p-1.5 rounded-full text-green-600 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Download PDF"
                        >
                            {downloadingId === row.result_id ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                            ) : (
                                <FileDown className="w-4 h-4" />
                            )}
                        </button>
                    ) : (
                        <span className="p-1.5 w-7 h-7 inline-block" aria-hidden="true" />
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto">
            <Meta
                title="Submitted Assessments"
                description="View Submitted Assessments"
            />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight page-title flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-xl">
                            <ClipboardList className="w-8 h-8 text-indigo-600" />
                        </div>
                        Submitted Assessments
                    </h1>
                    <p className="text-slate-500 mt-1">
                        View assessment submissions by course
                    </p>
                </div>
                {/* <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 px-4 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    <FileDown className="w-4 h-4" />
                    {isExporting ? "Exporting..." : "Export to Excel"}
                </Button> */}
            </div>

            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
                        {/* Search */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, course, employee ID..."
                                className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Course filter */}
                            <select
                                value={courseFilter}
                                onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
                                className="h-10 pl-3 pr-8 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-600 min-w-[180px]"
                            >
                                <option value="">All Courses</option>
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>{c.course_name}</option>
                                ))}
                            </select>

                            {/* Type of Test filter */}
                            <select
                                value={typeFilter}
                                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                                className="h-10 pl-3 pr-8 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-600 min-w-[160px]"
                            >
                                <option value="">All Types</option>
                                <option value="1">Pre Course</option>
                                <option value="2">Post Course</option>
                                <option value="3">Daily</option>
                            </select>

                            {/* Clear filters */}
                            {(courseFilter || typeFilter || searchTerm) && (
                                <button
                                    onClick={() => { setCourseFilter(""); setTypeFilter(""); setSearchTerm(""); setPage(1); }}
                                    className="h-10 px-3 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    Clear
                                </button>
                            )}

                            <span className="text-xs text-slate-400">
                                {totalCount} result{totalCount !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <DataTable
                columns={columns}
                data={submissions}
                loading={loading}
                emptyMessage="No submitted assessments found."
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
        </div >
    );
};

export default SubmittedAssessmentList;
