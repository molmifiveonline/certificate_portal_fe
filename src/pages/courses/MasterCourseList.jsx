import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../components/common/Meta";
import {
    Search,
    Download,
    RefreshCcw,
    Plus,
    Edit,
    Trash2,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import TablePagination from "../../components/ui/TablePagination";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
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
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
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

    // Debounced search: reset to page 1 when search changes
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

    const handleDelete = (id) => {
        setCourseToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        try {
            await api.delete(`/master-courses/${courseToDelete}`);
            toast.success("Master Course deleted successfully.");
            fetchCourses();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete master course.");
        } finally {
            setDeleteModalOpen(false);
            setCourseToDelete(null);
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

    const SortIcon = ({ column }) => {
        if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
        return sortOrder === "asc"
            ? <ArrowUp className="w-3 h-3 ml-1 text-blue-600" />
            : <ArrowDown className="w-3 h-3 ml-1 text-blue-600" />;
    };

    const SortableHeader = ({ column, label }) => (
        <th
            className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none"
            onClick={() => handleSort(column)}
        >
            <div className="flex items-center">
                {label}
                <SortIcon column={column} />
            </div>
        </th>
    );

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <Meta title="Master Courses" description="Manage Master Courses" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Master Courses</h1>
                    <p className="text-slate-500 mt-1">Manage and view all master courses</p>
                </div>
                <Link
                    to="/courses/add"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95"
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
                        <button
                            onClick={handleExport}
                            className="h-10 px-4 bg-white/50 border border-slate-200/60 hover:bg-white/80 rounded-xl flex items-center gap-2 text-slate-600 text-sm font-medium transition-all">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button
                            onClick={fetchCourses}
                            className="h-10 w-10 bg-white/50 border border-slate-200/60 hover:bg-white/80 rounded-xl flex items-center justify-center text-slate-600 transition-all">
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Courses Table */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/40 border-b border-slate-200/60">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sr</th>
                                <SortableHeader column="topic" label="Topic" />
                                <SortableHeader column="master_course_name" label="Course Name" />
                                <SortableHeader column="created_at" label="Created At" />
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <RefreshCcw className="w-4 h-4 animate-spin" />
                                            Loading...
                                        </div>
                                    </td>
                                </tr>
                            ) : courses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No master courses found.
                                    </td>
                                </tr>
                            ) : (
                                courses.map((course, index) => (
                                    <tr key={course.id} className="hover:bg-white/40 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                            {(currentPage - 1) * limit + index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                                            {course.topic}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {course.master_course_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {new Date(course.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/courses/edit/${course.id}`}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(course.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

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

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Master Course"
                message="Are you sure you want to delete this master course? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default MasterCourseList;
