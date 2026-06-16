import React, { useState, useEffect } from 'react';
import { getErrorMessage } from '../../lib/utils/errorUtils';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { BookOpen, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Meta from '../../components/common/Meta';
import { toast } from "sonner";
import api from '../../lib/api';
import { formatDate } from '../../lib/utils/dateUtils';

// Tab Components
import CandidateAttendanceTab from './tabs/CandidateAttendanceTab';
import CandidateAssessmentTab from './tabs/CandidateAssessmentTab';
import CandidateFeedbackTab from './tabs/CandidateFeedbackTab';

const CandidateCourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const response = await api.get(`/active-courses/${id}`);
                setCourse(response.data);
            } catch (error) {
                console.error("Error fetching course details:", error);
                toast.error(getErrorMessage(error, "Failed to load course details"));
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold">Course not found</h2>
                <button
                    onClick={() => navigate('/candidate-courses')}
                    className="mt-4 text-primary hover:underline flex items-center justify-center mx-auto"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Courses
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Meta title={`${course.course_name || course.topic} - Details`} />

            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => navigate('/candidate-courses')}
                    className="group w-fit flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to My Courses
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 shadow-none">
                                {course.course_type || "Standard"}
                            </Badge>
                            <Badge variant="outline" className="border-slate-200 text-slate-500">
                                {course.status}
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                            {course.course_name || course.topic}
                        </h1>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="flex flex-col px-4 py-2 bg-white/50 border border-white rounded-xl backdrop-blur-sm">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Start Date</span>
                            <span className="font-semibold text-slate-700">{formatDate(course.start_date)}</span>
                        </div>
                        <div className="flex flex-col px-4 py-2 bg-white/50 border border-white rounded-xl backdrop-blur-sm">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">End Date</span>
                            <span className="font-semibold text-slate-700">{formatDate(course.end_date)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="details" className="w-full">
                <TabsList className="flex w-full justify-start space-x-6 bg-transparent border-b border-slate-200 rounded-none p-0 h-auto">
                    <TabsTrigger
                        value="details"
                        className="bg-transparent text-slate-500 hover:text-slate-800 px-2 py-3 text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none"
                    >
                        Details
                    </TabsTrigger>
                    <TabsTrigger
                        value="attendance"
                        className="bg-transparent text-slate-500 hover:text-slate-800 px-2 py-3 text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none"
                    >
                        Attendance
                    </TabsTrigger>
                    <TabsTrigger
                        value="assessment"
                        className="bg-transparent text-slate-500 hover:text-slate-800 px-2 py-3 text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none"
                    >
                        Assessment
                    </TabsTrigger>
                    <TabsTrigger
                        value="feedback"
                        className="bg-transparent text-slate-500 hover:text-slate-800 px-2 py-3 text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none"
                    >
                        Feedback
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8">
                    <TabsContent value="details" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center">
                                        <BookOpen className="h-5 w-5 mr-2 text-primary" />
                                        Course Description
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-slate-600 leading-relaxed">
                                    {course.description ? (
                                        <div
                                            className="prose prose-slate prose-sm max-w-none break-words overflow-hidden"
                                            dangerouslySetInnerHTML={{ __html: course.description }}
                                        />
                                    ) : (
                                        "No description provided for this course."
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center">
                                        <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-500" />
                                        Course Highlights
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center text-sm">
                                        <div className="w-2 h-2 rounded-full bg-primary mr-3" />
                                        <span>Duration: {course.no_of_days} Days</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <div className="w-2 h-2 rounded-full bg-primary mr-3" />
                                        <span>Type: {course.type_of_course || "Classroom"}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <div className="w-2 h-2 rounded-full bg-primary mr-3" />
                                        <span>Venue: {course.venue_name || 'TBD'}</span>
                                    </div>
                                    {course.candidate_material_link && (
                                        <div className="pt-2 border-t border-slate-100 flex flex-col text-sm">
                                            <span className="font-semibold text-slate-700 mb-1">Candidate Material:</span>
                                            <a
                                                href={course.candidate_material_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline break-all"
                                            >
                                                {course.candidate_material_link}
                                            </a>
                                        </div>
                                    )}
                                    {course.study_material_link && (
                                        <div className="pt-2 border-t border-slate-100 flex flex-col text-sm">
                                            <span className="font-semibold text-slate-700 mb-1">Study Material Link:</span>
                                            <a
                                                href={course.study_material_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline break-all"
                                            >
                                                {course.study_material_link}
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="attendance">
                        <CandidateAttendanceTab courseId={id} />
                    </TabsContent>

                    <TabsContent value="assessment">
                        <CandidateAssessmentTab courseId={id} />
                    </TabsContent>

                    <TabsContent value="feedback">
                        <CandidateFeedbackTab courseId={id} course={course} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default CandidateCourseDetails;


