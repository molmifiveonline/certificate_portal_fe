import React, { useState, useEffect, useMemo } from "react";
import { X, CheckCircle2, AlertCircle, Loader2, Info, Calendar, RefreshCcw } from 'lucide-react';
import { Button } from "../ui/Button";
import DataTable from "../ui/DataTable";
import TablePagination from "../ui/TablePagination";
import { toast } from "sonner";
import candidateService from "../../services/candidateService";
import { formatDate, getCurrentDateForInput } from "../../lib/utils/dateUtils";

import { CANDIDATE_LAST_SYNC_STORAGE_KEY } from "../../lib/utils/constants";

const normalizeDateInputValue = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
        const directMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
        if (directMatch) return directMatch[0];
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toISOString().split("T")[0];
};

const readStoredLastSyncDate = () => {
    if (typeof window === "undefined") return "";

    try {
        return normalizeDateInputValue(window.localStorage.getItem(CANDIDATE_LAST_SYNC_STORAGE_KEY));
    } catch (error) {
        console.error("Failed to read candidate sync date from local storage:", error);
        return "";
    }
};

const persistLastSyncDate = (date) => {
    const normalizedDate = normalizeDateInputValue(date);
    if (!normalizedDate || typeof window === "undefined") return;

    try {
        window.localStorage.setItem(CANDIDATE_LAST_SYNC_STORAGE_KEY, normalizedDate);
    } catch (error) {
        console.error("Failed to persist candidate sync date:", error);
    }
};

const extractLastSyncDate = (payload) => {
    const nestedPayload = Array.isArray(payload?.data) ? null : payload?.data;
    const possibleDates = [
        payload?.lastSyncedDate,
        payload?.last_synced_date,
        payload?.lastSyncDate,
        payload?.syncDate,
        payload?.sync_date,
        payload?.meta?.lastSyncedDate,
        payload?.meta?.last_synced_date,
        payload?.meta?.lastSyncDate,
        payload?.meta?.syncDate,
        payload?.meta?.sync_date,
        payload?.stats?.lastSyncedDate,
        payload?.stats?.last_synced_date,
        payload?.stats?.syncDate,
        payload?.stats?.sync_date,
        nestedPayload?.lastSyncedDate,
        nestedPayload?.last_synced_date,
        nestedPayload?.lastSyncDate,
        nestedPayload?.syncDate,
        nestedPayload?.sync_date,
    ];

    return possibleDates.map(normalizeDateInputValue).find(Boolean) || "";
};

const extractPreviewData = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.candidates)) return payload.candidates;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data?.candidates)) return payload.data.candidates;
    if (Array.isArray(payload?.data?.items)) return payload.data.items;
    return [];
};

