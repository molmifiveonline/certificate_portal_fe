import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";
import { Plus, Search, Edit, Trash2, FileText } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { toast } from "sonner";
import { debounce } from "lodash";
import { systemManualCategoryService } from "../../services/systemManualCategoryService";
import SystemManualCategoryForm from "./SystemManualCategoryForm";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
import { useAuth } from "../../context/AuthContext";

const SystemManualCategoryList = () => {
    const { hasPermission } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");

    // Modal States
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

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

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: limit,
                sort_by: sortBy,
                sort_order: sortOrder,
            };
            if (debouncedSearch.trim()) {
                params.search = debouncedSearch.trim();
            }
            const response = await systemManualCategoryService.getCategories(params);

            if (response.success && response.data) {
                const result = response.data;
                setCategories(Array.isArray(result.data) ? result.data : []);
                setTotalPages(result.totalPages || 1);
                setTotalCount(result.total || 0);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error(getErrorMessage(error, "Failed to load system manual categories"));
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch, limit, sortBy, sortOrder]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setShowFormModal(true);
    };

    const handleCreate = () => {
        setSelectedCategory(null);
        setShowFormModal(true);
    };

    const handleDeleteClick = (category) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;

        try {
            await systemManualCategoryService.deleteCategory(categoryToDelete.id);
            toast.success("System manual category deleted successfully");
            fetchCategories();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error(getErrorMessage(error, "Failed to delete category"));
        } finally {
            setShowDeleteModal(false);
            setCategoryToDelete(null);
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
            key: "name",
            label: "Name",
            sortable: true,
            render: (val) => <span className="font-semibold text-slate-800">{val}</span>,
        },
        {
            key: "description",
            label: "Description",
            render: (val) => (
                <div 
                    className="text-slate-600 text-sm max-w-md truncate" 
                    dangerouslySetInnerHTML={{ __html: val || "-" }}
                />
            ),
        },
        {
            key: "actions",
            label: "Actions",
            align: "right",
            render: (_val, row) => (
                <div className="flex items-center justify-end gap-2">
                    {hasPermission("manage_system_manuals") && (
                        <>
                            <button
                                onClick={() => handleEdit(row)}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                                title="Edit Category"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteClick(row)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                                title="Delete Category"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <Meta title="System Manual Categories" description="Manage System Manual Categories" />
            <PageHeader
                title="System Manual Categories"
                subtitle="Manage categories to organize system documents, forms and policy files."
                icon={FileText}
                actions={
                    hasPermission("manage_system_manuals") ? (
                        <Button
                            onClick={handleCreate}
                            className="px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Add Category
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
                            placeholder="Search categories..."
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
                    data={categories}
                    loading={loading}
                    emptyMessage="No categories found."
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

            <SystemManualCategoryForm
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                initialData={selectedCategory}
                onSuccess={fetchCategories}
            />

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete System Manual Category"
                message={`Are you sure you want to delete category "${categoryToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default SystemManualCategoryList;
