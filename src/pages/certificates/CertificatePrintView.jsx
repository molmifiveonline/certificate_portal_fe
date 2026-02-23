import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import certificateService from "../../services/certificateService";
import { formatDate } from "../../lib/utils/dateUtils";
import { Loader2, Printer } from "lucide-react";

// Mocking some legacy styles or using modern ones for better look
const CertificatePrintView = () => {
    const { id } = useParams();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const data = await certificateService.getCertificateById(id);
                setCertificate(data);
            } catch (err) {
                console.error("Error fetching certificate for print:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificate();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!certificate) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-xl font-semibold text-slate-800">Certificate not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex flex-col items-center select-none">
            {/* Print Button - Hidden during print */}
            <div className="print:hidden mb-8 w-full max-w-[1000px] flex justify-end">
                <button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all active:scale-95"
                >
                    <Printer className="w-5 h-5" />
                    Print Certificate
                </button>
            </div>

            {/* Certificate Layout */}
            <div className="w-full max-w-[1000px] bg-white shadow-2xl relative border-[12px] border-slate-800 p-12 sm:p-20 overflow-hidden min-h-[1400px] flex flex-col items-center">

                {/* Decorative Borders */}
                <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-slate-200 pointer-events-none"></div>

                {/* Header with Logo */}
                {certificate.show_logo === 1 && (
                    <div className="w-full flex justify-between items-start mb-16">
                        <img src="/mol-logo.png" alt="MOL Logo" className="h-24 w-auto" />

                        {/* QR Code Placeholder (In real scenario, would be generated from URL) */}
                        <div className="bg-slate-100 p-2 border border-slate-200">
                            <div className="w-32 h-32 flex items-center justify-center text-[10px] text-center text-slate-400">
                                QR CODE<br />{certificate.id}
                            </div>
                        </div>
                    </div>
                )}

                {/* Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 uppercase tracking-[0.2em] mb-4">
                        {certificate.master_course_name}
                    </h1>
                    <div className="w-64 h-1 bg-slate-400 mx-auto"></div>
                </div>

                {/* Recipient */}
                <div className="text-center mb-16 w-full">
                    <p className="text-xl text-slate-500 uppercase tracking-widest mb-8 italic">This is to certify that</p>
                    <h2 className="text-5xl sm:text-6xl font-bold text-slate-800 border-b-2 border-slate-200 pb-4 inline-block px-12 uppercase min-w-[50%]">
                        {certificate.candidate_name}
                    </h2>
                    <p className="text-lg text-slate-400 mt-4 uppercase tracking-widest font-semibold">Name and Last Name</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-12 w-full mb-16">
                    <div className="text-center border-b border-slate-200 pb-4">
                        <p className="text-2xl font-bold text-slate-800 uppercase">
                            {/* Assuming DOB is available or placeholders for now */}
                            -
                        </p>
                        <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Date of Birth</p>
                    </div>
                    <div className="text-center border-b border-slate-200 pb-4">
                        <p className="text-2xl font-bold text-slate-800 uppercase">
                            {certificate.nationality || "UN"}
                        </p>
                        <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Nationality</p>
                    </div>
                </div>

                {/* Dates */}
                <div className="text-center mb-16">
                    <p className="text-xl text-slate-700 font-medium mb-4">
                        Conducted from <span className="font-bold border-b border-slate-300 px-2">{formatDate(certificate.from_date)}</span> to <span className="font-bold border-b border-slate-300 px-2">{formatDate(certificate.to_date)}</span>
                    </p>
                    <p className="text-lg text-slate-800 font-bold uppercase tracking-widest">
                        Has successfully completed the following course.
                    </p>
                </div>

                {/* Description */}
                <div className="text-left w-full flex-grow mb-20 px-4">
                    <h3 className="text-xl font-bold text-slate-800 uppercase mb-6 border-l-4 border-slate-800 pl-4">
                        The training program consisted of detailed instructions on the following:
                    </h3>
                    <div
                        className="text-lg text-slate-700 leading-relaxed uppercase whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: certificate.description1 }}
                    />
                </div>

                {/* Footer Section */}
                <div className="w-full mt-auto flex justify-between items-end border-t-2 border-slate-200 pt-12">
                    <div className="space-y-3">
                        <p className="text-sm text-slate-500 uppercase font-bold">
                            Certificate No: <span className="text-slate-800">{certificate.certificate_no}</span>
                        </p>
                        <p className="text-sm text-slate-500 uppercase font-bold">
                            Course Conducted: <span className="text-slate-800">{certificate.course_conduct} / {certificate.location}</span>
                        </p>
                        <p className="text-sm text-slate-500 uppercase font-bold">
                            Issued On: <span className="text-slate-800">{formatDate(certificate.issue_date)}</span>
                        </p>
                    </div>

                    <div className="text-center space-y-4">
                        <div className="w-64 h-px bg-slate-400 mx-auto"></div>
                        <div>
                            <p className="text-xl font-bold text-slate-800 uppercase">
                                {certificate.trainer_first_name} {certificate.trainer_last_name}
                            </p>
                            <p className="text-sm text-slate-400 uppercase font-bold">(Course Faculty)</p>
                        </div>
                    </div>
                </div>

                {/* Stamp/DNV Image Placeholder */}
                {certificate.type === 'DNV-ST0029' && (
                    <div className="absolute bottom-12 right-72 opacity-50">
                        <div className="border-4 border-slate-100 p-2 text-slate-100 font-black text-4xl rotate-[-25deg]">
                            DNV APPROVED
                        </div>
                    </div>
                )}
            </div>

            {/* Print specific CSS */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body { background: white !important; margin: 0 !important; }
                    .print\\:hidden { display: none !important; }
                    .min-h-screen { min-height: 0 !important; background: white !important; }
                    .shadow-2xl { shadow: none !important; }
                    .border-slate-800 { border-color: black !important; }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                }
            ` }} />
        </div>
    );
};

export default CertificatePrintView;
