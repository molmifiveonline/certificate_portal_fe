import React, { useState, useEffect, useCallback } from "react";
import {
    Search,
    Filter,
    Download,
    RefreshCcw,
    UserPlus,
    Edit,
    Eye,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import candidateService from "../../services/candidateService";
import TablePagination from "../../components/ui/TablePagination";
import { toast } from "sonner";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import DetailModal from "../../components/ui/DetailModal";
import { debounce } from "lodash";

const CandidateList = () => {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    // Debounce search
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

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const result = await candidateService.getAllCandidates({
                search: debouncedSearch,
                page: currentPage,
                limit: limit,
                sort_by: sortBy,
                sort_order: sortOrder
            });
            setCandidates(result.data);
            setTotalPages(result.totalPages);
            setTotalCount(result.totalCount);
        } catch (error) {
            console.error("Error fetching candidates:", error);
            toast.error("Failed to load candidates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [currentPage, debouncedSearch, limit, sortBy, sortOrder]);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
        setCurrentPage(1);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await candidateService.exportCandidates();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'candidates.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Candidates exported successfully");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export candidates");
        } finally {
            setIsExporting(false);
        }
    };

    const SortIcon = ({ column }) => {
        if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
        return sortOrder === "asc"
            ? <ArrowUp className="w-3 h-3 ml-1 text-blue-600" />
            : <ArrowDown className="w-3 h-3 ml-1 text-blue-600" />;
    };

    const SortableHeader = ({ column, label, className = "" }) => (
        <th
            className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none ${className}`}
            onClick={() => handleSort(column)}
        >
            <div className="flex items-center">
                {label}
                <SortIcon column={column} />
            </div>
        </th>
    );

    const handleViewDetails = (candidate) => {
        setSelectedCandidate(candidate);
        setShowDetailModal(true);
    };

    return (
        <div className="flex-1 overflow-y-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Candidates</h1>
                    <p className="text-slate-500 mt-1">Manage and view all registered candidates</p>
                </div>
                <button
                    onClick={() => navigate('/candidates/add')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95">
                    <UserPlus className="w-4 h-4" />
                    Add Candidate
                </button>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search candidates by name, email or ID..."
                            className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button className="h-10 px-4 bg-white/50 border border-slate-200/60 hover:bg-white/80 rounded-xl flex items-center gap-2 text-slate-600 text-sm font-medium transition-all">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="h-10 px-4 bg-white/50 border border-slate-200/60 hover:bg-white/80 rounded-xl flex items-center gap-2 text-slate-600 text-sm font-medium transition-all disabled:opacity-50">
                            {isExporting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            Export
                        </button>
                        <button
                            onClick={fetchCandidates}
                            className="h-10 w-10 bg-white/50 border border-slate-200/60 hover:bg-white/80 rounded-xl flex items-center justify-center text-slate-600 transition-all">
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Candidates Table */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/40 border-b border-slate-200/60">
                                <SortableHeader column="employee_id" label="Candidate ID" />
                                <SortableHeader column="first_name" label="Name" />
                                <SortableHeader column="registration_type" label="Role" />
                                <SortableHeader column="rank" label="Rank" />
                                <SortableHeader column="nationality" label="Nationality" />
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div className="h-4 bg-slate-200 rounded w-32"></div>
                                                <div className="h-3 bg-slate-100 rounded w-24"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : candidates.map((candidate) => (
                                <tr key={candidate.id} className="hover:bg-white/40 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">{candidate.employee_id || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-800">
                                                {`${candidate.first_name} ${candidate.last_name}`}
                                            </span>
                                            <span className="text-xs text-slate-500">{candidate.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            {candidate.registration_type}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{candidate.rank || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{candidate.nationality || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => handleViewDetails(candidate)}
                                                className="p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/candidates/edit/${candidate.id}`)}
                                                className="p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                title="Edit Candidate"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && candidates.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No candidates found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    onPageChange={setCurrentPage}
                    limit={limit}
                    onLimitChange={setLimit}
                />
            </div>


            <DetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Candidate Details"
                data={selectedCandidate}
                config={[
                    { key: 'employee_id', label: 'Candidate ID' },
                    {
                        key: 'name',
                        label: 'Full Name',
                        render: (_, candidate) => `${candidate.prefix || ''} ${candidate.first_name || ''} ${candidate.middle_name || ''} ${candidate.last_name || ''}`.trim()
                    },
                    { key: 'email', label: 'Email' },
                    { key: 'mobile', label: 'Mobile' },
                    { key: 'gender', label: 'Gender' },
                    {
                        key: 'dob',
                        label: 'DOB',
                        render: (val) => val ? new Date(val).toLocaleDateString() : "-"
                    },
                    { key: 'nationality', label: 'Nationality' },
                    { key: 'passport_no', label: 'Passport No.' },
                    { key: 'rank', label: 'Rank' },
                    { key: 'whatsapp_number', label: 'WhatsApp' },
                    { key: 'registration_type', label: 'Registration Type' }
                ]}
            />
        </div>
    );
};

export default CandidateList;
