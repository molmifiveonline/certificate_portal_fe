import React, { useState, useEffect, createContext, useContext } from 'react';
import Meta from "../../components/common/Meta";
import PageHeader from "../../components/common/PageHeader";
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import { Save, BookOpen, FileText } from 'lucide-react';
import { Button } from "../../components/ui/button";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import BackButton from '../../components/common/BackButton';

const FormContext = createContext();

const InputField = ({ label, name, type = "text", required, placeholder }) => {
    const { register, errors } = useContext(FormContext);
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                {...register(name, { required: required ? `${label} is required` : false })}
                className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors[name] ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
                placeholder={placeholder}
            />
            {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
        </div>
    );
};

const SelectField = ({ label, name, children, required }) => {
    const { register, errors } = useContext(FormContext);
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                {...register(name, { required: required ? `${label} is required` : false })}
                className={`w-full h-11 px-4 rounded-xl bg-slate-50/50 border ${errors[name] ? 'border-red-500' : 'border-slate-200'} focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm`}
            >
                <option value="">Select {label}</option>
                {children}
            </select>
            {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
        </div>
    );
};

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
        <FormContext.Provider value={{ register, errors }}>
            <div className="min-h-screen bg-slate-50">
                <Meta title={id ? "Edit Master Course" : "Add Master Course"} description="Manage Master Course Details" />

                {/* Header */}
                <PageHeader
                    title={id ? 'Edit Master Course' : 'Create Master Course'}
                    subtitle={id ? 'Update master course details' : 'Define a new master course template'}
                    compact={true}
                    backButton={<BackButton to="/courses" />}
                    className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 shadow-sm mb-0"
                />

                {/* Form Content */}
                <div className="max-w-[1600px] mx-auto p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column: Basic Details */}
                            <div className="space-y-8">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <BookOpen size={20} className="text-blue-600" />
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
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-lg font-bold">
                                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <FileText size={20} className="text-blue-600" />
                                        Additional Information
                                    </h3>
                                    <div className="space-y-6 font-normal">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 block">Description</label>
                                            <div className="editor-container">
                                                <ReactQuill
                                                    theme="snow"
                                                    value={watch('description') || ''}
                                                    onChange={(val) => setValue('description', val)}
                                                    className="bg-white min-h-[200px] mb-12"
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
                                                    className="bg-white min-h-[120px] mb-12"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 sm:p-6 -mx-8 -mb-8 flex justify-end z-10 mt-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-b-xl">
                            <div className="flex gap-4 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => navigate('/courses')}
                                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70 text-sm min-w-[160px]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>{id ? 'Update' : 'Create'} Master Course</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </FormContext.Provider>
    );
};

export default MasterCourseForm;
