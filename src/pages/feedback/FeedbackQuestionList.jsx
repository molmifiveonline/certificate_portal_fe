import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../components/common/Meta";
import { Plus, Search, Edit, Trash2, RefreshCcw } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "sonner";
import { debounce } from "lodash";
import feedbackQuestionService from "../../services/feedbackQuestionService";
import feedbackCategoryService from "../../services/feedbackCategoryService";
import FeedbackQuestionForm from "./FeedbackQuestionForm";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
import "react-quill-new/dist/quill.snow.css";

const FeedbackQuestionList = () => {
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");

    // Modal States
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);

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

    const fetchCategories = async () => {
        try {
            const result = await feedbackCategoryService.getAll({ limit: 1000 });
            setCategories(result.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const result = await feedbackQuestionService.getAll({
                search: debouncedSearch,
                category_id: filterCategory,
                page: currentPage,
                limit: limit,
                sort_by: sortBy,
                sort_order: sortOrder,
            });

            setQuestions(result.data);
            setTotalPages(result.totalPages);
            setTotalCount(result.totalCount);
        } catch (error) {
            console.error("Error fetching questions:", error);
            toast.error("Failed to load feedback questions");
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch, filterCategory, limit, sortBy, sortOrder]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const handleEdit = (question) => {
        console.log("List - Editing question:", question);
        setSelectedQuestion(question);
        setShowFormModal(true);
    };

    const handleCreate = () => {
        setSelectedQuestion(null);
        setShowFormModal(true);
    };

    const handleDeleteClick = (question) => {
        setQuestionToDelete(question);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!questionToDelete) return;

        try {
            await feedbackQuestionService.delete(questionToDelete.id);
            toast.success("Feedback question deleted successfully");
            fetchQuestions();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete feedback question");
        } finally {
            setShowDeleteModal(false);
            setQuestionToDelete(null);
        }
    };

    const columns = [
        {
            key: "question",
            label: "Question",
            render: (val) => (
                <div
                    className="prose prose-sm max-h-20 overflow-hidden text-ellipsis line-clamp-2 max-w-md"
                    dangerouslySetInnerHTML={{ __html: val }}
                />
            ),
        },
        {
            key: "category_name",
            label: "Category",
            render: (val) => val || "-",
        },
        {
            key: "type",
            label: "Type",
            render: (val) => (
                <span className="capitalize">
                    {val === 'rating' ? 'Rating (1-5)' : val === 'yes_no' ? 'Yes/No' : 'Text'}
                </span>
            ),
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
            <Meta title="Feedback Questions" description="Manage Feedback Questions" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                        Feedback Questions
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Manage feedback questions for candidates
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Question
                </button>
            </div>

            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search questions..."
                                className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchQuestions}
                                className="h-10 w-10 bg-white/50 border border-slate-200/60 hover:bg-white/80 rounded-xl flex items-center justify-center text-slate-600 transition-all"
                            >
                                <RefreshCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select
                            className="w-full h-10 px-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: `right 0.5rem center`,
                                backgroundRepeat: `no-repeat`,
                                backgroundSize: `1.5em 1.5em`,
                                paddingRight: `2.5rem`,
                            }}
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <DataTable
                columns={columns}
                data={questions}
                loading={loading}
                emptyMessage="No feedback questions found."
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

            <FeedbackQuestionForm
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                initialData={selectedQuestion}
                onSuccess={fetchQuestions}
            />

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Question"
                message={`Are you sure you want to delete this question? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                isDanger={true}
            />
        </div>
    );
};

export default FeedbackQuestionList;
