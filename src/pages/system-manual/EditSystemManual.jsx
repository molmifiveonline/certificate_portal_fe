import React, { useState, useEffect } from 'react';
import Meta from "../../components/common/Meta";
import { useNavigate, useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import SystemManualForm from './SystemManualForm';
import { systemManualService } from '../../services/systemManualService';
import BackButton from '../../components/common/BackButton';

const EditSystemManual = () => {
    const { id } = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [initialData, setInitialData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchManual = async () => {
            try {
                const response = await systemManualService.getSystemManualById(id);
                if (response.success) {
                    setInitialData(response.data);
                } else {
                    toast.error('Failed to load system manual.');
                    navigate('/system-manual');
                }
            } catch (error) {
                console.error('Error fetching system manual:', error);
                toast.error('Failed to load system manual.');
                navigate('/system-manual');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchManual();
        }
    }, [id, navigate]);

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('document_type', data.document_type);

            if (data.document_type === 'file' && data.document_file) {
                formData.append('document_file', data.document_file);
            } else if (data.document_type === 'url' && data.url_link) {
                formData.append('url_link', data.url_link);
            }

            await systemManualService.updateSystemManual(id, formData);
            toast.success('System manual updated successfully!');
            navigate('/system-manual');
        } catch (error) {
            console.error('Error updating system manual:', error);
            toast.error(error.response?.data?.message || 'Failed to update system manual.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full h-full pb-20">
            <Meta title="Edit System Manual" description="Edit System Manual" />
            <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight page-title text-slate-900">Edit System Manual</h1>
                            <p className="text-slate-500 mt-1">Update existing document details or replace file</p>
                        </div>
                    </div>
                    <BackButton to="/system-manual" />
                </div>

                {/* Form Container */}
                <SystemManualForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={() => navigate('/system-manual')}
                />
            </div>
        </div>
    );
};

export default EditSystemManual;
