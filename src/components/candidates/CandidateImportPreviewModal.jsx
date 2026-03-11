import React, { useState } from "react";
import { X, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import { Button } from "../ui/button";
import DataTable from "../ui/DataTable";
import { toast } from "sonner";
import candidateService from "../../services/candidateService";

const CandidateImportPreviewModal = ({ isOpen, onClose, data, onImportSuccess }) => {
    const [importing, setImporting] = useState(false);

    if (!isOpen) return null;

    const handleImport = async () => {
        setImporting(true);
        const toastId = toast.loading("Importing candidates...");
        try {
            const result = await candidateService.confirmBulkImport(data);
            toast.success(
                `Import successful! ${result.stats.inserted} new, ${result.stats.updated} updated.`,
                { id: toastId }
            );
            onImportSuccess();
            onClose();
        } catch (error) {
            console.error("Import error:", error);
            toast.error(error.response?.data?.message || "Failed to import candidates", { id: toastId });
        } finally {
            setImporting(false);
        }
    };

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
                            <p className="text-sm text-slate-500 font-medium">{data?.length || 0} candidates found in external system</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={importing}
                        className="text-slate-400 hover:text-slate-600 transition-all p-2 rounded-full hover:bg-slate-100 active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 flex-1 overflow-y-auto bg-white/50">
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800 leading-relaxed font-medium">
                            Review candidates before import. Existing candidates (marked in <span className="font-bold">Amber</span>) will have their profiles updated. New candidates (marked in <span className="font-bold">Green</span>) will be added to the system.
                        </p>
                    </div>
                    
                    <DataTable
                        columns={columns}
                        data={data}
                        loading={false}
                        rowKey="email"
                        limit={data?.length}
                    />
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <Button 
                        variant="outline" 
                        onClick={onClose} 
                        disabled={importing}
                        className="px-6 py-2.5 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-white active:scale-95"
                    >
                        Discard
                    </Button>
                    <div className="flex items-center gap-4">
                        {importing && (
                            <div className="flex items-center gap-2 text-blue-600 font-semibold animate-pulse">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing Import...
                            </div>
                        )}
                        <Button
                            onClick={handleImport}
                            disabled={importing || !data?.length}
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
