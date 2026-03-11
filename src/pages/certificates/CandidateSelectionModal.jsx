import React, { useState, useMemo } from 'react';
import { Button } from "../../components/ui/button";
import { Search, Users, X, Save } from "lucide-react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const CandidateSelectionModal = ({ isOpen, onClose, candidates, selectedIds, onSelectionChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [localSelected, setLocalSelected] = useState(new Set(selectedIds));

    // Reset local selection when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setLocalSelected(new Set(selectedIds));
            setSearchTerm('');
        }
    }, [isOpen, selectedIds]);

    const filteredCandidates = useMemo(() => {
        if (!searchTerm) return candidates;
        const lowerTerm = searchTerm.toLowerCase();
        return candidates.filter(c =>
            (c.first_name?.toLowerCase().includes(lowerTerm)) ||
            (c.last_name?.toLowerCase().includes(lowerTerm)) ||
            (c.empId?.toLowerCase().includes(lowerTerm)) ||
            (c.cdc_passport?.toLowerCase().includes(lowerTerm))
        );
    }, [candidates, searchTerm]);

    const handleToggleSelect = (id) => {
        const newSelected = new Set(localSelected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setLocalSelected(newSelected);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const newSelected = new Set(localSelected);
            filteredCandidates.forEach(c => newSelected.add(c.id));
            setLocalSelected(newSelected);
        } else {
            const newSelected = new Set(localSelected);
            filteredCandidates.forEach(c => newSelected.delete(c.id));
            setLocalSelected(newSelected);
        }
    };

    const isAllFilteredSelected = filteredCandidates.length > 0 &&
        filteredCandidates.every(c => localSelected.has(c.id));

    const handleSave = () => {
        onSelectionChange(Array.from(localSelected));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm sm:p-6" onClick={onClose}>
            <div
                className="flex flex-col w-full max-w-4xl max-h-[90vh] bg-slate-50 border border-slate-200/60 rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 sm:p-6 bg-white border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        Select Candidates
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-5 sm:p-6 gap-5 overflow-hidden">
                    {/* Search and Summary Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, Emp ID, or Passport..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg border border-blue-100">
                                {localSelected.size} selected
                            </span>
                            {localSelected.size > 0 && (
                                <button
                                    onClick={() => setLocalSelected(new Set())}
                                    className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="flex-1 overflow-auto bg-white rounded-xl border border-slate-200 shadow-sm relative">
                        {candidates.length === 0 ? (
                            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                                <LoadingSpinner />
                                <p className="mt-4 text-sm font-medium">Loading candidates...</p>
                            </div>
                        ) : filteredCandidates.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 text-sm font-medium">
                                No candidates match your search.
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="text-xs uppercase bg-slate-50 text-slate-700 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 w-12 text-center bg-slate-50">
                                            <input
                                                type="checkbox"
                                                checked={isAllFilteredSelected}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 text-blue-600 rounded bg-white border-slate-300 focus:ring-blue-500 cursor-pointer"
                                            />
                                        </th>
                                        <th className="px-4 py-3 font-semibold bg-slate-50">Emp ID</th>
                                        <th className="px-4 py-3 font-semibold bg-slate-50">Name</th>
                                        <th className="px-4 py-3 font-semibold hidden sm:table-cell bg-slate-50">Passport</th>
                                        <th className="px-4 py-3 font-semibold hidden sm:table-cell bg-slate-50">Seaman No.</th>
                                        <th className="px-4 py-3 font-semibold hidden md:table-cell bg-slate-50">Rank</th>
                                        <th className="px-4 py-3 font-semibold hidden md:table-cell bg-slate-50">Manager</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredCandidates.map((c) => (
                                        <tr
                                            key={c.id}
                                            className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${localSelected.has(c.id) ? 'bg-blue-50/70' : ''}`}
                                            onClick={() => handleToggleSelect(c.id)}
                                        >
                                            <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={localSelected.has(c.id)}
                                                    onChange={() => handleToggleSelect(c.id)}
                                                    className="w-4 h-4 text-blue-600 rounded bg-white border-slate-300 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-700">{c.empId || '-'}</td>
                                            <td className="px-4 py-3 font-medium text-slate-900">{c.first_name} {c.last_name}</td>
                                            <td className="px-4 py-3 hidden sm:table-cell text-slate-500">{c.cdc_passport || '-'}</td>
                                            <td className="px-4 py-3 hidden sm:table-cell text-slate-500">{c.seaman_book_no || '-'}</td>
                                            <td className="px-4 py-3 hidden md:table-cell text-slate-500">{c.rank || '-'}</td>
                                            <td className="px-4 py-3 hidden md:table-cell text-slate-500">{c.manager || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center p-5 sm:p-6 bg-slate-50 border-t border-slate-200 gap-4">
                    <p className="text-sm font-medium text-slate-500 w-full sm:w-auto text-center sm:text-left">
                        Showing {filteredCandidates.length} of {candidates.length} candidates
                    </p>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 sm:flex-none border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold h-11 px-6 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 font-semibold h-11 px-8 rounded-xl"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Confirm Selection
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateSelectionModal;
