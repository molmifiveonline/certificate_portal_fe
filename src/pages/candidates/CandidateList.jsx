import React, { useState } from "react";
import {
    Search,
    Filter,
    Download,
    RefreshCcw,
    UserPlus,
    Edit,
    Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";

// Mock Data
const MOCK_CANDIDATES = [
    { id: "MOL-C-001", name: "Rahul Sharma", email: "rahul.s@example.com", phone: "+91 98765 43210", role: "Candidate", status: "active", course: "Full Stack Web Dev" },
    { id: "MOL-C-002", name: "Priya Patel", email: "priya.p@example.com", phone: "+91 98765 43211", role: "Candidate", status: "active", course: "Data Science" },
    { id: "MOL-C-003", name: "Amit Kumar", email: "amit.k@example.com", phone: "+91 98765 43212", role: "Candidate", status: "inactive", course: "UI/UX Design" },
    { id: "MOL-C-004", name: "Sneha Gupta", email: "sneha.g@example.com", phone: "+91 98765 43213", role: "Candidate", status: "active", course: "Full Stack Web Dev" },
    { id: "MOL-C-005", name: "Vikram Singh", email: "vikram.s@example.com", phone: "+91 98765 43214", role: "Candidate", status: "active", course: "Cyber Security" },
];

const CandidateList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

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
                        <button className="h-10 px-4 bg-white/50 border border-slate-200/60 hover:bg-white/80 rounded-xl flex items-center gap-2 text-slate-600 text-sm font-medium transition-all">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button className="h-10 w-10 bg-white/50 border border-slate-200/60 hover:bg-white/80 rounded-xl flex items-center justify-center text-slate-600 transition-all">
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
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {MOCK_CANDIDATES.map((candidate) => (
                                <tr key={candidate.id} className="hover:bg-white/40 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">{candidate.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-800">{candidate.name}</span>
                                            <span className="text-xs text-slate-500">{candidate.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            {candidate.role}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{candidate.course}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {candidate.status === 'active' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                className="p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                title="Edit Candidate"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="p-1 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                title="Delete Candidate"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {MOCK_CANDIDATES.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No candidates found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination (Static) */}
                <div className="px-6 py-4 border-t border-slate-200/60 flex items-center justify-between bg-white/30 text-sm text-slate-500">
                    <span>Showing 1 to 5 of 5 entries</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-white/50 border border-slate-200/60 rounded-lg disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 bg-white/50 border border-slate-200/60 rounded-lg hover:bg-white/80">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateList;
