import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { Loader2, Plus, Trash2, Send } from 'lucide-react';
import preActiveCourseService from '../../services/preActiveCourseService';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { isNumericOnly, isValidEmail, sanitizeNumericValue } from '../../lib/utils/validation';

const NominatorPortal = () => {
    const { token } = useParams();
    const [loading, setLoading] = useState(true);
    const [courseContext, setCourseContext] = useState(null);
    const [candidates, setCandidates] = useState([{ first_name: '', last_name: '', email: '', mobile_no: '' }]);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContext = async () => {
            try {
                setLoading(true);
                const data = await preActiveCourseService.getCourseByToken(token);
                setCourseContext(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Invalid or expired token.');
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchContext();
    }, [token]);

    const handleAddCandidate = () => {
        setCandidates([...candidates, { first_name: '', last_name: '', email: '', mobile_no: '' }]);
    };

    const handleRemoveCandidate = (index) => {
        const newCandidates = [...candidates];
        newCandidates.splice(index, 1);
        setCandidates(newCandidates);
    };

    const handleChange = (index, field, value) => {
        const newCandidates = [...candidates];
        newCandidates[index][field] = field === 'mobile_no' ? sanitizeNumericValue(value) : value;
        setCandidates(newCandidates);
    };

    const validate = () => {
        for (let c of candidates) {
            if (!c.first_name || !c.email) {
                toast.error("First Name and Email are required for all candidates.");
                return false;
            }
            if (!isValidEmail(c.email)) {
                toast.error(`Invalid email format: ${c.email}`);
                return false;
            }
            if (!isNumericOnly(c.mobile_no)) {
                toast.error(`Mobile number must contain digits only${c.first_name ? ` for ${c.first_name}` : ''}.`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (candidates.length === 0) {
            toast.error('Please add at least one candidate.');
            return;
        }
        if (!validate()) return;

        try {
            setSubmitting(true);
            await preActiveCourseService.nominatorAddCandidate(token, { candidates });
            setSuccess(true);
            toast.success('Candidates nominated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to nominate candidates.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center border border-green-100">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Nominations Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you, {courseContext?.entity?.first_name || 'Nominator'}. Your candidates have been nominated for <strong>{courseContext?.course?.course_name}</strong>.
                    </p>
                    <p className="text-sm text-gray-500">
                        You may now close this window.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <Toaster position="top-right" richColors />
            <div className="mx-auto max-w-3xl">

                {/* Header Card */}
                <div className="bg-white shadow rounded-lg overflow-hidden mb-8 border border-slate-200">
                    <div className="bg-[#3a5f9e] px-6 py-4">
                        <h1 className="text-xl font-bold text-white">Course Nomination Portal</h1>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-lg">
                                {courseContext?.entity?.first_name?.charAt(0) || 'N'}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Welcome,</p>
                                <p className="font-semibold text-gray-900 text-lg">
                                    {courseContext?.entity?.first_name} {courseContext?.entity?.last_name || ''}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Course Details</h3>
                            <div className="bg-slate-50 rounded-md p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Course Name</p>
                                    <p className="font-medium text-gray-900">{courseContext?.course?.course_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(courseContext?.course?.start_date).toLocaleDateString()} - {new Date(courseContext?.course?.end_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Location / Venue</p>
                                    <p className="font-medium text-gray-900">
                                        {courseContext?.course?.type_of_location === 'Online' ? 'Online' : (courseContext?.course?.other_location || courseContext?.course?.location_name || 'TBA')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nomination Form */}
                <div className="bg-white shadow rounded-lg p-6 md:p-8 border border-slate-200">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900">Nominate Candidates</h2>
                        <span className="bg-blue-100 text-[#3a5f9e] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            {candidates.length} Candidate{candidates.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {candidates.map((candidate, index) => (
                                <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-5 relative group">
                                    <div className="absolute top-4 right-4 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        {candidates.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCandidate(index)}
                                                className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-slate-200 transition-colors"
                                                title="Remove candidate"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mb-4 font-medium text-gray-700">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3a5f9e] text-white text-xs">
                                            {index + 1}
                                        </span>
                                        Candidate Details
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="First Name"
                                            placeholder="John"
                                            value={candidate.first_name}
                                            onChange={(e) => handleChange(index, 'first_name', e.target.value)}
                                            required
                                            className="bg-white"
                                        />
                                        <Input
                                            label="Last Name"
                                            placeholder="Doe"
                                            value={candidate.last_name}
                                            onChange={(e) => handleChange(index, 'last_name', e.target.value)}
                                            className="bg-white"
                                        />
                                        <Input
                                            label="Email Address"
                                            type="email"
                                            placeholder="john@example.com"
                                            value={candidate.email}
                                            onChange={(e) => handleChange(index, 'email', e.target.value)}
                                            required
                                            className="bg-white"
                                        />
                                        <Input
                                            label="Mobile Number"
                                            placeholder="+1 234 567 8900"
                                            value={candidate.mobile_no}
                                            onChange={(e) => handleChange(index, 'mobile_no', e.target.value)}
                                            className="bg-white"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleAddCandidate}
                                className="w-full sm:w-auto"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Another Candidate
                            </Button>

                            <Button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full sm:w-auto bg-[#3a5f9e] hover:bg-blue-800 text-white min-w-[200px]"
                            >
                                {submitting ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                                ) : (
                                    <><Send className="mr-2 h-4 w-4" /> Submit Nominations</>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} MOLMI. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default NominatorPortal;
