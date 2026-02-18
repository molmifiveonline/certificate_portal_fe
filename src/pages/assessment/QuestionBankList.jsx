import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../components/common/Meta";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Upload,
    Download,
    X,
    FileSpreadsheet,
    FileQuestion,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import TablePagination from "../../components/ui/TablePagination";
import DataTable from "../../components/ui/DataTable";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import questionBankService from "../../services/questionBankService";
import { toast } from "sonner";

const QuestionBankList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [bulkFile, setBulkFile] = useState(null);
    const [bulkUploading, setBulkUploading] = useState(false);
    const [bulkResult, setBulkResult] = useState(null);
    const navigate = useNavigate();

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const result = await questionBankService.getQuestions(searchTerm, currentPage, limit);
            setQuestions(Array.isArray(result.data) ? result.data : []);
            setTotalPages(Math.ceil((result.total || 0) / limit));
            setTotalCount(result.total || 0);
        } catch (error) {
            console.error("Error fetching questions:", error);
            toast.error("Failed to load questions.");
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, searchTerm]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const handleDelete = (id) => {
        setQuestionToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!questionToDelete) return;
        try {
            await questionBankService.deleteQuestion(questionToDelete);
            toast.success("Question deleted successfully.");
            fetchQuestions();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete question.");
        } finally {
            setDeleteModalOpen(false);
            setQuestionToDelete(null);
        }
    };

    const getTypeLabels = (typeString) => {
        if (!typeString) return "";
        const types = typeString.split(",");
        const labels = [];
        if (types.includes("1")) labels.push("Pre");
        if (types.includes("2")) labels.push("Post");
        if (types.includes("3")) labels.push("Daily");
        return labels.join(", ");
    };

    const getAnswerLabel = (correctOption) => {
        if (!correctOption) return "";
        const opts = correctOption.split(",").map(o => o.trim());
        const labelMap = { opt_a: "A", opt_b: "B", opt_c: "C", opt_d: "D" };
        return opts.map(o => labelMap[o] || o).join(", ");
    };

    const handleBulkUpload = async () => {
        if (!bulkFile) {
            toast.error("Please select an Excel file.");
            return;
        }
        setBulkUploading(true);
        setBulkResult(null);
        try {
            const result = await questionBankService.bulkUpload(bulkFile);
            setBulkResult(result.data);
            toast.success(result.message);
            fetchQuestions();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Bulk upload failed.");
        } finally {
            setBulkUploading(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            await questionBankService.downloadTemplate();
        } catch (error) {
            toast.error("Failed to download template.");
        }
    };

    const columns = [
        {
            key: "master_course_name",
            label: "Master Course",
            render: (val) => val || "-",
        },
        {
            key: "question",
            label: "Question",
            render: (val) => (
                <span className="max-w-xs truncate block">{val}</span>
            ),
        },
        {
            key: "correct_option",
            label: "Answer",
            render: (val) => (
                <span className="font-medium">{getAnswerLabel(val)}</span>
            ),
        },
        {
            key: "type_of_test",
            label: "Type of Test",
            render: (val) => getTypeLabels(val),
        },
        {
            key: "actions",
            label: "Action",
            align: "center",
            render: (_val, row) => (
                <div className="flex items-center justify-center gap-2">
                    <Link
                        to={`/assessment/question-bank/edit/${row.id}`}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-all inline-flex"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all inline-flex"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <Meta title="Question Bank" description="Manage Question Bank" />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-xl">
                            <FileQuestion className="w-8 h-8 text-blue-600" />
                        </div>
                        Question Bank
                    </h1>
                    <p className="text-slate-500 mt-1">Manage and view all questions</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => { setBulkModalOpen(true); setBulkFile(null); setBulkResult(null); }}
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Bulk Upload
                    </button>
                    <Link
                        to="/assessment/question-bank/add"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add Question
                    </Link>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
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
                    <div className="flex gap-3 w-full md:w-auto items-center">
                        <span className="text-xs text-slate-400">{totalCount} question{totalCount !== 1 ? 's' : ''}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <DataTable
                columns={columns}
                data={questions}
                loading={loading}
                emptyMessage="No questions found."
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
                title="Delete Question"
                message="Are you sure you want to delete this question? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />

            {/* Bulk Upload Modal */}
            {bulkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-bold text-slate-800">Bulk Upload Questions</h2>
                            </div>
                            <button onClick={() => setBulkModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-800 mb-2">
                                    Upload an Excel file (.xlsx) with columns: <strong>Question, Master Course ID, Type of Test, Option A, Option B, Option C, Option D, Correct Option</strong>
                                </p>
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                                >
                                    <Download className="w-3 h-3" />
                                    Download Sample Template
                                </button>
                            </div>

                            <div>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={(e) => setBulkFile(e.target.files[0])}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 outline-none text-sm"
                                />
                            </div>

                            {bulkResult && (
                                <div className={`rounded-xl p-4 border ${bulkResult.failed > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                                    <p className="text-sm font-medium">
                                        ✅ {bulkResult.success} added{bulkResult.failed > 0 && <>, ❌ {bulkResult.failed} failed</>}
                                    </p>
                                    {bulkResult.errors && bulkResult.errors.length > 0 && (
                                        <ul className="mt-2 text-xs text-red-600 list-disc list-inside max-h-32 overflow-y-auto">
                                            {bulkResult.errors.map((err, i) => (
                                                <li key={i}>{err}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setBulkModalOpen(false)}
                                    className="px-5 py-2 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handleBulkUpload}
                                    disabled={bulkUploading || !bulkFile}
                                    className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-all ${(bulkUploading || !bulkFile) ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    <Upload className="w-4 h-4" />
                                    {bulkUploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBankList;
