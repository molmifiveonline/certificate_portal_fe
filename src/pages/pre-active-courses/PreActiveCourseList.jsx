import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Mail, Send, CheckCircle, RefreshCw, Calendar, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import preActiveCourseService from "../../services/preActiveCourseService";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import TablePagination from "../../components/ui/TablePagination";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { useAuth } from "../../context/AuthContext";
import Meta from "../../components/common/Meta";
import CourseImportPreviewModal from "../../components/pre-active-courses/CourseImportPreviewModal";
import { Zap } from "lucide-react";

const PreActiveCourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [notifyModalOpen, setNotifyModalOpen] = useState(false);
    const [courseToNotify, setCourseToNotify] = useState(null);
    const [notifyType, setNotifyType] = useState(""); // 'nominator' or 'candidate'
    const [convertModalOpen, setConvertModalOpen] = useState(false);
    const [courseToConvert, setCourseToConvert] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const navigate = useNavigate();
    const { user } = useAuth();
    const limit = 10;

    const breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Pre-Active Courses", href: "/pre-active-courses" },
    ];

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await preActiveCourseService.getAll({
                page: currentPage,
                limit,
                search: searchTerm,
            });
            setCourses(response.data || []);
            if (response.meta) {
                setTotalPages(response.meta.totalPages);
            }
        } catch (error) {
            toast.error("Failed to fetch pre-active courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [currentPage, searchTerm]);

    const handleDeleteClick = (course) => {
        setCourseToDelete(course);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await preActiveCourseService.delete(courseToDelete.id);
            toast.success("Pre-Active course deleted successfully");
            setDeleteModalOpen(false);
            fetchCourses();
        } catch (error) {
            toast.error(error.message || "Failed to delete course");
        }
    };

    const handleNotifyClick = (course, type) => {
        setCourseToNotify(course);
        setNotifyType(type);
        setNotifyModalOpen(true);
    };

    const handleConfirmNotify = async () => {
        try {
            if (notifyType === 'nominator') {
                const res = await preActiveCourseService.notifyNominators(courseToNotify.id);
                toast.success(res.message || "Emails sent to nominators");
            } else if (notifyType === 'candidate') {
                const res = await preActiveCourseService.notifyCandidates(courseToNotify.id);
                toast.success(res.message || "Emails sent to candidates");
            }
            setNotifyModalOpen(false);
        } catch (error) {
            toast.error(`Failed to notify ${notifyType}s`);
        }
    };

    const handleConvertClick = (course) => {
        setCourseToConvert(course);
        setConvertModalOpen(true);
    };

    const handleConfirmConvert = async () => {
        try {
            await preActiveCourseService.convertToActiveCourse(courseToConvert.id);
            toast.success("Converted to Active Course successfully");
            setConvertModalOpen(false);
            fetchCourses();
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to convert course";
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-8">
            <Meta title="Pre-Active Courses" description="Manage courses before they become active" />

            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex items-center justify-between shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Pre-Active Courses</h1>
                    <p className="text-sm text-slate-500">Manage courses before they become active</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowPreviewModal(true)}
                        className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold shadow-sm flex items-center gap-2 active:scale-95"
                    >
                        <Zap className="w-4 h-4 text-amber-500" />
                        Sync API
                    </Button>
                    <Link to="/pre-active-courses/add">
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all active:scale-95">
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Course
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto p-8 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-10 rounded-lg border-slate-200 focus:ring-blue-500/10 focus:border-blue-500"
                            />
                        </div>
                        <div className="text-sm text-slate-500 font-medium">
                            Total: {courses.length} Courses
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr className="text-slate-600 font-semibold">
                                    <th className="px-6 py-4">Course ID</th>
                                    <th className="px-6 py-4">Course Name</th>
                                    <th className="px-6 py-4 text-center">Dates</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                                <span>Loading courses...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : courses.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                                            No pre-active courses found
                                        </td>
                                    </tr>
                                ) : (
                                    courses.map((course) => (
                                        <tr key={course.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                                                    {course.course_id}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-800">{course.course_name}</div>
                                                <div className="text-xs text-slate-500 capitalize">{course.topic}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-2 text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-xs font-medium">
                                                    <Calendar size={12} className="text-slate-400" />
                                                    {new Date(course.start_date).toLocaleDateString()} - {new Date(course.end_date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleNotifyClick(course, 'nominator')}
                                                        className="h-9 w-9 p-0 border-blue-100 text-blue-600 hover:bg-blue-50"
                                                        title="Notify Nominators"
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleNotifyClick(course, 'candidate')}
                                                        className="h-9 w-9 p-0 border-purple-100 text-purple-600 hover:bg-purple-50"
                                                        title="Notify Candidates"
                                                    >
                                                        <Send className="h-4 w-4" />
                                                    </Button>
                                                    <Link to={`/pre-active-courses/${course.id}/approvals`}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-9 w-9 p-0 border-green-100 text-green-600 hover:bg-green-50"
                                                            title="View Candidate Approvals"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleConvertClick(course)}
                                                        className="h-9 px-3 border-orange-100 text-orange-600 hover:bg-orange-50 gap-2 font-semibold"
                                                        title="Convert to Active Course"
                                                    >
                                                        <RefreshCw className="h-3.5 w-3.5" />
                                                        <span>Convert</span>
                                                    </Button>
                                                    <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
                                                    <Link to={`/pre-active-courses/edit/${course.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDeleteClick(course)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!loading && courses.length > 0 && (
                        <div className="p-4 border-t border-gray-100">
                            <TablePagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalCount={courses.length * totalPages} // Approximation or precise if available
                                limit={limit}
                            />
                        </div>
                    )}
                </div>

                <ConfirmationModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Pre-Active Course"
                    message={`Are you sure you want to delete the course "${courseToDelete?.course_name}"? This action cannot be undone.`}
                    confirmText="Delete"
                    variant="danger"
                />

                <ConfirmationModal
                    isOpen={notifyModalOpen}
                    onClose={() => setNotifyModalOpen(false)}
                    onConfirm={handleConfirmNotify}
                    title={`Notify ${notifyType === 'nominator' ? 'Nominators' : 'Candidates'}`}
                    message={`Are you sure you want to send email notifications to all ${notifyType === 'nominator' ? 'nominators' : 'pending candidates'} for "${courseToNotify?.course_name}"?`}
                    confirmText="Send Emails"
                    variant="primary"
                />

                <ConfirmationModal
                    isOpen={convertModalOpen}
                    onClose={() => setConvertModalOpen(false)}
                    onConfirm={handleConfirmConvert}
                    title="Convert to Active Course"
                    message={`Are you sure you want to convert "${courseToConvert?.course_name}" to an Active Course? This action cannot be reversed.`}
                    confirmText="Convert"
                    variant="primary"
                />

                <CourseImportPreviewModal
                    isOpen={showPreviewModal}
                    onClose={() => setShowPreviewModal(false)}
                    onImportSuccess={fetchCourses}
                />

            </div>
        </div>
    );
};

export default PreActiveCourseList;
