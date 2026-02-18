import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../components/common/Meta";
import { Plus, Search, Edit, Trash2, RefreshCcw } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button, buttonVariants } from "../../components/ui/button";
import { cn } from "../../lib/utils/utils";
import { toast } from "sonner";
import { debounce } from "lodash";
import { Link, useNavigate } from "react-router-dom";
import feedbackFormService from "../../services/feedbackFormService";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";

const FeedbackFormList = () => {
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formToDelete, setFormToDelete] = useState(null);

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

    const fetchForms = useCallback(async () => {
        setLoading(true);
        try {
            const result = await feedbackFormService.getAll({
                search: debouncedSearch,
                page: currentPage,
                limit: limit,
            });

            console.log("Forms result:", result);
            setForms(result.data);
            setTotalCount(result.total);
            setTotalPages(Math.ceil(result.total / limit));
        } catch (error) {
            console.error("Error fetching feedback forms:", error);
            toast.error("Failed to load feedback forms");
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch, limit]);

    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    const handleDeleteClick = (form) => {
        setFormToDelete(form);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!formToDelete) return;

        try {
            await feedbackFormService.delete(formToDelete.id);
            toast.success("Feedback form deleted successfully");
            fetchForms();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete feedback form");
        } finally {
            setShowDeleteModal(false);
            setFormToDelete(null);
        }
    };

    const columns = [
        {
            key: "title",
            label: "Title",
            render: (val) => <span className="font-medium text-slate-700">{val}</span>,
        },
        {
            key: "type_of_course",
            label: "Type of Course",
        },
        {
            key: "status",
            label: "Status",
            render: (val) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${val === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                >
                    {val === 1 ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (_val, row) => (
                <div className="flex items-center gap-2">
                    <Link
                        to={`/feedback/forms/edit/${row.id}`}
                        className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-all"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
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
            <Meta title="Feedback Forms" description="Manage Feedback Forms" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                        Feedback Forms
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Manage feedback forms and questions
                    </p>
                </div>
                <Link
                    to="/feedback/forms/create"
                    className={cn(buttonVariants({ variant: "default" }), "px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95 h-auto")}
                >
                    <Plus className="w-4 h-4" />
                    Create Form
                </Link>
            </div>

            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search forms..."
                                className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={fetchForms}
                                className="h-10 w-10 bg-white/50 border-slate-200/60 hover:bg-white/80 rounded-xl text-slate-600"
                            >
                                <RefreshCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <DataTable
                columns={columns}
                data={forms}
                loading={loading}
                emptyMessage="No feedback forms found."
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

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Form"
                message={`Are you sure you want to delete this form? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                isDanger={true}
            />
        </div>
    );
};

export default FeedbackFormList;
