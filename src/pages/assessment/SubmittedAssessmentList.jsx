import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Meta from "../../components/common/Meta";
import { Search, Eye, ClipboardList, Download } from "lucide-react";
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
            const response = await assessmentService.getAllPaginatedSubmissions({
                page,
                limit,
                search: debouncedSearch,
            });
            setSubmissions(response.data || []);
            setTotalPages(response.totalPages || 1);
            setTotalCount(response.totalCount || 0);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch submitted assessments.");
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch]);

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
                    <button
                        onClick={() => {
                            // Currently we don't have a row-level PDF download, 
                            // but we can provide a toast or link if available.
                            toast.info("Individual download for " + row.first_name + " coming soon");
                        }}
                        className="p-1.5 rounded-full text-green-600 hover:bg-green-50 transition-all"
                        title="Download Result"
                    >
                        <Download className="w-4 h-4" />
                    </button>
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
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-xl">
                            <ClipboardList className="w-8 h-8 text-indigo-600" />
                        </div>
                        Submitted Assessments
                    </h1>
                    <p className="text-slate-500 mt-1">
                        View assessment submissions by course
                    </p>
                </div>
                <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export to Excel"}
                </Button>
            </div>

            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by course name..."
                                className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 w-full md:w-auto items-center">
                            <span className="text-xs text-slate-400">
                                {totalCount} course{totalCount !== 1 ? "s" : ""}
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
