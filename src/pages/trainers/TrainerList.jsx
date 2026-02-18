import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../components/common/Meta";
import {
    Search,
    Download,
    RefreshCcw,
    UserPlus,
    Edit,
    Trash2,
    UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
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

    const columns = [
        {
            key: "first_name",
            label: "Trainer Name",
            sortable: true,
            render: (_val, row) => (
                <div className="flex items-center gap-3">
                    {row.profile_photo ? (
                        <img
                            src={`http://localhost:8000/uploads/trainer/${row.profile_photo}`}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                            {row.first_name?.[0]}{row.last_name?.[0]}
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800">
                            {row.prefix} {row.first_name} {row.last_name}
                        </span>
                        <span className="text-xs text-slate-500">{row.email}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "digital_signature",
            label: "Signature",
            hiddenOnMobile: true,
            render: (val, row) => val ? (
                <img
                    src={`http://localhost:8000/uploads/trainer/${val}`}
                    alt="Signature"
                    className="h-10 object-contain border border-slate-200 rounded bg-white"
                />
            ) : (
                <span className="text-xs text-slate-400 italic">No signature</span>
            ),
        },
        {
            key: "designation",
            label: "Designation",
            sortable: true,
            hiddenOnMobile: true,
        },
        {
            key: "rank",
            label: "Rank",
            hiddenOnTablet: true,
        },
        {
            key: "nationality",
            label: "Nationality",
            hiddenOnTablet: true,
        },
        {
            key: "actions",
            label: "Actions",
            align: "right",
            render: (_val, row) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => navigate(`/trainer/edit/${row.id}`)}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                        title="Edit Trainer"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                        title="Delete Trainer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <Meta title="Trainers" description="Manage Trainers" />
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-xl">
                            <UserCheck className="w-8 h-8 text-blue-600" />
                        </div>
                        Trainers
                    </h1>
                    <p className="text-slate-500 mt-1">Manage and view all registered trainers</p>
                </div>
                <Button
                    onClick={() => navigate('/trainer/create')}
                    className="px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95"
                >
                    <UserPlus className="w-4 h-4" />
                    Add Trainer
                </Button>
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
                            onClick={fetchTrainers}
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
                data={trainers}
                loading={loading}
                emptyMessage="No trainers found."
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
