import React, { useState, useEffect, useMemo } from "react";
import { X, CheckCircle2, AlertCircle, Loader2, Info, RefreshCcw, BookOpen } from 'lucide-react';
import { Button } from "../ui/Button";
import DataTable from "../ui/DataTable";
import TablePagination from "../ui/TablePagination";
import { toast } from "sonner";
import preActiveCourseService from "../../services/preActiveCourseService";

const CourseImportPreviewModal = ({ isOpen, onClose, onImportSuccess }) => {
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const fetchPreview = React.useCallback(async () => {
        setLoading(true);
        try {
            const result = await preActiveCourseService.fetchExternalCourses();
            setPreviewData(result.data || []);
            setCurrentPage(1); // Reset to first page on new fetch
        } catch (error) {
            console.error("Preview fetch error:", error);
            toast.error("Failed to fetch courses from API. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchPreview();
        }
    }, [isOpen, fetchPreview]);

    const handleImport = async () => {
        setImporting(true);
        const toastId = toast.loading("Importing courses...");
        try {
            const result = await preActiveCourseService.confirmBulkImport({ courses: previewData });
            toast.success(
                `Import successful! ${result.stats.inserted} new, ${result.stats.updated} updated.`,
                { id: toastId }
            );
            onImportSuccess();
            onClose();
        } catch (error) {
            console.error("Import error:", error);
            toast.error(error.response?.data?.message || "Failed to import courses", { id: toastId });
        } finally {
            setImporting(false);
        }
    };

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * limit;
        return previewData.slice(startIndex, startIndex + limit);
    }, [previewData, currentPage, limit]);

    const totalPages = Math.ceil(previewData.length / limit) || 1;

    if (!isOpen) return null;

    const columns = [
        {
            key: "isExisting",
            label: "Status",
            render: (isExisting) => (
                <div className="flex items-center gap-2">
                    {isExisting ? (
                        <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-100 uppercase tracking-tighter">
                            <AlertCircle className="w-3 h-3" /> Existing
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-100 uppercase tracking-tighter">
                            <CheckCircle2 className="w-3 h-3" /> New
                        </span>
                    )}
                </div>
            ),
        },
        { key: "course_id", label: "Course ID" },
        { 
            key: "course_name", 
            label: "Course Name",
            className: "whitespace-normal min-w-[250px]",
            render: (val) => <span className="font-semibold text-slate-800">{val}</span>
        },
        { 
            key: "topic", 
            label: "Topic",
            className: "whitespace-normal min-w-[200px]"
        },
        { 
            key: "start_date", 
            label: "Start Date",
            render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A'
        },
        { 
            key: "end_date", 
            label: "End Date",
            render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A'
        },
        { key: "days", label: "Days" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl w-full max-w-6xl overflow-hidden transform transition-all scale-100 border border-white/40 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-100 p-2.5 rounded-2xl text-indigo-600 shadow-sm">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Preview Course API Import</h3>
                            <p className="text-sm text-slate-500 font-medium">{previewData.length} scheduled courses found</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={fetchPreview}
                            disabled={loading}
                            className="bg-white p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-50 shadow-sm active:scale-95"
                            title="Refresh data"
                        >
                            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        <button
                            onClick={onClose}
                            disabled={importing}
                            className="text-slate-400 hover:text-slate-600 transition-all p-2 rounded-full hover:bg-slate-100 active:scale-90"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-8 py-6 flex-1 overflow-y-auto bg-white/50">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800 leading-relaxed font-medium">
                            Review scheduled courses before import. Existing courses (marked in <span className="font-bold text-amber-600 underline">Amber</span>) will be updated with the latest details from the API. New courses will be added to the pre-active list.
                        </p>
                    </div>
                    
                    <div className="mb-4">
                        <DataTable
                            columns={columns}
                            data={paginatedData}
                            loading={loading}
                            rowKey="course_id"
                            limit={limit}
                        />
                    </div>

                    {!loading && previewData.length > 0 && (
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalCount={previewData.length}
                            onPageChange={setCurrentPage}
                            limit={limit}
                            onLimitChange={setLimit}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <Button 
                        variant="outline" 
                        onClick={onClose} 
                        disabled={importing || loading}
                        className="px-6 py-2.5 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-white active:scale-95"
                    >
                        Cancel
                    </Button>
                    <div className="flex items-center gap-4">
                        {(importing || loading) && (
                            <div className="flex items-center gap-2 text-indigo-600 font-semibold animate-pulse">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {loading ? "Fetching from MOLMI Course Planner..." : "Processing Import..."}
                            </div>
                        )}
                        <Button
                            onClick={handleImport}
                            disabled={importing || loading || !previewData.length}
                            className="px-10 py-3 rounded-xl font-extrabold shadow-xl shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110 active:scale-95 transition-all flex items-center gap-3 text-white border-none"
                        >
                            Sync & Import Courses
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseImportPreviewModal;

