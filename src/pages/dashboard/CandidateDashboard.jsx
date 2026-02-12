import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import Meta from '../../components/common/Meta';

const CandidateDashboard = () => {
    return (
        <div className="space-y-6">
            <Meta title="Candidate Dashboard" description="Candidate Dashboard" />
            <h1 className="text-2xl font-bold text-slate-800">Candidate Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm">
                    <CardHeader>
                        <CardTitle>My Enrolled Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-500">You are not enrolled in any courses yet.</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm">
                    <CardHeader>
                        <CardTitle>Certifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-500">No certifications earned yet.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CandidateDashboard;
