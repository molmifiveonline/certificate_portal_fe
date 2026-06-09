import { debounce } from "lodash";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    FileText,
    Download,
    ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { systemManualService } from "../../services/systemManualService";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const SystemManualList = () => {
    const { hasPermission } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const updateDebouncedSearch = useMemo(
        () =>
            debounce((value) => {
                setDebouncedSearch(value);
                setCurrentPage(1);
            }, 500),
        []
    );

    useEffect(() => {
        updateDebouncedSearch(searchTerm);
    }, [searchTerm, updateDebouncedSearch]);
    const [manuals, setManuals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [manualToDelete, setManualToDelete] = useState(null);
    const navigate = useNavigate();

    const fetchManuals = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit,
                sort_by: sortBy,
                sort_order: sortOrder,
            };
            if (debouncedSearch.trim()) {
                params.search = debouncedSearch.trim();
            }
            const response = await systemManualService.getSystemManuals(params);

            if (response.success && response.data) {
                const result = response.data;
                setManuals(Array.isArray(result.data) ? result.data : []);
                setTotalPages(result.totalPages || 1);
                setTotalCount(result.total || 0);
                setCurrentPage(result.page || 1);
            } else {
                setManuals([]);
            }
        } catch (error) {
            console.error("Error fetching system manuals:", error);
            toast.error(getErrorMessage(error, "Failed to load system manuals."));
            setManuals([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, sortBy, sortOrder, debouncedSearch]);

    useEffect(() => {
        fetchManuals();
    }, [fetchManuals]);

    

    const handleDelete = (id) => {
        setManualToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!manualToDelete) return;
        try {
            await systemManualService.deleteSystemManual(manualToDelete);
            toast.success("System manual deleted successfully.");
            fetchManuals();
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to delete system manual."));
        } finally {
            setDeleteModalOpen(false);
            setManualToDelete(null);
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

    const handleActionClick = async (row) => {
        if (row.document_type === 'file' && row.file_name) {
            const fileUrl = `${API_URL}/uploads/system_manual/${row.file_name}`;
            try {
                const response = await fetch(fileUrl);
                if (!response.ok) throw new Error("Network response was not ok");
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = blobUrl;
                link.setAttribute('download', row.file_original_name || row.file_name);
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error("Download failed:", error);
                // Fallback to direct URL if fetch fails
                window.open(fileUrl, "_blank");
            }
        } else if (row.document_type === 'url' && row.url_link) {
            window.open(row.url_link, "_blank");
        } else {
            toast.error("Document link not found.");
        }
    }

    const columns = [
        {
            key: "title",
            label: "Title",
            sortable: true,
            render: (val) => <span className="font-semibold text-slate-800">{val}</span>,
        },
        {
            key: "document_type",
            label: "Type",
            sortable: true,
            render: (val) => (
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${val === 'file' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                    {val === 'file' ? 'DOCUMENT' : 'URL'}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            align: "right",
            render: (_val, row) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => handleActionClick(row)}
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-all"
                        title={row.document_type === 'file' ? "Download Document" : "View URL"}
                    >
                        {row.document_type === 'file' ? (
                            <Download className="w-4 h-4" />
                        ) : (
                            <ExternalLink className="w-4 h-4" />
                        )}
                    </button>
                    {hasPermission("manage_system_manuals") && (
                        <>
                            <button
                                onClick={() => navigate(`/system-manual/edit/${row.id}`)}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                                title="Edit Manual"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(row.id)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                                title="Delete Manual"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            ),
        }
    ];

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <Meta title="System Manuals" description="Manage System Manuals" />
            <PageHeader
                title="System Manual"
                subtitle="Manage system documents, forms and policy files."
                icon={FileText}
                actions={
                    hasPermission("manage_system_manuals") ? (
                        <Button
                            onClick={() => navigate('/system-manual/create')}
                            className="px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Add Manual
                        </Button>
                    ) : null
                }
            />

            {/* Filter Bar */}
            <Card className="rounded-3xl border border-slate-200 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10 transition-all hover:shadow-xl">
                <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search manuals by title..."
                            className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto items-center bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                        <span className="text-sm font-medium text-slate-500">
                            <span className="text-indigo-600 font-bold mr-1">{totalCount}</span>
                            record{totalCount !== 1 ? 's' : ''} found
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={manuals}
                    loading={loading}
                    emptyMessage="No system manuals found."
                    currentPage={currentPage}
                    limit={limit}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                />
            </div>

            <div className="mt-6">
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
                title="Delete System Manual"
                message="Are you sure you want to delete this system manual? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default SystemManualList;