const CandidateImportPreviewModal = ({ isOpen, onClose, onImportSuccess }) => {
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [syncDate, setSyncDate] = useState(() => readStoredLastSyncDate() || getCurrentDateForInput());
    const [lastSyncedDate, setLastSyncedDate] = useState(() => readStoredLastSyncDate());
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const fetchPreview = React.useCallback(async (dateToFetch, options = {}) => {
        const { updateInputDate = false } = options;
        setLoading(true);
        try {
            const result = await candidateService.fetchExternalPreview(dateToFetch);
            const previewRows = extractPreviewData(result);
            const resolvedLastSyncedDate = extractLastSyncDate(result);

            setPreviewData(previewRows);
            if (resolvedLastSyncedDate) {
                setLastSyncedDate(resolvedLastSyncedDate);
                persistLastSyncDate(resolvedLastSyncedDate);

                if (updateInputDate) {
                    setSyncDate(resolvedLastSyncedDate);
                }
            }
            setCurrentPage(1); // Reset to first page on new fetch
        } catch (error) {
            console.error("Preview fetch error:", error);
            toast.error("Failed to fetch data from API. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            const storedLastSyncDate = readStoredLastSyncDate();
            const initialSyncDate = storedLastSyncDate || getCurrentDateForInput();

            setLastSyncedDate(storedLastSyncDate);
            setSyncDate(initialSyncDate);
            fetchPreview(initialSyncDate, { updateInputDate: true });
        }
    }, [isOpen, fetchPreview]);

    const handleDateChange = (e) => {
        const nextSyncDate = e.target.value;
        setSyncDate(nextSyncDate);
        fetchPreview(nextSyncDate);
    };

    const handleImport = async () => {
        setImporting(true);
        const toastId = toast.loading("Importing candidates...");
        try {
            const result = await candidateService.confirmBulkImport({
                candidates: previewData,
                syncDate,
            });
            const resolvedLastSyncDate =
                extractLastSyncDate(result) || normalizeDateInputValue(syncDate) || getCurrentDateForInput();

            persistLastSyncDate(resolvedLastSyncDate);
            setLastSyncedDate(resolvedLastSyncDate);
            setSyncDate(resolvedLastSyncDate);

            toast.success(
                `Import successful! ${result.stats.inserted} new, ${result.stats.updated} updated.`,
                { id: toastId }
            );
            onImportSuccess?.(resolvedLastSyncDate);
            onClose();
        } catch (error) {
            console.error("Import error:", error);
            toast.error(error.response?.data?.message || "Failed to import candidates", { id: toastId });
        } finally {
            setImporting(false);
        }
    };

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * limit;
        return previewData.slice(startIndex, startIndex + limit);
    }, [previewData, currentPage, limit]);

    const totalPages = Math.ceil(previewData.length / limit) || 1;

    if (!isOpen) return null;

    const columns = [
        {
            key: "isExisting",
            label: "Status",
            render: (isExisting) => (
                <div className="flex items-center gap-2">
                    {isExisting ? (
                        <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-100 uppercase tracking-tighter">
                            <AlertCircle className="w-3 h-3" /> Existing
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-100 uppercase tracking-tighter">
                            <CheckCircle2 className="w-3 h-3" /> New
                        </span>
                    )}
                </div>
            ),
        },
        { key: "employee_id", label: "Emp ID" },
        {
            key: "name",
            label: "Candidate Name",
            render: (_, row) => (
                <span className="font-semibold text-slate-800">
                    {`${row.first_name || ''} ${row.last_name || ''}`}
                </span>
            ),
        },
        { key: "rank", label: "Rank" },
        { key: "email", label: "Email" },
        { key: "nationality", label: "Nationality" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl w-full max-w-6xl overflow-hidden transform transition-all scale-100 border border-white/40 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-2.5 rounded-2xl text-blue-600 shadow-sm">
                            <Info size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Preview API Import</h3>
                            <p className="text-sm text-slate-500 font-medium">
                                {previewData.length} candidates found
                                {lastSyncedDate ? ` • Last synced ${formatDate(lastSyncedDate)}` : ""}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <label className="text-xs font-bold text-slate-500 uppercase">Sync From:</label>
                            <input 
                                type="date" 
                                value={syncDate}
                                onChange={handleDateChange}
                                className="text-sm font-semibold text-slate-700 focus:outline-none border-none p-0 cursor-pointer"
                            />
                            <button 
                                onClick={() => fetchPreview(syncDate)}
                                disabled={loading}
                                className="ml-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                                title="Refresh data"
                            >
                                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            disabled={importing}
                            className="text-slate-400 hover:text-slate-600 transition-all p-2 rounded-full hover:bg-slate-100 active:scale-90"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-8 py-6 flex-1 overflow-y-auto bg-white/50">
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800 leading-relaxed font-medium">
                            Review candidates before import. Existing candidates (marked in <span className="font-bold">Amber</span>) will have their profiles updated. New candidates (marked in <span className="font-bold">Green</span>) will be added to the system.
                        </p>
                    </div>
                    
                    <div className="mb-4">
                        <DataTable
                            columns={columns}
                            data={paginatedData}
                            loading={loading}
                            rowKey="email"
                            limit={limit}
                        />
                    </div>

                    {!loading && previewData.length > 0 && (
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalCount={previewData.length}
                            onPageChange={setCurrentPage}
                            limit={limit}
                            onLimitChange={setLimit}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <Button 
                        variant="outline" 
                        onClick={onClose} 
                        disabled={importing || loading}
                        className="px-6 py-2.5 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-white active:scale-95"
                    >
                        Discard
                    </Button>
                    <div className="flex items-center gap-4">
                        {(importing || loading) && (
                            <div className="flex items-center gap-2 text-blue-600 font-semibold animate-pulse">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {loading ? "Fetching data..." : "Processing Import..."}
                            </div>
                        )}
                        <Button
                            onClick={handleImport}
                            disabled={importing || loading || !previewData.length}
                            className="px-10 py-3 rounded-xl font-extrabold shadow-xl shadow-blue-500/30 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 active:scale-95 transition-all flex items-center gap-3 text-white border-none"
                        >
                            Confirm & Import Candidates
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateImportPreviewModal;

