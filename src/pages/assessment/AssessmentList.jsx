import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../components/common/Meta";
import {
    Search,
    Plus,
    Edit,
    ClipboardCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";

import assessmentService from "../../services/assessmentService";
import { toast } from "sonner";

const AssessmentList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);


    const fetchAssessments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await assessmentService.getAssessments({
                search: searchTerm,
                page: currentPage,
                limit,
            });
            setAssessments(response.data || []);
            setTotalCount(response.total || 0);
            setTotalPages(Math.ceil((response.total || 0) / limit));
        } catch (error) {
            console.error(error);
            toast.error("Failed to load assessments.");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, currentPage, limit]);

    useEffect(() => {
        fetchAssessments();
    }, [fetchAssessments]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timeout);
    }, [searchTerm]);





    const getTypeLabel = (type) => {
        const labels = { "1": "Pre Course", "2": "Post Course", "3": "Daily" };
        return labels[type] || type;
    };

    const getTypeBadgeClass = (type) => {
        if (type === "1") return "bg-blue-100 text-blue-800";
        if (type === "2") return "bg-green-100 text-green-800";
        return "bg-orange-100 text-orange-800";
    };

    const columns = [
        {
            key: "title",
            label: "Title",
            render: (val) => <span className="font-semibold text-slate-800">{val}</span>,
        },
        {
            key: "course_name",
            label: "Course",
            render: (val) => val || "N/A",
        },
        {
            key: "type_of_test",
            label: "Type of Test",
            render: (val) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(val)}`}>
                    {getTypeLabel(val)}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Action",
            align: "center",
            render: (_val, row) => (
                <div className="flex items-center justify-center gap-2">
                    <Link
                        to={`/assessment/assessments/edit/${row.id}`}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all inline-flex"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <Meta title="Assessments" description="Manage Assessments" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-xl">
                            <ClipboardCheck className="w-8 h-8 text-blue-600" />
                        </div>
                        Assessments
                    </h1>
                    <p className="text-slate-500 mt-1">Manage and view all assessments</p>
                </div>
                <Link
                    to="/assessment/assessments/add"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Assessment
                </Link>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by title or course..."
                            className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto items-center">
                        <span className="text-xs text-slate-400">{totalCount} assessment{totalCount !== 1 ? 's' : ''}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <DataTable
                columns={columns}
                data={assessments}
                loading={loading}
                emptyMessage="No assessments found"
                currentPage={currentPage}
                limit={limit}
            />

            <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                limit={limit}
                onPageChange={setCurrentPage}
                onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setCurrentPage(1);
                }}
            />


        </div>
    );
};

export default AssessmentList;
