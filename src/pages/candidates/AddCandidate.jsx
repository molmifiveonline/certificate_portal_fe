import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';
import CandidateForm from '../../components/candidates/CandidateForm';
import { Card, CardContent } from "../../components/ui/card";

const AddCandidate = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            // Map frontend fields (camelCase) to backend fields (snake_case)
            // Note: Reuse logic from Register.jsx or utility if complex mapping grows
            const payload = {
                first_name: data.firstName,
                last_name: data.lastName,
                middle_name: data.middleName,
                email: data.email,
                password: data.password,
                mobile: data.whatsapp,
                prefix: data.prefix,
                gender: data.gender,
                dob: data.dob,
                nationality: data.nationality,
                passport_no: data.passportNumber,
                employee_id: data.employeeId,
                manager: data.manager,
                other_manager: null,
                rank: data.rank,
                other_rank: null,
                whatsapp_number: data.whatsapp,
                alternate_mobile: data.alternateNumber,
                indos_number: data.indosNo,
                registration_type: data.employeeType
            };

            await api.post('/auth/register/candidate', payload);

            toast.success("Candidate Added Successfully!");
            navigate('/candidates');
        } catch (error) {
            console.error("Add Candidate Error:", error);
            toast.error(error.response?.data?.message || "Failed to add candidate. Please try again.");
            window.scrollTo(0, 0);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/candidates')}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Add New Candidate</h1>
                    <p className="text-slate-500 mt-1">Register a new candidate manually</p>
                </div>
            </div>

            <Card className="rounded-3xl border-slate-200/60 bg-white shadow-xl overflow-hidden">
                <CardContent className="p-8">
                    <CandidateForm
                        onSubmit={onSubmit}
                        isSubmitting={isSubmitting}
                        submitLabel="Create Candidate"
                        showPassword={true}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default AddCandidate;
