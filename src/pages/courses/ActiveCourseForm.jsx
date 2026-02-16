import React, { useState, useEffect } from 'react';
import Meta from "../../components/common/Meta";
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import { Save, ArrowLeft, BookOpen, MapPin, Calendar, FileText } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const ActiveCourseForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(!!id);

    // Dropdown Data
    const [masterCourses, setMasterCourses] = useState([]);
    const [locations, setLocations] = useState([]);
    const [trainers, setTrainers] = useState([]);

    const typeOfLocation = watch('type_of_location');
    const selectedTopic = watch('topic');

    // Fetch Dependencies
    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const [mcRes, locRes, trRes] = await Promise.all([
                    api.get('/master-courses'),
                    api.get('/locations'),
                    api.get('/trainer')
                ]);
                // Helper to extract array from various response structures
                const getArrayData = (res) => {
                    if (Array.isArray(res.data)) return res.data;
                    if (res.data && Array.isArray(res.data.data)) return res.data.data;
                    if (res.data && res.data.data && Array.isArray(res.data.data.data)) return res.data.data.data;
                    return [];
                };

                setMasterCourses(getArrayData(mcRes));
                setLocations(getArrayData(locRes));
                setTrainers(getArrayData(trRes));
            } catch (error) {
                console.error('Error fetching dependencies:', error);
                toast.error('Failed to load form dependencies');
            }
        };
        fetchDependencies();
    }, []);

    // Fetch Course Data if Edit Mode
    useEffect(() => {
        if (id) {
            const fetchCourse = async () => {
                try {
                    const response = await api.get(`/courses/${id}`);
                    const data = response.data;

                    // Reset form with fetched data
                    reset({
                        ...data,
                        topic: data.topic || '', // Ensure it maps to master course ID if that's how it's stored
                        start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : '',
                        end_date: data.end_date ? new Date(data.end_date).toISOString().split('T')[0] : ''
                    });
                } catch (error) {
                    console.error('Error fetching course:', error);
                    toast.error('Failed to load course details');
                    navigate('/active-courses');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCourse();
        }
    }, [id, navigate, reset]);

    // Auto-populate from Master Course
    useEffect(() => {
        if (selectedTopic && masterCourses.length > 0) {
            const selectedMC = masterCourses.find(mc => mc.id === selectedTopic);
            if (selectedMC) {
                setValue('master_course_id', selectedMC.id);
                setValue('master_course_name', selectedMC.master_course_name);
                setValue('description', selectedMC.description);
                setValue('remarks', selectedMC.remarks);
            }
        }
    }, [selectedTopic, masterCourses, setValue]);


    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            // Ensure master_course_name is set
            if (!data.master_course_name) {
                const mc = masterCourses.find(m => m.id === data.topic);
                if (mc) data.master_course_name = mc.master_course_name;
            }

            if (id) {
                await api.put(`/courses/${id}`, data);
                toast.success('Course updated successfully');
            } else {
                await api.post('/courses', data);
                toast.success('Course created successfully');
            }
            navigate('/active-courses');
        } catch (error) {
            console.error('Error saving course:', error);
            toast.error(error.response?.data?.message || 'Failed to save course');
        } finally {
            setIsSubmitting(false);
        }
    };

    const InputField = ({ label, name, type = "text", required, placeholder, readOnly }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                {...register(name, { required: required ? `${label} is required` : false })}
                readOnly={readOnly}
                className={`w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm ${readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:bg-white'}`}
                placeholder={placeholder}
            />
            {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
        </div>
    );

    const SelectField = ({ label, name, options, required, children }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                {...register(name, { required: required ? `${label} is required` : false })}
                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 outline-none text-sm transition-all"
            >
                <option value="">Select {label}</option>
                {options ? options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                )) : children}
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
            <Meta title={id ? "Edit Course" : "Add Course"} description={id ? "Edit Active Course Details" : "Create New Active Course"} />

            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <BookOpen size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">{id ? 'Edit Course' : 'Create New Course'}</h1>
                            <p className="text-sm text-slate-500">
                                {id ? 'Update course details and schedule' : 'Schedule a new active course'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/active-courses')}
                        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all text-sm font-medium"
                    >
                        <ArrowLeft size={18} />
                        Back to List
                    </button>
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-none">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-[1600px] mx-auto p-8">

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Left Column: Course Details */}
                        <div className="space-y-8">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                                    Course Details
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectField label="Topic" name="topic" required>
                                            {masterCourses.map(mc => (
                                                <option key={mc.id} value={mc.id}>{mc.topic}</option>
                                            ))}
                                        </SelectField>
                                        <InputField label="Master Course Name" name="master_course_name" readOnly />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Course Name" name="course_name" required placeholder="e.g. Batch 2024-A" />
                                        <SelectField label="Course Level" name="course_level" required>
                                            <option value="Operational">Operational</option>
                                            <option value="Management">Management</option>
                                        </SelectField>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectField label="Type of Course" name="type_of_course" required>
                                            <option value="Inhouse">Inhouse</option>
                                            <option value="Outhouse">Outhouse</option>
                                            <option value="CBT">CBT</option>
                                            <option value="Inhouse (Third party)">Inhouse (Third party)</option>
                                        </SelectField>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
                                    Schedule & Location
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Start Date" name="start_date" type="date" required />
                                        <InputField label="End Date" name="end_date" type="date" required />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectField label="Location Type" name="type_of_location" required>
                                            {locations.map(loc => (
                                                <option key={loc.id} value={loc.location_name}>{loc.location_name}</option>
                                            ))}
                                            <option value="Other">Other</option>
                                        </SelectField>
                                        {typeOfLocation === 'Other' && (
                                            <InputField label="Specify Location" name="other_location" required placeholder="Enter location" />
                                        )}
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
                                        <label className="text-sm font-medium text-gray-700 block">Description</label>
                                        <ReactQuill
                                            theme="snow"
                                            value={watch('description') || ''}
                                            onChange={(val) => setValue('description', val)}
                                            className="bg-white h-48 mb-12"
                                        />
                                    </div>
                                    <div className="space-y-2 pt-4">
                                        <label className="text-sm font-medium text-gray-700 block">Remarks</label>
                                        <ReactQuill
                                            theme="snow"
                                            value={watch('remarks') || ''}
                                            onChange={(val) => setValue('remarks', val)}
                                            className="bg-white h-32 mb-12"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 -mx-8 -mb-8 flex justify-end">
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/active-courses')}
                                className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <Save size={18} />
                                <span>{isSubmitting ? 'Saving...' : 'Save Course'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActiveCourseForm;
