import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import Meta from '../../components/common/Meta';

const TrainerDashboard = () => {
    return (
        <div className="space-y-6">
            <Meta title="Trainer Dashboard" description="Trainer Dashboard" />
            <h1 className="text-2xl font-bold text-slate-800">Trainer Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm">
                    <CardHeader>
                        <CardTitle>My Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-500">You have no active courses assigned.</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm">
                    <CardHeader>
                        <CardTitle>Pending Assessments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-500">No pending assessments.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TrainerDashboard;
