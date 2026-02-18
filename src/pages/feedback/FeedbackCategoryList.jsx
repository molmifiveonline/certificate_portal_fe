import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../components/common/Meta";
import { Plus, Search, Edit, Trash2, MessageSquare } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "sonner";
import { debounce } from "lodash";
import feedbackCategoryService from "../../services/feedbackCategoryService";
import FeedbackCategoryForm from "./FeedbackCategoryForm";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";

const FeedbackCategoryList = () => {
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

    const updateDebouncedSearch = useCallback(
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
            const result = await feedbackCategoryService.getAll({
                search: debouncedSearch,
                page: currentPage,
                limit: limit,
                sort_by: sortBy,
                sort_order: sortOrder,
            });

            setCategories(result.data);
            setTotalPages(result.totalPages);
            setTotalCount(result.totalCount);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Failed to load feedback categories");
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
            await feedbackCategoryService.delete(categoryToDelete.id);
            toast.success("Feedback category deleted successfully");
            fetchCategories();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete feedback category");
        } finally {
            setShowDeleteModal(false);
            setCategoryToDelete(null);
        }
    };

    const columns = [
        {
            key: "name",
            label: "Name",
            render: (val) => <span className="font-medium text-slate-700">{val}</span>,
        },
        {
            key: "actions",
            label: "Actions",
            render: (_val, row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-all"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row)}
                        className="p-1.5 rounded-full text-red-600 hover:bg-red-50 transition-all"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto">
            <Meta title="Feedback Categories" description="Manage Feedback Categories" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-xl">
                            <MessageSquare className="w-8 h-8 text-blue-600" />
                        </div>
                        Feedback Categories
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Manage feedback categories for candidates
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <DataTable
                columns={columns}
                data={categories}
                loading={loading}
                emptyMessage="No feedback categories found."
                currentPage={currentPage}
                limit={limit}
            />

            <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={setCurrentPage}
                limit={limit}
                onLimitChange={setLimit}
            />

            <FeedbackCategoryForm
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                initialData={selectedCategory}
                onSuccess={fetchCategories}
            />

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Category"
                message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                isDanger={true}
            />
        </div>
    );
};

export default FeedbackCategoryList;
