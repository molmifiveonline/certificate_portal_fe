import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../components/common/Meta";
import {
    Search,
    Download,
    RefreshCcw,
    Plus,
    Edit,
    GraduationCap,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button, buttonVariants } from "../../components/ui/button";
import { cn } from "../../lib/utils/utils";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";

import api from "../../lib/api";
import { toast } from "sonner";

const MasterCourseList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState("master_course_name");
    const [sortOrder, setSortOrder] = useState("asc");

    const navigate = useNavigate();

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit,
                sort_by: sortBy,
                sort_order: sortOrder,
            };
            if (searchTerm.trim()) {
                params.search = searchTerm.trim();
            }
            const response = await api.get('/master-courses', { params });
            const result = response.data;

            setCourses(Array.isArray(result.data) ? result.data : []);
            setTotalPages(Math.ceil((result.total || 0) / limit));
            setTotalCount(result.total || 0);
        } catch (error) {
            console.error("Error fetching master courses:", error);
            toast.error("Failed to load master courses.");
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, sortBy, sortOrder, searchTerm]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const handleExport = async () => {
        if (!courses.length) {
            toast.error('No courses to export');
            return;
        }

        try {
            const headers = ['Sr No.', 'Topic', 'Course Name', 'Created At'];
            const csvContent = [
                headers.join(','),
                ...courses.map((course, index) => [
                    (currentPage - 1) * limit + index + 1,
                    `"${course.topic}"`,
                    `"${course.master_course_name}"`,
                    new Date(course.created_at).toLocaleDateString()
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `master-courses-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error("Failed to export.");
        }
    };





    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
        setCurrentPage(1);
    };

    const columns = [
        {
            key: "topic",
            label: "Topic",
            sortable: true,
            render: (val) => <span className="font-medium text-slate-800">{val}</span>,
        },
        {
            key: "master_course_name",
            label: "Course Name",
            sortable: true,
        },
        {
            key: "created_at",
            label: "Created At",
            sortable: true,
            render: (val) => new Date(val).toLocaleDateString(),
        },
        {
            key: "actions",
            label: "Actions",
            align: "right",
            render: (_val, row) => (
                <div className="flex items-center justify-end gap-2">
                    <Link
                        to={`/courses/edit/${row.id}`}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
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
            <Meta title="Master Courses" description="Manage Master Courses" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-xl">
                            <GraduationCap className="w-8 h-8 text-blue-600" />
                        </div>
                        Master Courses
                    </h1>
                    <p className="text-slate-500 mt-1">Manage and view all master courses</p>
                </div>
                <Link
                    to="/courses/add"
                    className={cn(buttonVariants({ variant: "default" }), "px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95 h-auto")}
                >
                    <Plus className="w-4 h-4" />
                    Add Master Course
                </Link>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto items-center">
                        <span className="text-xs text-slate-400">{totalCount} course{totalCount !== 1 ? 's' : ''}</span>
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            className="h-10 px-4 bg-white/50 border-slate-200/60 hover:bg-white/80 rounded-xl text-slate-600 font-bold"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={fetchCourses}
                            className="h-10 w-10 bg-white/50 border-slate-200/60 hover:bg-white/80 rounded-xl text-slate-600"
                        >
                            <RefreshCcw className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <DataTable
                columns={columns}
                data={courses}
                loading={loading}
                emptyMessage="No master courses found."
                currentPage={currentPage}
                limit={limit}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
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

export default MasterCourseList;
