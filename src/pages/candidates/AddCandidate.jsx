import React, { useState } from 'react';
import Meta from "../../components/common/Meta";
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
                registration_type: data.employeeType,
                designation: data.designation,
                vessel_type: data.vesselType,
                last_vessel_name: data.lastVesselName,
                next_vessel_name: data.nextVesselName,
                manning_company: data.manningCompany,
                sign_on_date: data.signOnDate,
                sign_off_date: data.signOffDate,
                officer: data.officer,
                seaman_book_no: data.seamanBookNo,
                profile_image: data.profileImage
            };

            await api.post('/auth/register/candidate', payload);

            toast.success("Candidate Added Successfully!");
            navigate(-1);
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
            <Meta title="Add Candidate" description="Add New Candidate" />
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Add New Candidate</h1>
                    <p className="text-slate-500 mt-1">Register a new candidate manually</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all text-sm font-medium"
                >
                    <ChevronLeft size={18} />
                    Back to List
                </button>
            </div>

            <Card className="rounded-3xl border-slate-200/60 bg-white shadow-xl overflow-hidden">
                <CardContent className="p-8">
                    <CandidateForm
                        onSubmit={onSubmit}
                        isSubmitting={isSubmitting}
                        submitLabel="Create Candidate"
                        showPassword={true}
                        isAdmin={true}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default AddCandidate;
