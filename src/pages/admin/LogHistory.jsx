import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Search, RotateCw, Trash2, History } from "lucide-react";
import logService from "../../services/logService";
import Meta from "../../components/common/Meta";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { Card, CardContent } from "../../components/ui/card";
import TablePagination from "../../components/ui/TablePagination";
import debounce from "lodash/debounce";
import { formatDateTime } from "../../lib/utils/dateUtils";

const LogHistory = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalLogs, setTotalLogs] = useState(0);

    // Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [logToDelete, setLogToDelete] = useState(null);

    const fetchLogs = async (page, limit, search) => {
        setLoading(true);
        try {
            const response = await logService.getLogs({ page, limit, search });
            // API returns { data: [], meta: { total, page, limit, totalPages } }
            // Or if it returns just array, we need to handle that.
            // Based on my LogDao update, it returns { data, meta }

            if (response.data && response.meta) {
                setLogs(response.data);
                setTotalLogs(response.meta.total);
            } else {
                // Fallback if API structure is different (e.g. old array format)
                setLogs(Array.isArray(response) ? response : []);
                setTotalLogs(Array.isArray(response) ? response.length : 0);
            }

        } catch (error) {
            console.error("Failed to fetch logs:", error);
            toast.error("Failed to load log history");
        } finally {
            setLoading(false);
        }
    };

    // Debounced Search
    const debouncedFetch = useCallback(
        debounce((page, limit, search) => {
            fetchLogs(page, limit, search);
        }, 500),
        []
    );

    // Initial Load & Param Changes
    useEffect(() => {
        fetchLogs(currentPage, itemsPerPage, searchTerm);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, itemsPerPage]); // Search is handled separately via debounce

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1); // Reset to page 1 on search
        debouncedFetch(1, itemsPerPage, value);
    };

    const handleRefresh = () => {
        fetchLogs(currentPage, itemsPerPage, searchTerm);
    };

    const handleDeleteClick = (id) => {
        setLogToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!logToDelete) return;

        setIsDeleting(true);
        try {
            await logService.deleteLog(logToDelete);
            toast.success("Log deleted successfully");
            // Refresh logs to keep pagination correct
            fetchLogs(currentPage, itemsPerPage, searchTerm);
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Failed to delete log:", error);
            toast.error("Failed to delete log");
        } finally {
            setIsDeleting(false);
            setLogToDelete(null);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleLimitChange = (limit) => {
        setItemsPerPage(limit);
        setCurrentPage(1);
    };

    // Calculate total pages for pagination component
    const totalPages = Math.ceil(totalLogs / itemsPerPage);

    if (loading && logs.length === 0) return <LoadingSpinner />;



    return (
        <div className="flex-1 overflow-y-auto">
            <Meta title="Log History" description="View System Logs" />
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Log History</h1>
                    <p className="text-slate-500 mt-1">View and manage system activity logs</p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="bg-white border border-slate-200/60 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
                >
                    <RotateCw className="w-4 h-4" />
                    Refresh Logs
                </button>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by action, details, user..."
                            className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="h-10 px-4 bg-white/50 border border-slate-200/60 rounded-xl flex items-center gap-2 text-slate-500 text-sm font-medium">
                            <History className="w-4 h-4" />
                            <span>Total Logs: {totalLogs}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-xl overflow-hidden flex flex-col mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/40 border-b border-slate-200/60">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date/Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/40 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                                            {formatDateTime(log.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate" title={log.details}>
                                            {log.details || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                                            {log.user_name || "System"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                                            {log.ip_address || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button
                                                onClick={() => handleDeleteClick(log.id)}
                                                className="p-1 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                title="Delete Log"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalLogs > 0 && (
                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCount={totalLogs}
                        limit={itemsPerPage}
                        onLimitChange={handleLimitChange}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Log Entry"
                message="Are you sure you want to delete this log entry? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default LogHistory;
