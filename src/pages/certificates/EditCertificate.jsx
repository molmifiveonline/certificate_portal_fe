import React, { useState, useEffect } from "react";
import Meta from "../../components/common/Meta";
import { useNavigate, useParams } from "react-router-dom";
import { Award, Save, Loader2 } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import BackButton from "../../components/common/BackButton";
import api from "../../lib/api";
import candidateService from "../../services/candidateService";
import activeCourseService from "../../services/activeCourseService";
import certificateService from "../../services/certificateService";
import { toast } from "sonner";

const EditCertificate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [candidates, setCandidates] = useState([]);
    const [masterCourses, setMasterCourses] = useState([]);
    const [activeCourses, setActiveCourses] = useState([]);
    const [trainers, setTrainers] = useState([]);

    const [formData, setFormData] = useState({
        candidate_id: "",
        course_id: "", // Master Course ID
        active_course_id: "",
        trainer_id: "",
        type: "Others",
        topic: "",
        course_level: "Operational",
        location: "",
        course_conduct: "ONS",
        from_date: "",
        to_date: "",
        issue_date: "",
        days: 0,
        remarks: "",
        description1: "",
        show_logo: 1,
        sample_cert: 0,
        status: 0,
        certificate_no: "",
        is_hidden: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [candRes, mcRes, acRes, trRes, certRes] = await Promise.all([
                    candidateService.getAllCandidates({ limit: 1000 }),
                    api.get('/master-courses', { params: { limit: 1000 } }),
                    activeCourseService.getAllCourses({ limit: 1000 }),
                    api.get('/trainer', { params: { limit: 1000 } }),
                    certificateService.getCertificateById(id)
                ]);

                setCandidates(candRes.data || []);
                setMasterCourses(mcRes.data?.data || []);
                setActiveCourses(acRes.data || []);
                setTrainers(trRes.data?.data || []);

                if (certRes) {
                    setFormData({
                        ...certRes,
                        from_date: certRes.from_date?.split('T')[0] || "",
                        to_date: certRes.to_date?.split('T')[0] || "",
                        issue_date: certRes.issue_date?.split('T')[0] || "",
                        show_logo: certRes.show_logo === 1,
                        sample_cert: certRes.sample_cert === 1,
                        is_hidden: certRes.is_hidden || 0
                    });
                }
            } catch (err) {
                console.error("Error fetching form data:", err);
                toast.error("Failed to load certificate data.");
                navigate("/certificates");
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            if (name === 'course_id') {
                const selectedCourse = masterCourses.find(c => c.id === value);
                if (selectedCourse) {
                    newData.topic = selectedCourse.topic;
                    newData.type = selectedCourse.certificate_type || "Others";
                    newData.description1 = selectedCourse.description;
                }
            }

            if (name === 'active_course_id') {
                const selectedActive = activeCourses.find(c => c.id === value);
                if (selectedActive) {
                    newData.from_date = selectedActive.start_date?.split('T')[0] || "";
                    newData.to_date = selectedActive.end_date?.split('T')[0] || "";
                    newData.days = selectedActive.no_of_days || 0;
                    newData.location = selectedActive.type_of_location || "";
                    newData.course_conduct = selectedActive.type_of_location === "Online" ? "ONL" : "ONS";
                    newData.trainer_id = selectedActive.primary_trainer_id || prev.trainer_id;
                    if (!newData.course_id) newData.course_id = selectedActive.master_course_id;
                    if (!newData.topic) newData.topic = selectedActive.topic;
                }
            }

            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submitData = { ...formData };
            // Convert booleans back to 1/0
            submitData.show_logo = submitData.show_logo ? 1 : 0;
            submitData.sample_cert = submitData.sample_cert ? 1 : 0;

            // Backend updateCertificate expects id as first param
            await certificateService.updateCertificate(id, submitData);
            toast.success("Certificate updated successfully");
            navigate("/certificates");
        } catch (err) {
            console.error("Error updating certificate:", err);
            toast.error(err.response?.data?.message || "Failed to update certificate");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex bg-white h-full items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto w-full">
            <Meta title="Edit Certificate" description="Update certificate details" />

            <div className="flex items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-xl">
                            <Award className="w-8 h-8 text-blue-600" />
                        </div>
                        Edit Certificate
                    </h1>
                    <p className="text-slate-500 mt-1">Modify details for certificate #{formData.certificate_no}</p>
                </div>
                <BackButton to="/certificates" />
            </div>

            <Card className="rounded-3xl border-slate-200/60 bg-white shadow-xl overflow-hidden mb-8">
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Certificate Number (Read-only) */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Certificate No.</label>
                                <input
                                    type="text"
                                    value={formData.certificate_no}
                                    readOnly
                                    className="w-full h-11 px-4 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                                />
                            </div>

                            {/* Candidate Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Candidate <span className="text-red-500">*</span></label>
                                <select
                                    name="candidate_id"
                                    value={formData.candidate_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                >
                                    <option value="">Select Candidate</option>
                                    {candidates.map(c => (
                                        <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.empId})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Active Course Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Active Course Link</label>
                                <select
                                    name="active_course_id"
                                    value={formData.active_course_id || ""}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                >
                                    <option value="">Select Active Course</option>
                                    {activeCourses.map(c => (
                                        <option key={c.id} value={c.id}>{c.course_id} - {c.course_name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Master Course Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Master Course <span className="text-red-500">*</span></label>
                                <select
                                    name="course_id"
                                    value={formData.course_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                >
                                    <option value="">Select Master Course</option>
                                    {masterCourses.map(c => (
                                        <option key={c.id} value={c.id}>{c.master_course_name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Trainer Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Trainer <span className="text-red-500">*</span></label>
                                <select
                                    name="trainer_id"
                                    value={formData.trainer_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                >
                                    <option value="">Select Trainer</option>
                                    {trainers.map(t => (
                                        <option key={t.id} value={t.id}>{t.prefix} {t.first_name} {t.last_name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Certificate Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                >
                                    <option value="Others">Others</option>
                                    <option value="DNV-ST0029">DNV-ST0029</option>
                                    <option value="DNV-ST008">DNV-ST008</option>
                                    <option value="SIGTTO / LNG">SIGTTO / LNG</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                >
                                    <option value={0}>Valid</option>
                                    <option value={1}>Invalid</option>
                                </select>
                            </div>

                            {/* Topic */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Topic/Task <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="topic"
                                    value={formData.topic}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>

                            {/* Course Level */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Course Level</label>
                                <select
                                    name="course_level"
                                    value={formData.course_level}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                >
                                    <option value="Operational">Operational</option>
                                    <option value="Management">Management</option>
                                    <option value="Support">Support</option>
                                </select>
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>

                            {/* Conduct */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Course Conduct</label>
                                <select
                                    name="course_conduct"
                                    value={formData.course_conduct}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                >
                                    <option value="ONS">ONS (Onsite)</option>
                                    <option value="ONL">ONL (Online)</option>
                                </select>
                            </div>

                            {/* Dates */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">From Date</label>
                                <input
                                    type="date"
                                    name="from_date"
                                    value={formData.from_date}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">To Date</label>
                                <input
                                    type="date"
                                    name="to_date"
                                    value={formData.to_date}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Issue Date</label>
                                <input
                                    type="date"
                                    name="issue_date"
                                    value={formData.issue_date}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Days</label>
                                <input
                                    type="number"
                                    name="days"
                                    value={formData.days}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>

                            {/* Options */}
                            <div className="flex gap-6 mt-4 md:col-span-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="show_logo"
                                        checked={formData.show_logo}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-semibold text-slate-700">Display Logo</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="sample_cert"
                                        checked={formData.sample_cert}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-semibold text-slate-700">Sample Certificate</span>
                                </label>
                            </div>

                            {/* Hide */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Hide Certificate</label>
                                <select
                                    name="is_hidden"
                                    value={formData.is_hidden}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                >
                                    <option value={0}>No</option>
                                    <option value={1}>Yes</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Certificate Description</label>
                            <textarea
                                name="description1"
                                value={formData.description1}
                                onChange={handleChange}
                                rows={4}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>

                        {/* Remarks */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Remarks</label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                rows={2}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>

                        <div className="flex justify-end pt-4 gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                                className="px-6 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="px-8 rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                                <Save className="w-4 h-4" />
                                {loading ? "Saving..." : "Update Certificate"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditCertificate;
