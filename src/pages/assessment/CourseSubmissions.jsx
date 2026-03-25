import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Meta from "../../components/common/Meta";
import { Search, Eye } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import debounce from "lodash/debounce";
import assessmentService from "../../services/assessmentService";
import DataTable from "../../components/ui/DataTable";
import { toast } from "sonner";
import { formatDate } from "../../lib/utils/dateUtils";
import PageHeader from "../../components/common/PageHeader";

const CourseSubmissions = () => {
    const { courseId } = useParams();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activeTab, setActiveTab] = useState("3"); // Default to Daily (3)

    // Use useMemo for debounced search to avoid recreation on every render
    const updateDebouncedSearch = useMemo(
        () => debounce((value) => {
            setDebouncedSearch(value);
        }, 500),
        [setDebouncedSearch]
    );

    useEffect(() => {
        updateDebouncedSearch(searchTerm);
    }, [searchTerm, updateDebouncedSearch]);

    const fetchAssessments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await assessmentService.getAssessmentsByCourse(
                courseId,
                {
                    type_of_test: activeTab,
                    search: debouncedSearch,
                }
            );
            setAssessments(response.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch assessments.");
        } finally {
            setLoading(false);
        }
    }, [courseId, debouncedSearch, activeTab]);

    useEffect(() => {
        fetchAssessments();
    }, [fetchAssessments]);

    const courseName =
        assessments.length > 0 ? assessments[0].course_name : "Course";

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
            key: "title",
            label: "Assessment Title",
            render: (val) => val || "N/A",
        },
        {
            key: "type_of_test",
            label: "Type",
            render: (val) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {getTypeLabel(val)}
                </span>
            ),
        },
        {
            key: "created_at",
            label: "Created On",
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
                        to={`/assessment/submission/${row.id}`} // Assuming row.id here is actually the result_id. Will need to verify if backend returns result_id as row.id.
                        className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-all inline-block"
                        title="View Submission"
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

            <PageHeader
                title="Submitted Assessment Candidates"
                subtitle={`Showing submissions for: ${courseName}`}
                compact={true}
                backTo="/assessment/submitted"
            />

            <div className="mb-6 flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab("3")}
                    className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "3"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                >
                    Daily assessment
                </button>
                <button
                    onClick={() => setActiveTab("1")}
                    className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "1"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                >
                    Pre assessment
                </button>
                <button
                    onClick={() => setActiveTab("2")}
                    className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "2"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                >
                    Post assessment
                </button>
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
                                {assessments.length} assessment
                                {assessments.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <DataTable
                columns={columns}
                data={assessments}
                loading={loading}
                emptyMessage="No assessments found for this course."
                rowKey="id"
            />
        </div>
    );
};

export default CourseSubmissions;
