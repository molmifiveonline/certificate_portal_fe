import React, { useState, useEffect, useRef } from 'react';
import Meta from "../../components/common/Meta";
import { toast } from 'sonner';
import api from '../../lib/api';
import questionBankService from '../../services/questionBankService';
import { Save, ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const QuestionBankForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [masterCourses, setMasterCourses] = useState([]);
    const navigate = useNavigate();

    // Form fields state
    const [formValues, setFormValues] = useState({
        master_course_id: '',
        type_of_test: [],
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: [],
    });

    // File refs
    const imageRef = useRef(null);
    const optImgARef = useRef(null);
    const optImgBRef = useRef(null);
    const optImgCRef = useRef(null);
    const optImgDRef = useRef(null);

    const [previews, setPreviews] = useState({
        image: null,
        opt_img_a: null,
        opt_img_b: null,
        opt_img_c: null,
        opt_img_d: null
    });

    useEffect(() => {
        const fetchMasterCourses = async () => {
            try {
                const response = await api.get('/master-courses');
                setMasterCourses(response.data.data || []);
            } catch (error) {
                console.error("Error fetching master courses:", error);
                toast.error("Failed to load master courses.");
            }
        };
        fetchMasterCourses();
    }, []);

    useEffect(() => {
        if (isEditMode) {
            const fetchQuestion = async () => {
                try {
                    const response = await questionBankService.getQuestionById(id);
                    const q = response.data;

                    setFormValues({
                        master_course_id: q.master_course_id || '',
                        type_of_test: q.type_of_test ? q.type_of_test.split(',') : [],
                        question: q.question || '',
                        option_a: q.option_a || '',
                        option_b: q.option_b || '',
                        option_c: q.option_c || '',
                        option_d: q.option_d || '',
                        correct_option: q.correct_option ? q.correct_option.split(',').map(o => o.trim()) : [],
                    });

                    const baseUrl = process.env.REACT_APP_API_URL;
                    setPreviews({
                        image: q.image ? `${baseUrl}/${q.image}` : null,
                        opt_img_a: q.opt_img_a ? `${baseUrl}/${q.opt_img_a}` : null,
                        opt_img_b: q.opt_img_b ? `${baseUrl}/${q.opt_img_b}` : null,
                        opt_img_c: q.opt_img_c ? `${baseUrl}/${q.opt_img_c}` : null,
                        opt_img_d: q.opt_img_d ? `${baseUrl}/${q.opt_img_d}` : null,
                    });
                } catch (error) {
                    console.error("Error fetching question:", error);
                    toast.error("Failed to load question details.");
                }
            };
            fetchQuestion();
        }
    }, [id, isEditMode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setFormValues(prev => {
            const types = checked
                ? [...prev.type_of_test, value]
                : prev.type_of_test.filter(t => t !== value);
            return { ...prev, type_of_test: types };
        });
    };

    const handleCorrectOptionChange = (e) => {
        const { value, checked } = e.target;
        setFormValues(prev => {
            const opts = checked
                ? [...prev.correct_option, value]
                : prev.correct_option.filter(o => o !== value);
            return { ...prev, correct_option: opts };
        });
    };

    const handleFileChange = (name, e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviews(prev => ({ ...prev, [name]: url }));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formValues.master_course_id) {
            toast.error("Master Course is required.");
            return;
        }
        if (!formValues.question.trim()) {
            toast.error("Question is required.");
            return;
        }
        if (formValues.correct_option.length === 0) {
            toast.error("At least one correct option is required.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('question', formValues.question);
            formData.append('master_course_id', formValues.master_course_id);
            formData.append('option_a', formValues.option_a || '');
            formData.append('option_b', formValues.option_b || '');
            formData.append('option_c', formValues.option_c || '');
            formData.append('option_d', formValues.option_d || '');
            formData.append('correct_option', formValues.correct_option.join(','));

            if (formValues.type_of_test.length > 0) {
                formData.append('type_of_test', formValues.type_of_test.join(','));
            }

            // Append files from refs
            if (imageRef.current?.files[0]) {
                formData.append('image', imageRef.current.files[0]);
            }
            if (optImgARef.current?.files[0]) {
                formData.append('opt_img_a', optImgARef.current.files[0]);
            }
            if (optImgBRef.current?.files[0]) {
                formData.append('opt_img_b', optImgBRef.current.files[0]);
            }
            if (optImgCRef.current?.files[0]) {
                formData.append('opt_img_c', optImgCRef.current.files[0]);
            }
            if (optImgDRef.current?.files[0]) {
                formData.append('opt_img_d', optImgDRef.current.files[0]);
            }

            if (isEditMode) {
                await questionBankService.updateQuestion(id, formData);
                toast.success('Question updated successfully!');
            } else {
                await questionBankService.createQuestion(formData);
                toast.success('Question created successfully!');
            }
            navigate('/assessment/question-bank');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save question.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const fileRefs = {
        image: imageRef,
        opt_img_a: optImgARef,
        opt_img_b: optImgBRef,
        opt_img_c: optImgCRef,
        opt_img_d: optImgDRef,
    };

    // Helper Components
    const InputField = ({ label, name, value, onChange, placeholder }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">
                {label}
            </label>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm"
                placeholder={placeholder}
            />
        </div>
    );

    const SelectField = ({ label, name, value, onChange, placeholder, options, required }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full h-11 px-4 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm"
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    const TextAreaField = ({ label, name, value, onChange, placeholder, required }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-600 text-sm min-h-[100px]"
                placeholder={placeholder}
            />
        </div>
    );

    const FileInputField = ({ label, fileRef, onChange, preview, previewAlt }) => (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">{label}</label>
            <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={onChange}
                className="w-full px-4 py-2 rounded-xl bg-slate-50/50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
            />
            {preview && (
                <div className="mt-2">
                    <img src={preview} alt={previewAlt} className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm" />
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Meta title={isEditMode ? "Edit Question" : "Add Question"} description={isEditMode ? "Edit Question Details" : "Add New Question"} />

            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <BookOpen size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">{isEditMode ? "Edit Question" : "Add New Question"}</h1>
                            <p className="text-sm text-slate-500">Fill in the details to {isEditMode ? "update" : "create"} a question</p>
                        </div>
                    </div>
                    <Link
                        to="/assessment/question-bank"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to List
                    </Link>
                </div>
            </div>

            <div className="max-w-none p-8">
                <form onSubmit={handleSubmit} className="space-y-8 max-w-[1200px] mx-auto">

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectField
                                label="Master Course"
                                name="master_course_id"
                                value={formValues.master_course_id}
                                onChange={handleInputChange}
                                placeholder="Select Master Course"
                                required
                                options={masterCourses.map(c => ({ value: c.id, label: c.master_course_name }))}
                            />

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 block">Type of Test</label>
                                <div className="flex gap-4 mt-2">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            value="1"
                                            checked={formValues.type_of_test.includes('1')}
                                            onChange={handleCheckboxChange}
                                            className="rounded text-blue-600"
                                        />
                                        <span className="text-sm text-gray-700">Pre Course</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            value="2"
                                            checked={formValues.type_of_test.includes('2')}
                                            onChange={handleCheckboxChange}
                                            className="rounded text-blue-600"
                                        />
                                        <span className="text-sm text-gray-700">Post Course</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            value="3"
                                            checked={formValues.type_of_test.includes('3')}
                                            onChange={handleCheckboxChange}
                                            className="rounded text-blue-600"
                                        />
                                        <span className="text-sm text-gray-700">Daily</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <TextAreaField
                            label="Question"
                            name="question"
                            value={formValues.question}
                            onChange={handleInputChange}
                            placeholder="Enter question text here..."
                            required
                        />

                        {/* Question Image */}
                        <FileInputField
                            label="Question Image"
                            fileRef={imageRef}
                            onChange={(e) => handleFileChange('image', e)}
                            preview={previews.image}
                            previewAlt="Question preview"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['a', 'b', 'c', 'd'].map((opt) => (
                            <div key={opt} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="font-semibold text-gray-800 uppercase">Option {opt.toUpperCase()}</h4>
                                <InputField
                                    label="Text"
                                    name={`option_${opt}`}
                                    value={formValues[`option_${opt}`]}
                                    onChange={handleInputChange}
                                    placeholder={`Option ${opt.toUpperCase()} text`}
                                />
                                <FileInputField
                                    label={`Option ${opt.toUpperCase()} Image`}
                                    fileRef={fileRefs[`opt_img_${opt}`]}
                                    onChange={(e) => handleFileChange(`opt_img_${opt}`, e)}
                                    preview={previews[`opt_img_${opt}`]}
                                    previewAlt={`Option ${opt.toUpperCase()} preview`}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 block">
                                Correct Option(s) <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-6 mt-2">
                                {[{ value: 'opt_a', label: 'Option A' }, { value: 'opt_b', label: 'Option B' }, { value: 'opt_c', label: 'Option C' }, { value: 'opt_d', label: 'Option D' }].map(opt => (
                                    <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            value={opt.value}
                                            checked={formValues.correct_option.includes(opt.value)}
                                            onChange={handleCorrectOptionChange}
                                            className="rounded text-blue-600 w-4 h-4"
                                        />
                                        <span className="text-sm text-gray-700">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/assessment/question-bank')}
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
                            <span>{isSubmitting ? 'Saving...' : 'Save Question'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuestionBankForm;
