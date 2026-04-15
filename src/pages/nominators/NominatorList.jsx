import React, { useState, useEffect, useCallback } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import PageHeader from "../../components/common/PageHeader";
import Meta from "../../components/common/Meta";
import {
    Search,
    UserPlus,
    Edit,
    Trash2,
    Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import TablePagination from "../../components/ui/TablePagination";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import nominatorService from "../../services/nominatorService";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

const NominatorList = () => {
    const { hasPermission } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [nominators, setNominators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [nominatorToDelete, setNominatorToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const navigate = useNavigate();

    const fetchNominators = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page: currentPage, limit };
            if (searchTerm.trim()) params.search = searchTerm.trim();

            const result = await nominatorService.getAllNominators(params);
            setNominators(Array.isArray(result.data) ? result.data : []);
            setTotalPages(result.totalPages || 1);
            setTotalCount(result.total || 0);
        } catch (error) {
            console.error("Error fetching nominators:", error);
            toast.error(getErrorMessage(error, "Failed to load nominators."));
            setNominators([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, searchTerm]);

    useEffect(() => {
        fetchNominators();
    }, [fetchNominators]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleDelete = (id) => {
        setNominatorToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!nominatorToDelete) return;
        try {
            await nominatorService.deleteNominator(nominatorToDelete);
            toast.success("Nominator deleted successfully.");
            fetchNominators();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error(getErrorMessage(error, "Failed to delete nominator."));
        } finally {
            setDeleteModalOpen(false);
            setNominatorToDelete(null);
        }
    };

    const columns = [
        {
            key: "first_name",
            label: "Name",
            sortable: true,
            render: (_val, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                        {(row.first_name?.[0] || row.name?.[0] || "N").toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                        {[row.first_name, row.last_name].filter(Boolean).join(" ") || row.name}
                    </span>
                </div>
            ),
        },
        {
            key: "email",
            label: "Email",
            sortable: true,
        },
        {
            key: "mobile",
            label: "Mobile",
            sortable: true,
            render: (value) => value || "-",
        },
        {
            key: "location",
            label: "Location",
            sortable: true,
            render: (value) => value || "-",
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (value) => (
                <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        Number(value) === 1
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            Number(value) === 1 ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                    />
                    {Number(value) === 1 ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            align: "right",
            render: (_val, row) => (
                <div className="flex items-center justify-end gap-2">
                    {hasPermission('edit_nominator') && (
                        <button
                            onClick={() => navigate(`/nominators/edit/${row.id}`)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                            title="Edit Nominator"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                    {hasPermission('delete_nominator') && (
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                            title="Delete Nominator"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
        }
    ];

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <Meta title="Nominators" description="Manage Nominators" />
            <PageHeader
                title="Nominators"
                subtitle="Manage all nominators"
                icon={Users}
                actions={hasPermission('create_nominator') && (
                    <Button
                        onClick={() => navigate('/nominators/add')}
                        className="px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Nominator
                    </Button>
                )}
            />

            {/* Filter Bar */}
            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, mobile, or location..."
                            className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto items-center">
                        <span className="text-xs text-slate-400">{totalCount} nominator{totalCount !== 1 ? 's' : ''}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <DataTable
                columns={columns}
                data={nominators}
                loading={loading}
                emptyMessage="No nominators found."
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

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Nominator"
                message="Are you sure you want to delete this nominator? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default NominatorList;
