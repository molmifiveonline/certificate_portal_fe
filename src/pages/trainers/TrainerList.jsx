import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Download,
    RefreshCcw,
    UserPlus,
    Edit,
    Trash2,
    Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import api from "../../lib/api";
import { toast } from "sonner";

const TrainerList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTrainers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/trainer');
            setTrainers(response.data);
        } catch (error) {
            console.error("Error fetching trainers:", error);
            toast.error("Failed to load trainers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainers();
    }, []);

    const handleExport = async () => {
        try {
            const response = await api.get('/trainer/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'trainers.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error("Failed to export data.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this trainer?")) {
            try {
                await api.delete(`/trainer/delete/${id}`);
                setTrainers(trainers.filter(t => t.id !== id));
                toast.success("Trainer deleted successfully.");
            } catch (error) {
                toast.error("Failed to delete trainer.");
            }
        }
    };

    const filteredTrainers = trainers.filter(trainer =>
        trainer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trainer.designation && trainer.designation.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex-1 overflow-y-auto w-full p-4 sm:p-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Trainers</h1>
                    <p className="text-slate-500 mt-1">Manage and view all registered trainers</p>
                </div>
                <button
                    onClick={() => navigate('/trainer/create')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95">
                    <UserPlus className="w-4 h-4" />
                    Add Trainer
                </button>
            </div>

            {/* Filter Bar */}
            <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
                <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search trainers..."
                            className="w-full h-10 pl-10 pr-4 bg-white/50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={handleExport}
                            className="h-10 px-4 bg-white/50 border border-slate-200/60 hover:bg-white/80 rounded-xl flex items-center gap-2 text-slate-600 text-sm font-medium transition-all">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button
                            onClick={fetchTrainers}
                            className="h-10 w-10 bg-white/50 border border-slate-200/60 hover:bg-white/80 rounded-xl flex items-center justify-center text-slate-600 transition-all">
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Trainers Table */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/40 border-b border-slate-200/60">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trainer Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Specialization</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredTrainers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No trainers found.
                                    </td>
                                </tr>
                            ) : (
                                filteredTrainers.map((trainer) => (
                                    <tr key={trainer.id} className="hover:bg-white/40 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {trainer.profile_photo ? (
                                                    <img
                                                        src={`http://localhost:8000/uploads/trainer/${trainer.profile_photo}`}
                                                        alt="Profile"
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                                                        {trainer.first_name?.[0]}{trainer.last_name?.[0]}
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-800">
                                                        {trainer.prefix} {trainer.first_name} {trainer.last_name}
                                                    </span>
                                                    <span className="text-xs text-slate-500">{trainer.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {trainer.designation}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {trainer.rank}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {trainer.specialization}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleDelete(trainer.id)}
                                                    className="p-1 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                    title="Delete Trainer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TrainerList;
