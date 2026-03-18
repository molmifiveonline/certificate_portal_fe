import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import api from '../../../lib/api';
import { toast } from "sonner";

const CandidateAttendanceTab = ({ courseId }) => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await api.get(`/active-courses/${courseId}/my-attendance`);
                setAttendance(response.data);
            } catch (error) {
                console.error("Error fetching attendance:", error);
                toast.error("Failed to load attendance record");
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [courseId]);

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'present': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
            case 'absent': return <XCircle className="h-5 w-5 text-rose-500" />;
            case 'half day': return <Clock className="h-5 w-5 text-amber-500" />;
            default: return <Clock className="h-5 w-5 text-slate-300" />;
        }
    };

    if (loading) return <div className="text-center py-10 text-slate-400">Loading records...</div>;

    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status?.toLowerCase() === 'present').length;
    const halfDays = attendance.filter(a => a.status?.toLowerCase() === 'half day').length;
    const attendancePercentage = totalDays > 0 
        ? (((presentDays + halfDays * 0.5) / totalDays) * 100).toFixed(1) 
        : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/80 backdrop-blur-xl border-white/60 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-500 mb-1">Total Training Days</div>
                        <div className="text-3xl font-bold text-slate-900">{totalDays}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-xl border-white/60 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-500 mb-1">Days Attended</div>
                        <div className="text-3xl font-bold text-emerald-600">{presentDays + halfDays * 0.5}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-xl border-white/60 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-500 mb-1">Attendance Percentage</div>
                        <div className="text-3xl font-bold text-primary">{attendancePercentage}%</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white/80 backdrop-blur-xl border-white/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-lg">Daily Attendance Log</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {attendance.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-10 text-center text-slate-400">
                                            No attendance records found yet.
                                        </td>
                                    </tr>
                                ) : (
                                    attendance.map((record, index) => (
                                        <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                {new Date(record.attendance_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(record.status)}
                                                    <span className="capitalize">{record.status || 'Not Recorded'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm italic">
                                                {record.absent_reason || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CandidateAttendanceTab;
