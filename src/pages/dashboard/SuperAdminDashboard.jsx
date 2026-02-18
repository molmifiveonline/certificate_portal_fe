import React, { useState, useEffect } from "react";
import {
    Users,
    GraduationCap,
    BookOpen,
    Search,
    Filter,
    MoreVertical,
    AlertCircle,
    CheckCircle,
    Loader2
} from "lucide-react";
import { cn } from "../../lib/utils/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import Meta from '../../components/common/Meta';
import api from "../../lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

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

const FilterSection = ({
    filters,
    setFilters,
    trainers,
    masterCourses,
    onSearch
}) => {
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <Card className="rounded-3xl border-white/40 bg-white/60 backdrop-blur-2xl shadow-lg mb-8 overflow-visible z-10">
            <CardHeader className="pb-4 border-b border-slate-100/50">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50/80 text-blue-600 rounded-lg backdrop-blur-sm">
                        <Filter className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-800">Filters</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Trainer</label>
                        <Select
                            value={filters.trainer_id}
                            onValueChange={(val) => handleFilterChange('trainer_id', val)}
                        >
                            <SelectTrigger className="bg-white/80 border-slate-200/60 focus:ring-blue-500/20">
                                <SelectValue placeholder="All Trainers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Trainers</SelectItem>
                                {trainers.map(t => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.first_name} {t.last_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Master Course</label>
                        <Select
                            value={filters.master_course_id}
                            onValueChange={(val) => handleFilterChange('master_course_id', val)}
                        >
                            <SelectTrigger className="bg-white/80 border-slate-200/60 focus:ring-blue-500/20">
                                <SelectValue placeholder="All Courses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {masterCourses.map(mc => (
                                    <SelectItem key={mc.id} value={mc.id}>
                                        {mc.name || mc.course_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Start Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={filters.start_date || ''}
                                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                className="w-full h-10 px-3 py-2 bg-white/80 border border-slate-200/60 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">End Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={filters.end_date || ''}
                                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                className="w-full h-10 px-3 py-2 bg-white/80 border border-slate-200/60 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status</label>
                        <Select
                            value={filters.status}
                            onValueChange={(val) => handleFilterChange('status', val)}
                        >
                            <SelectTrigger className="bg-white/80 border-slate-200/60 focus:ring-blue-500/20">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Initiated">Initiated</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setFilters({
                                trainer_id: '',
                                master_course_id: '',
                                start_date: '',
                                end_date: '',
                                status: ''
                            });
                            onSearch(); // Optional: Trigger search immediately after clearing, or let user click search
                        }}
                        className="font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    >
                        Clear Filters
                    </Button>
                    <Button
                        onClick={onSearch}
                        className="px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 transform hover:-translate-y-0.5"
                    >
                        <Search className="w-4 h-4" />
                        Search Records
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};



