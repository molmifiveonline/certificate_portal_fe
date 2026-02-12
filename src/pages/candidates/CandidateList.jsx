import React, { useState, useEffect, useCallback } from "react";
import Meta from "../../components/common/Meta";
import { MANAGER_OPTIONS } from "../../lib/constants";
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
    ArrowDown,
    Upload,
    Zap
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
    const [isSyncing, setIsSyncing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);

    // Filter States
    const [filterManager, setFilterManager] = useState("");
    const [filterRank, setFilterRank] = useState("");
    const [filterNationality, setFilterNationality] = useState("");
    const [filterStatus, setFilterStatus] = useState("1"); // Default Active

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
                sort_order: sortOrder,
                manager: filterManager,
                rank: filterRank,
                nationality: filterNationality,
                status: filterStatus
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
    }, [currentPage, debouncedSearch, limit, sortBy, sortOrder, filterManager, filterRank, filterNationality, filterStatus]);

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

    const handleSyncFromApi = async () => {
        setIsSyncing(true);
        const toastId = toast.loading("Syncing candidates from API...");
        try {
            const result = await candidateService.importFromApi("1970-01-01"); // Default to all
            toast.success(`Sync completed! ${result.stats.inserted} new, ${result.stats.updated} updated.`, { id: toastId });
            fetchCandidates();
        } catch (error) {
            console.error("Sync error:", error);
            toast.error("Failed to sync from API", { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            toast.error("Please upload a CSV file");
            return;
        }

        setIsUploading(true);
        const toastId = toast.loading("Uploading candidates...");
        const formData = new FormData();
        formData.append("csv", file);

        try {
            const result = await candidateService.uploadCandidates(formData);
            toast.success(`Upload successful! ${result.stats.inserted} new, ${result.stats.updated} updated.`, { id: toastId });
            fetchCandidates();
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload candidates", { id: toastId });
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset input
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
            <Meta title="Candidates" description="Manage Candidates" />
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Candidates</h1>
                    <p className="text-slate-500 mt-1">Manage and view all registered candidates</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleSyncFromApi}
                        disabled={isSyncing}
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2 active:scale-95 disabled:opacity-50">
                        <Zap className={`w-4 h-4 text-amber-500 ${isSyncing ? 'animate-pulse' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync API'}
                    </button>

                    <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2 active:scale-95">
                        <Upload className="w-4 h-4 text-blue-600" />
                        Upload
                        <input
                            type="file"
                            className="hidden"
                            accept=".csv"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                    </label>

                    <button
                        onClick={() => navigate('/candidates/add')}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95">
                        <UserPlus className="w-4 h-4" />
                        Add Candidate
                    </button>
                </div>
            </div>

            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
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
                    </div>

                    {/* Additional Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <select
                                className="w-full h-10 px-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                                value={filterManager}
                                onChange={(e) => setFilterManager(e.target.value)}
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                            >
                                <option value="">Last served (All)</option>
                                {MANAGER_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <select
                            className="h-10 px-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                            value={filterRank}
                            onChange={(e) => setFilterRank(e.target.value)}
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                        >
                            <option value="">All Ranks</option>
                            <option value="Captain">Captain</option>
                            <option value="Chief Officer">Chief Officer</option>
                        </select>
                        <select
                            className="h-10 px-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                            value={filterNationality}
                            onChange={(e) => setFilterNationality(e.target.value)}
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                        >
                            <option value="">All Nationalities</option>
                            <option value="Indian">Indian</option>
                            <option value="Filipino">Filipino</option>
                        </select>
                        <select
                            className="h-10 px-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                        >
                            <option value="all">All Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Candidates Table */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/40 border-b border-slate-200/60">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sr.No.</th>
                                <SortableHeader column="employee_id" label="Employee ID" />
                                <SortableHeader column="prefix" label="Title" />
                                <SortableHeader column="first_name" label="Candidate Name" />
                                <SortableHeader column="rank" label="Rank" />
                                <SortableHeader column="created_at" label="Date" />
                                <SortableHeader column="nationality" label="Nationality" />
                                <SortableHeader column="manager" label="Manager" />
                                <SortableHeader column="status" label="Status" />
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Edit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td colSpan="10" className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : candidates.map((candidate, index) => (
                                <tr key={candidate.id} className="hover:bg-white/40 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {(currentPage - 1) * limit + index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">{candidate.employee_id || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{candidate.prefix || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-800">
                                                {`${candidate.first_name || ''} ${candidate.last_name || ''}`}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{candidate.rank || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('en-GB') : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{candidate.nationality || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{candidate.manager || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${candidate.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {candidate.status === 1 ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => navigate(`/candidates/edit/${candidate.id}`)}
                                            className="p-1 rounded-full text-blue-600 hover:bg-blue-50 transition-all font-medium text-xs"
                                        >
                                            Edit
                                        </button>
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
