import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../components/common/Meta";
import {
    Search,
    Download,
    RefreshCcw,
    UserPlus,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import TablePagination from "../../components/ui/TablePagination";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import api from "../../lib/api";
import { toast } from "sonner";

const TrainerList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState("first_name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [trainerToDelete, setTrainerToDelete] = useState(null);
    const navigate = useNavigate();

    const fetchTrainers = useCallback(async () => {
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
            const response = await api.get('/trainer', { params });
            const result = response.data;

            setTrainers(Array.isArray(result.data) ? result.data : []);
            setTotalPages(result.totalPages || 1);
            setTotalCount(result.totalCount || 0);
            setCurrentPage(result.page || 1);
        } catch (error) {
            console.error("Error fetching trainers:", error);
            toast.error("Failed to load trainers.");
            setTrainers([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, sortBy, sortOrder, searchTerm]);

    useEffect(() => {
        fetchTrainers();
    }, [fetchTrainers]);

    // Debounced search: reset to page 1 when search changes
    useEffect(() => {
        const timeout = setTimeout(() => {
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const handleExport = async () => {
        try {
            const response = await api.get('/trainer/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'trainers.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error("Failed to export data.");
        }
    };

    const handleDelete = (id) => {
        setTrainerToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!trainerToDelete) return;
        try {
            await api.delete(`/trainer/delete/${trainerToDelete}`);
            toast.success("Trainer deleted successfully.");
            fetchTrainers();
        } catch (error) {
            toast.error("Failed to delete trainer.");
        } finally {
            setDeleteModalOpen(false);
            setTrainerToDelete(null);
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

    // Pagination range
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };



    return (
        <div className="flex-1 overflow-y-auto w-full">
            <Meta title="Trainers" description="Manage Trainers" />
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Trainers</h1>
                    <p className="text-slate-500 mt-1">Manage and view all registered trainers</p>
                </div>
                <button
                    onClick={() => navigate('/trainer/create')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95">
                    <UserPlus className="w-4 h-4" />
                    Add Trainer
                </button>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, designation..."
                            className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto items-center">
                        <span className="text-xs text-slate-400">{totalCount} trainer{totalCount !== 1 ? 's' : ''}</span>
                        <button
                            onClick={handleExport}
                            className="h-10 px-4 bg-white/50 border border-slate-200/60 hover:bg-white/80 rounded-xl flex items-center gap-2 text-slate-600 text-sm font-medium transition-all">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button
                            onClick={fetchTrainers}
                            className="h-10 w-10 bg-white/50 border border-slate-200/60 hover:bg-white/80 rounded-xl flex items-center justify-center text-slate-600 transition-all">
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Trainers Table */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/40 border-b border-slate-200/60">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sr</th>
                                <SortableHeader column="first_name" label="Trainer Name" />
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Signature</th>
                                <SortableHeader column="designation" label="Designation" />
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nationality</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <RefreshCcw className="w-4 h-4 animate-spin" />
                                            Loading...
                                        </div>
                                    </td>
                                </tr>
                            ) : trainers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No trainers found.
                                    </td>
                                </tr>
                            ) : (
                                trainers.map((trainer, index) => (
                                    <tr key={trainer.id} className="hover:bg-white/40 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                            {(currentPage - 1) * limit + index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {trainer.profile_photo ? (
                                                    <img
                                                        src={`http://localhost:8000/uploads/trainer/${trainer.profile_photo}`}
                                                        alt="Profile"
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                                                        {trainer.first_name?.[0]}{trainer.last_name?.[0]}
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-800">
                                                        {trainer.prefix} {trainer.first_name} {trainer.last_name}
                                                    </span>
                                                    <span className="text-xs text-slate-500">{trainer.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {trainer.digital_signature ? (
                                                <img
                                                    src={`http://localhost:8000/uploads/trainer/${trainer.digital_signature}`}
                                                    alt="Signature"
                                                    className="h-10 object-contain border border-slate-200 rounded bg-white"
                                                />
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">No signature</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {trainer.designation}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {trainer.rank}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {trainer.nationality}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/trainer/edit/${trainer.id}`)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                    title="Edit Trainer"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(trainer.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                    title="Delete Trainer"
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

                {/* Pagination */}
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
                title="Delete Trainer"
                message="Are you sure you want to delete this trainer? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default TrainerList;
