import React, { useState } from 'react';
import Meta from "../../components/common/Meta";
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import SystemManualForm from './SystemManualForm';
import { systemManualService } from '../../services/systemManualService';
import BackButton from '../../components/common/BackButton';

const CreateSystemManual = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

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

            await systemManualService.createSystemManual(formData);
            toast.success('System manual created successfully!');
            navigate('/system-manual');
        } catch (error) {
            console.error('Error creating system manual:', error);
            toast.error(error.response?.data?.message || 'Failed to create system manual.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full pb-20">
            <Meta title="Add System Manual" description="Add New System Manual" />
            <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight page-title text-slate-900">Add New System Manual</h1>
                            <p className="text-slate-500 mt-1">Upload a new document or add a URL link</p>
                        </div>
                    </div>
                    <BackButton to="/system-manual" />
                </div>

                {/* Form Container */}
                <SystemManualForm
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    onCancel={() => navigate('/system-manual')}
                />
            </div>
        </div>
    );
};

export default CreateSystemManual;
