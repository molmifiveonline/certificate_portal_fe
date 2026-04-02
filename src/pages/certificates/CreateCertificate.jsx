import React, { useState, useEffect } from "react";
import Meta from "../../components/common/Meta";
import { useNavigate } from "react-router-dom";
import { Award, Save, Users, Loader2 } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import PageHeader from "../../components/common/PageHeader";
import CandidateSelectionModal from "./CandidateSelectionModal";
import api from "../../lib/api";
import candidateService from "../../services/candidateService";
import activeCourseService from "../../services/activeCourseService";
import certificateService from "../../services/certificateService";
import { toast } from "sonner";

const supportsStampLogo = (type) =>
    type === "DNV-ST0029" || type === "DNV-ST008";

const getCertificateTypeHint = (type) => {
    if (type === "SIGTTO / LNG") {
        return "Certificate number is generated as MOLTC (Trainer Nation)- LNG(Year)-(Candidate Nation)-####.";
    }

    if (supportsStampLogo(type)) {
        return "Certificate number is generated as TOPIC/YYMM/#### and the DNV footer mark is available on print.";
    }

    return "Certificate number is generated as TOPIC/YYMM/#### and the DNV footer mark stays hidden for Others.";
};

const CreateCertificate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [candidates, setCandidates] = useState([]);
    const [masterCourses, setMasterCourses] = useState([]);
    const [activeCourses, setActiveCourses] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [locations, setLocations] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        candidate_ids: [],
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
        issue_date: new Date().toISOString().split('T')[0],
        days: 0,
        remarks: "",
        description1: "",
        show_logo: 1,
        status: 0,
        is_hidden: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [candRes, mcRes, acRes, trRes, locRes] = await Promise.all([
                    candidateService.getAllCandidates({ limit: 1000 }),
                    api.get('/master-courses', { params: { limit: 1000 } }),
                    activeCourseService.getAllCourses({ limit: 1000 }),
                    api.get('/trainer', { params: { limit: 1000 } }),
                    api.get('/locations', { params: { limit: 1000 } })
                ]);

                setCandidates(candRes.data || []);
                setMasterCourses(mcRes.data?.data || []);
                setActiveCourses(acRes.data || []);
                setTrainers(trRes.data?.data || []);

                // Location API returns data in slightly different nested structures sometimes
                let locs = locRes.data?.data?.data || locRes.data?.data || [];
                if (!Array.isArray(locs)) locs = [];
                setLocations(locs);
            } catch (err) {
                console.error("Error fetching form data:", err);
                toast.error("Failed to load required data.");
            }
        };
        fetchData();
    }, []);

    // Auto-calculate days based on from/to dates
    useEffect(() => {
        if (formData.from_date && formData.to_date) {
            const start = new Date(formData.from_date);
            const end = new Date(formData.to_date);
            if (end >= start) {
                const diffMs = end - start;
                const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
                setFormData(prev => ({ ...prev, days: diffDays }));
            }
        }
    }, [formData.from_date, formData.to_date]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Auto-fill topic if master course changes
            if (name === 'course_id') {
                const selectedCourse = masterCourses.find(c => c.id === value);
                if (selectedCourse) {
                    newData.topic = selectedCourse.topic;
                    newData.type = selectedCourse.certificate_type || "Others";
                    newData.description1 = selectedCourse.description || "";
                    newData.remarks = selectedCourse.remarks || "";
                    newData.show_logo = supportsStampLogo(newData.type);
                }
            }

            // Auto-select type, course name if topic changes
            if (name === 'topic') {
                const matchingCourses = masterCourses.filter(c => c.topic === value);
                if (matchingCourses.length > 0) {
                    // Taking the first course for that topic to auto-fill
                    const selectedCourse = matchingCourses[0];
                    newData.course_id = selectedCourse.id;
                    newData.type = selectedCourse.certificate_type || "Others";
                    newData.description1 = selectedCourse.description || "";
                    newData.remarks = selectedCourse.remarks || "";
                    newData.show_logo = supportsStampLogo(newData.type);
                } else {
                    newData.course_id = "";
                    newData.type = "Others";
                    newData.description1 = "";
                    newData.remarks = "";
                    newData.show_logo = false;
                }
            }

            if (name === 'type') {
                newData.show_logo = supportsStampLogo(value);
            }

            // Auto-fill dates if active course changes
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

        // Validation
        const errors = {};
        if (formData.candidate_ids.length === 0) {
            errors.candidate_ids = "Please select at least one candidate";
        }
        if (!formData.course_id) {
            errors.course_id = "Master Course is required";
        }
        if (!formData.trainer_id) {
            errors.trainer_id = "Trainer is required";
        }
        if (!formData.topic.trim()) {
            errors.topic = "Topic is required";
        }
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});

        setLoading(true);
        try {
            // Clean up empty optional fields
            const submitData = { ...formData };
            if (!submitData.active_course_id) delete submitData.active_course_id;

            // Map frontend candidate_ids back to candidate_id for API compatibility
            submitData.candidate_id = submitData.candidate_ids;
            delete submitData.candidate_ids;

            // Convert booleans to 1/0 for backend
            submitData.show_logo = submitData.show_logo ? 1 : 0;
            submitData.sample_cert = submitData.sample_cert ? 1 : 0;

            await certificateService.createManualCertificate(submitData);
            toast.success("Certificates created successfully");
            navigate("/certificates");
        } catch (err) {
            console.error("Error creating certificates:", err);
            toast.error(err.response?.data?.message || "Failed to create certificates");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full pb-20">
            <Meta title="Add Certificate" description="Create a manual certificate" />

            <PageHeader
                title="Add Certificate"
                subtitle="Create a new certificate manually"
                icon={Award}
                compact={true}
                backTo="/certificates"
            />

            <form onSubmit={handleSubmit} noValidate>
                <Card className="rounded-3xl border-slate-200/60 bg-white shadow-xl overflow-hidden mb-8">
                    <CardContent className="p-8">
                        <div className="space-y-6 grid grid-cols-1 gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Candidate Selection array via Modal */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700">Candidates <span className="text-red-500">*</span></label>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsModalOpen(true)}
                                            className="h-11 px-6 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl"
                                        >
                                            <Users className="w-4 h-4 mr-2" />
                                            Select Candidates
                                        </Button>

                                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-11 flex items-center">
                                            {formData.candidate_ids.length > 0 ? (
                                                <span className="text-sm text-slate-700 font-medium">
                                                    {formData.candidate_ids.length} candidate(s) selected
                                                </span>
                                            ) : (
                                                <span className="text-sm text-slate-500 italic">No candidates selected for batch creation</span>
                                            )}
                                        </div>
                                    </div>
                                    {formData.candidate_ids.length === 0 && (
                                        <p className="text-xs text-amber-600 mt-1">Please select at least one candidate.</p>
                                    )}
                                </div>

                                {/* Active Course Selection (Optional but helpful) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Link to Active Course (Optional)</label>
                                    <select
                                        name="active_course_id"
                                        value={formData.active_course_id}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                    >
                                        <option value="">Select Active Course (Auto-fills details)</option>
                                        {activeCourses.map(c => (
                                            <option key={c.id} value={c.id}>{c.course_id} - {c.course_name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Master Course Selection / Course Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Course Name <span className="text-red-500">*</span></label>
                                    <select
                                        name="course_id"
                                        value={formData.course_id}
                                        onChange={(e) => {
                                            handleChange(e);
                                            if (formErrors.course_id) setFormErrors(prev => ({ ...prev, course_id: undefined }));
                                        }}
                                        className={`w-full h-11 px-4 bg-slate-50 border ${formErrors.course_id ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm`}
                                    >
                                        <option value="">Select Course Name</option>
                                        {masterCourses
                                            .filter(c => !formData.topic || c.topic === formData.topic)
                                            .map(c => (
                                                <option key={c.id} value={c.id}>{c.master_course_name}</option>
                                            ))}
                                    </select>
                                    {formErrors.course_id && <span className="text-red-500 text-xs mt-1 block">{formErrors.course_id}</span>}
                                </div>

                                {/* Trainer Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Trainer <span className="text-red-500">*</span></label>
                                    <select
                                        name="trainer_id"
                                        value={formData.trainer_id}
                                        onChange={(e) => {
                                            handleChange(e);
                                            if (formErrors.trainer_id) setFormErrors(prev => ({ ...prev, trainer_id: undefined }));
                                        }}
                                        className={`w-full h-11 px-4 bg-slate-50 border ${formErrors.trainer_id ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm`}
                                    >
                                        <option value="">Select Trainer</option>
                                        {trainers.map(t => (
                                            <option key={t.id} value={t.id}>{t.prefix} {t.first_name} {t.last_name}</option>
                                        ))}
                                    </select>
                                    {formErrors.trainer_id && <span className="text-red-500 text-xs mt-1 block">{formErrors.trainer_id}</span>}
                                </div>

                                {/* Type */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Certificate Type</label>
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
                                    <p className="text-xs text-slate-500">
                                        {getCertificateTypeHint(formData.type)}
                                    </p>
                                </div>

                                {/* Topic */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Topic/Task <span className="text-red-500">*</span></label>
                                    <select
                                        name="topic"
                                        value={formData.topic}
                                        onChange={(e) => {
                                            handleChange(e);
                                            if (formErrors.topic) setFormErrors(prev => ({ ...prev, topic: undefined }));
                                        }}
                                        className={`w-full h-11 px-4 bg-slate-50 border ${formErrors.topic ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm`}
                                    >
                                        <option value="">Select Topic</option>
                                        {[...new Set(masterCourses.map(c => c.topic).filter(Boolean))].map((topic, idx) => (
                                            <option key={idx} value={topic}>{topic}</option>
                                        ))}
                                    </select>
                                    {formErrors.topic && <span className="text-red-500 text-xs mt-1 block">{formErrors.topic}</span>}
                                </div>

                                {/* Level */}
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
                                    </select>
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

                                {/* Location */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700">Location</label>
                                    <select
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                    >
                                        <option value="">Select Location</option>
                                        {locations.map(loc => (
                                            <option key={loc.id} value={loc.location_name}>{loc.location_name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dates */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">From Date</label>
                                    <Input
                                        type="date"
                                        name="from_date"
                                        value={formData.from_date}
                                        onChange={handleChange}
                                        className="bg-slate-50 border-slate-200"
                                        placeholder="DD-MM-YYYY"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">To Date</label>
                                    <Input
                                        type="date"
                                        name="to_date"
                                        value={formData.to_date}
                                        onChange={handleChange}
                                        className="bg-slate-50 border-slate-200"
                                        placeholder="DD-MM-YYYY"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Issue Date</label>
                                    <Input
                                        type="date"
                                        name="issue_date"
                                        value={formData.issue_date}
                                        onChange={handleChange}
                                        className="bg-slate-50 border-slate-200"
                                        placeholder="DD-MM-YYYY"
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
                                <div className="flex gap-6 mt-4 md:col-span-2 flex-wrap">
                                    {supportsStampLogo(formData.type) ? (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="show_logo"
                                                checked={formData.show_logo}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-semibold text-slate-700">Display DNV Footer Mark</span>
                                        </label>
                                    ) : (
                                        <p className="text-sm text-slate-500">
                                            DNV footer mark is not used for this certificate type.
                                        </p>
                                    )}
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
                                placeholder="Core content of the certificate..."
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
                                placeholder="Any internal remarks..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="sticky bottom-0 z-10 bg-white border-t border-slate-200 p-4 sm:p-6 flex justify-end mt-8 rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#0060AA] to-[#004E8A] hover:opacity-90 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all text-sm"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                        {!loading && <Save className="w-4 h-4" />}
                        <span>{loading ? "Creating..." : "Create Certificate"}</span>
                    </button>
                </div>
            </form>

            <CandidateSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                candidates={candidates}
                selectedIds={formData.candidate_ids}
                onSelectionChange={(ids) => setFormData(prev => ({ ...prev, candidate_ids: ids }))}
            />
        </div>
    );
};

export default CreateCertificate;
