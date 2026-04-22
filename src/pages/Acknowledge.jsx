import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import outhouseCourseService from '../services/outhouseCourseService';

const Acknowledge = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const action = searchParams.get('action');
    const courseType = (searchParams.get('course_type') || searchParams.get('courseType') || 'active').toLowerCase();
    const navigate = useNavigate();

    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const [remark, setRemark] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitAcknowledgment = useCallback(async (submitAction, submitRemark = '') => {
        setIsSubmitting(true);
        try {
            const payload = {
                token,
                action: submitAction,
                remark: submitRemark
            };
            const response = courseType === 'outhouse'
                ? await outhouseCourseService.acknowledgeEnrollment(payload)
                : (await api.post('/active-courses/acknowledge-enrollment', payload)).data;
            setStatus('success');
            setMessage(
                response?.message ||
                (submitAction === 'approve'
                    ? 'I approve and I will be attending.'
                    : 'Acknowledgment submitted successfully.')
            );
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Failed to submit acknowledgment.');
        } finally {
            setIsSubmitting(false);
        }
    }, [courseType, token]);

    useEffect(() => {
        if (!token || !action) {
            setStatus('error');
            setMessage('Invalid or missing acknowledgment link parameters.');
            return;
        }

        if (action === 'approve') {
            submitAcknowledgment('approve');
        } else if (action === 'reject') {
            setStatus('prompt_remark');
        } else {
            setStatus('error');
            setMessage('Invalid action specified.');
        }
    }, [token, action, submitAcknowledgment]);

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        submitAcknowledgment('reject', remark);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-slate-100">

                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h2 className="text-xl font-bold text-slate-800">Processing Acknowledgment...</h2>
                        <p className="text-slate-500 mt-2">Please wait while we confirm your response.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
                        {action === 'approve' && (
                            <p className="text-slate-700 font-medium mb-2">I approve and I will be attending.</p>
                        )}
                        <p className="text-slate-600">{message}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
                        <p className="text-slate-600">{message}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors font-medium"
                        >
                            Go to Homepage
                        </button>
                    </div>
                )}

                {status === 'prompt_remark' && (
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Reject Course Enrollment</h2>
                        <p className="text-slate-600 mb-6">You are about to reject your attendance for this course. Please optionally provide a reason.</p>

                        <form onSubmit={handleRejectSubmit}>
                            <textarea
                                className="w-full p-4 border border-slate-200 rounded-lg resize-none h-32 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Why are you rejecting this course? (Optional)"
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                            ></textarea>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                            >
                                {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                Confirm Rejection
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Acknowledge;
