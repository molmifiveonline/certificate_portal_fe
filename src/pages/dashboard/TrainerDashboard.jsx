import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import Meta from '../../components/common/Meta';
import { useAuth } from '../../context/AuthContext';
import trainerService from '../../services/trainerService';
import activeCourseService from '../../services/activeCourseService';
import { 
    BookOpen, 
    Users, 
    Calendar,
    Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from "../../lib/utils/utils";
import { formatDate } from "../../lib/utils/dateUtils";

const StatsCard = ({ title, value, icon: Icon, gradient, loading }) => {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-white/40 shadow-lg",
                "bg-white/60 backdrop-blur-2xl"
            )}
        >
            <div className={`absolute right-0 top-0 w-32 h-32 opacity-20 rounded-bl-full bg-gradient-to-br ${gradient} -mr-8 -mt-8`} />

            <div className="flex justify-between items-start relative z-10">
                <div className={cn("p-3 rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-black/5", gradient)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            <div className="mt-4 relative z-10">
                {loading ? (
                    <div className="h-10 w-24 bg-slate-200 animate-pulse rounded-md" />
                ) : (
                    <h3 className="text-4xl font-bold text-slate-800 tracking-tight">{value}</h3>
                )}
                <p className="text-sm font-semibold text-slate-500 mt-1">{title}</p>
            </div>
        </div>
    );
};

const TrainerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        activeCourses: 0,
        totalCandidates: 0,
        certificatesIssued: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const statsData = await trainerService.getDashboardStats();
                setStats(statsData);
            } catch (error) {
                console.error("Dashboard data fetch error:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Meta title="Trainer Dashboard" description="Trainer Dashboard" />
            
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back, {user?.first_name}!</h1>
                    <p className="text-slate-500 mt-1 font-medium">Here's what's happening with your courses today.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl p-2 rounded-2xl border border-white/40 shadow-sm px-4">
                    <Calendar className="text-blue-600 w-5 h-5" />
                    <span className="text-sm font-bold text-slate-700">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatsCard 
                    title="Active Courses" 
                    value={stats.activeCourses} 
                    icon={BookOpen} 
                    gradient="from-blue-500 to-indigo-600"
                    loading={loading}
                />
                <StatsCard 
                    title="Total Candidates" 
                    value={stats.totalCandidates} 
                    icon={Users} 
                    gradient="from-violet-500 to-purple-600"
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default TrainerDashboard;