const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({ totalCandidates: 0, totalTrainers: 0, totalCourses: 0 });
    const [courses, setCourses] = useState([]);
    const [expiryAlerts, setExpiryAlerts] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [masterCourses, setMasterCourses] = useState([]);

    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingExpiry, setLoadingExpiry] = useState(true);

    const [filters, setFilters] = useState({
        trainer_id: '',
        master_course_id: '',
        start_date: '',
        end_date: '',
        status: ''
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [statsRes, trainersRes, masterCoursesRes, expiryRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/trainer'),
                    api.get('/master-courses'),
                    api.get('/dashboard/expiry')
                ]);

                setStats(statsRes.data);
                setTrainers(trainersRes.data.data || []); // Assuming typical response structure
                setMasterCourses(masterCoursesRes.data.data || masterCoursesRes.data || []);
                setExpiryAlerts(expiryRes.data);

                setLoadingStats(false);
                setLoadingExpiry(false);

                // Fetch initial courses without filters
                fetchCourses();
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Failed to load dashboard data");
                setLoadingStats(false);
                setLoadingCourses(false);
                setLoadingExpiry(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchCourses = async () => {
        setLoadingCourses(true);
        try {
            // Clean filters before sending (remove 'all' or empty strings)
            const params = {};
            if (filters.trainer_id && filters.trainer_id !== 'all') params.trainer_id = filters.trainer_id;
            if (filters.master_course_id && filters.master_course_id !== 'all') params.master_course_id = filters.master_course_id;
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;
            if (filters.status && filters.status !== 'all') params.status = filters.status;

            const res = await api.get('/dashboard/courses', { params });
            setCourses(res.data);
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error("Failed to fetch course reports");
        } finally {
            setLoadingCourses(false);
        }
    };

    return (
        <>
            <Meta title="Super Admin Dashboard" description="Super Admin Dashboard" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    title="Total Candidates"
                    value={stats.totalCandidates}
                    icon={Users}
                    gradient="from-blue-500 to-indigo-600"
                    loading={loadingStats}
                />
                <StatsCard
                    title="Total Trainers"
                    value={stats.totalTrainers}
                    icon={GraduationCap}
                    gradient="from-violet-500 to-purple-600"
                    loading={loadingStats}
                />
                <StatsCard
                    title="Total Active Courses"
                    value={stats.totalCourses}
                    icon={BookOpen}
                    gradient="from-emerald-500 to-teal-600"
                    loading={loadingStats}
                />
            </div>

            <FilterSection
                filters={filters}
                setFilters={setFilters}
                trainers={trainers}
                masterCourses={masterCourses}
                onSearch={fetchCourses}
            />


            <div className="grid grid-cols-1 gap-8">

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/50">
                        <h3 className="font-bold text-slate-800 text-lg">Course Details</h3>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-left">Course Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-center hidden sm:table-cell">Man Days</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-left">Start Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-left hidden md:table-cell">End Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-left">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-center hidden lg:table-cell">Candidates</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-center hidden lg:table-cell">Rating</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-center hidden lg:table-cell">Absent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loadingCourses ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : courses.length > 0 ? (
                                    courses.map((course) => (
                                        <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-700">{course.course_name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 text-center hidden sm:table-cell">
                                                {course.start_date && course.end_date ? (
                                                    Math.ceil((new Date(course.end_date) - new Date(course.start_date)) / (1000 * 60 * 60 * 24)) + 1
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {course.start_date ? format(new Date(course.start_date), 'dd/MM/yyyy') : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">
                                                {course.end_date ? format(new Date(course.end_date), 'dd/MM/yyyy') : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                                                    course.status === 'Active' || course.status === 'Initiated' ? "bg-green-100 text-green-700" :
                                                        course.status === 'Completed' ? "bg-blue-100 text-blue-700" :
                                                            "bg-slate-100 text-slate-700"
                                                )}>
                                                    {course.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 text-center hidden lg:table-cell">{course.candidate_count}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 text-center hidden lg:table-cell">{course.avg_feedback}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 text-center hidden lg:table-cell">{course.absent_count}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                                <div className="p-3 bg-slate-50 rounded-full">
                                                    <Search className="w-6 h-6 text-slate-300" />
                                                </div>
                                                <p className="font-medium">No course records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/50">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-red-50 text-red-500 rounded-md">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg">Expiry Alerts (Next 6 Months)</h3>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider hidden md:table-cell">Candidate ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider font-bold">Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Course Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider hidden sm:table-cell">Emp ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-left">Expiry Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-wider text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loadingExpiry ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : expiryAlerts.length > 0 ? (
                                    expiryAlerts.map((alert, index) => (
                                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-700 font-mono text-xs hidden md:table-cell">
                                                {alert.candidate_id ? alert.candidate_id.substring(0, 8) + '...' : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                                                {alert.first_name} {alert.last_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{alert.course_name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">{alert.employee_id || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-red-600 font-semibold px-2">
                                                {alert.certificate_expiry_date ? format(new Date(alert.certificate_expiry_date), 'dd/MM/yyyy') : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => toast.info(`Notification sent to ${alert.first_name}`)}
                                                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                >
                                                    Notify
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                                <div className="p-3 bg-slate-50 rounded-full">
                                                    <CheckCircle className="w-6 h-6 text-slate-300" />
                                                </div>
                                                <p className="font-medium">No candidate alerts found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SuperAdminDashboard;
