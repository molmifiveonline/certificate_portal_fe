import React, { useState, useEffect } from 'react';
import Meta from "../../components/common/Meta";
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import { Save, ArrowLeft, GraduationCap } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import BackButton from '../../components/common/BackButton';

const MasterCourseForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(!!id);

    // Fetch Course Data if Edit Mode
    useEffect(() => {
        if (id) {
            const fetchCourse = async () => {
                try {
                    const response = await api.get(`/master-courses/${id}`);
                    const data = response.data;
                    reset({
                        topic: data.topic || '',
                        master_course_name: data.master_course_name || '',
                        certificate_type: data.certificate_type || '',
                        expiry_date: data.expiry_date || '',
                        material_link: data.material_link || '',
                        description: data.description || '',
                        remarks: data.remarks || ''
                    });
                } catch (error) {
                    console.error('Error fetching course:', error);
                    toast.error('Failed to load course details');
                    navigate('/courses');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCourse();
        }
    }, [id, navigate, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (id) {
                await api.put(`/master-courses/${id}`, data);
                toast.success('Master Course updated successfully');
            } else {
                await api.post('/master-courses', data);
                toast.success('Master Course created successfully');
            }
            navigate('/courses');
        } catch (error) {
            console.error('Error saving course:', error);
            toast.error(error.response?.data?.message || 'Failed to save course');
        } finally {
            setIsSubmitting(false);
        }
    };

    const InputField = ({ label, name, type = "text", required, placeholder }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                {...register(name, { required: required ? `${label} is required` : false })}
                className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm"
                placeholder={placeholder}
            />
            {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
        </div>
    );

    const SelectField = ({ label, name, children, required }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                {...register(name, { required: required ? `${label} is required` : false })}
                className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm"
            >
                <option value="">Select {label}</option>
                {children}
            </select>
            {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
        </div>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-slate-500 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading course details...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Meta title={id ? "Edit Master Course" : "Add Master Course"} description="Manage Master Course Details" />

            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <GraduationCap size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">{id ? 'Edit Master Course' : 'Create Master Course'}</h1>
                            <p className="text-sm text-slate-500">
                                {id ? 'Update master course details' : 'Define a new master course template'}
                            </p>
                        </div>
                    </div>
                    <BackButton to="/courses" />
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-none px-4 sm:px-8 py-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-[1600px] mx-auto">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Basic Details */}
                        <div className="space-y-8">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                                    Course Details
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Topic" name="topic" required placeholder="e.g. Navigation" />
                                        <InputField label="Course Name" name="master_course_name" required placeholder="e.g. Advanced Navigation" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectField label="Certificate Type" name="certificate_type" required>
                                            <option value="SIGTTO / LNG">SIGTTO / LNG</option>
                                            <option value="DNV-ST008">DNV-ST008</option>
                                            <option value="DNV-ST0029">DNV-ST0029</option>
                                            <option value="Others">Others</option>
                                        </SelectField>
                                        <SelectField label="Expiry (Years)" name="expiry_date" required>
                                            <option value="1">1 Year</option>
                                            <option value="2">2 Years</option>
                                            <option value="3">3 Years</option>
                                            <option value="4">4 Years</option>
                                            <option value="5">5 Years</option>
                                        </SelectField>
                                    </div>
                                    <div className="space-y-1">
                                        <InputField label="Material Link" name="material_link" placeholder="https://example.com/materials" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Description & Remarks */}
                        <div className="space-y-8">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                                    Additional Information
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 block">Description</label>
                                        <div className="editor-container">
                                            <ReactQuill
                                                theme="snow"
                                                value={watch('description') || ''}
                                                onChange={(val) => setValue('description', val)}
                                                className="bg-white min-h-[200px]"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 block">Remarks</label>
                                        <div className="editor-container">
                                            <ReactQuill
                                                theme="snow"
                                                value={watch('remarks') || ''}
                                                onChange={(val) => setValue('remarks', val)}
                                                className="bg-white min-h-[120px]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 -mx-8 -mb-8 flex justify-end">
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/courses')}
                                className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <Save size={18} />
                                <span>{isSubmitting ? 'Saving...' : 'Save Master Course'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MasterCourseForm;
