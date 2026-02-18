import React, { useState, useEffect } from 'react';
import Meta from "../../components/common/Meta";
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import { Save, ArrowLeft, BookOpen, MapPin, Calendar, FileText, Video, Clock, Users, Link as LinkIcon, Check, ChevronDown } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const MultiSelectInput = ({ value = [], onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (optionValue) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    const selectedLabels = options
        .filter(opt => value.includes(opt.value))
        .map(opt => opt.label);

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 flex items-center justify-between cursor-pointer focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm text-slate-600"
            >
                <span className="truncate">
                    {selectedLabels.length > 0 ? selectedLabels.join(', ') : 'Select trainers...'}
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto p-1">
                    {options.map(opt => (
                        <div
                            key={opt.value}
                            onClick={() => toggleOption(opt.value)}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm text-slate-600"
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${value.includes(opt.value) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                {value.includes(opt.value) && <Check size={12} className="text-white" />}
                            </div>
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ActiveCourseForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm();
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
                        topic: data.topic || '',
                        start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : '',
                        end_date: data.end_date ? new Date(data.end_date).toISOString().split('T')[0] : '',
                        start_time: data.start_time || '',
                        end_time: data.end_time || '',
                        whatsapp_link: data.whatsapp_link || '',
                        zoom_link: data.zoom_link || '',
                        status: data.status || 'Initiated',
                        primary_trainer_id: data.primary_trainer_id || '',
                        secondary_trainer_ids: data.secondary_trainer_ids ? data.secondary_trainer_ids.split(',') : [],
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
                await api.put(`/courses/${id}`, {
                    ...data,
                    secondary_trainer_ids: Array.isArray(data.secondary_trainer_ids) ? data.secondary_trainer_ids.join(',') : data.secondary_trainer_ids
                });
                toast.success('Course updated successfully');
            } else {
                await api.post('/courses', {
                    ...data,
                    secondary_trainer_ids: Array.isArray(data.secondary_trainer_ids) ? data.secondary_trainer_ids.join(',') : data.secondary_trainer_ids
                });
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
            <label className="text-sm font-medium text-slate-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                {...register(name, { required: required ? `${label} is required` : false })}
                readOnly={readOnly}
                className={`w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm ${readOnly
                    ? 'bg-slate-100/50 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-50/50 text-slate-600'
                    }`}
                placeholder={placeholder}
            />
            {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
        </div>
    );

    const SelectField = ({ label, name, options, required, children }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                {...register(name, { required: required ? `${label} is required` : false })}
                className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm"
            >
                <option value="">Select {label}</option>
                {options ? options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                )) : children}
            </select>
            {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
        </div>
    );

    const MultiSelectField = ({ label, name, options, control }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">{label}</label>
            <Controller
                name={name}
                control={control}
                defaultValue={[]}
                render={({ field: { value, onChange } }) => (
                    <MultiSelectInput value={value} onChange={onChange} options={options} />
                )}
            />
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
                    <Link
                        to="/active-courses"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to List
                    </Link>
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

                                    {id && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InputField label="Course ID" name="course_id" readOnly placeholder="Auto-generated" />
                                            <SelectField label="Status" name="status" required>
                                                <option value="Initiated">Initiated</option>
                                                <option value="Course started">Course started</option>
                                                <option value="Assessment initiated">Assessment initiated</option>
                                                <option value="Feedback generated">Feedback generated</option>
                                                <option value="Certificate generated">Certificate generated</option>
                                                <option value="Course completed">Course completed</option>
                                            </SelectField>
                                        </div>
                                    )}

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
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <InputField label="Start Date" name="start_date" type="date" required />
                                        <InputField label="End Date" name="end_date" type="date" required />
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-slate-700 block">Duration (Days)</label>
                                            <div className="w-full h-11 px-4 rounded-xl bg-slate-100/50 border border-slate-200 flex items-center text-sm text-slate-500">
                                                {watch('start_date') && watch('end_date')
                                                    ? Math.max(0, Math.ceil((new Date(watch('end_date')) - new Date(watch('start_date'))) / (1000 * 60 * 60 * 24)) + 1)
                                                    : '-'} Days
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Start Time" name="start_time" type="time" />
                                        <InputField label="End Time" name="end_time" type="time" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectField label="Location Type" name="type_of_location" required
                                            options={[
                                                { value: 'Online', label: 'Online' },
                                                { value: 'Offline', label: 'Offline' },
                                                { value: 'Manual', label: 'Manual' },
                                            ]}
                                        />
                                        {typeOfLocation === 'Offline' && (
                                            <SelectField label="Venue / Location" name="location_id" required>
                                                {locations.map(loc => (
                                                    <option key={loc.id} value={loc.id}>{loc.location_name}</option>
                                                ))}
                                                <option value="Other">Other</option>
                                            </SelectField>
                                        )}
                                        {typeOfLocation === 'Manual' && (
                                            <InputField label="Specify Location" name="other_location" required placeholder="Enter location manually" />
                                        )}
                                    </div>

                                    {typeOfLocation === 'Offline' && watch('location_id') === 'Other' && (
                                        <InputField label="Specify Other Location" name="other_location" required placeholder="Enter location" />
                                    )}

                                    {typeOfLocation === 'Online' && (
                                        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 space-y-4">
                                            <h4 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                                                <Video size={16} />
                                                Zoom Meeting Details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InputField label="Zoom Username" name="zoom_username" placeholder="e.g. user@example.com" />
                                                <InputField label="Zoom Password" name="zoom_password" placeholder="Meeting password" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Trainers & Links */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                                    Trainers & Links
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectField label="Primary Trainer" name="primary_trainer_id" required>
                                            {trainers.map(tr => (
                                                <option key={tr.id} value={tr.id}>{tr.first_name} {tr.last_name}</option>
                                            ))}
                                        </SelectField>
                                        <MultiSelectField
                                            label="Secondary Trainers"
                                            name="secondary_trainer_ids"
                                            control={control}
                                            options={trainers.map(tr => ({ value: tr.id, label: `${tr.first_name} ${tr.last_name}` }))}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="WhatsApp Group Link" name="whatsapp_link" placeholder="https://chat.whatsapp.com/..." />
                                        <InputField label="Zoom Meeting Link" name="zoom_link" placeholder="https://zoom.us/j/..." />
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
                                onClick={() => navigate('/active-courses')}
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
