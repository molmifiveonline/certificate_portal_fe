import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Meta from "../../components/common/Meta";
import certificateService from "../../services/certificateService";
import { Loader2 } from "lucide-react";
import { formatDate } from "../../lib/utils/dateUtils";

const CertificateVerification = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        const data = await certificateService.getCertificateVerification(id);
        setCertificate(data);
      } catch (err) {
        console.error("Error fetching certificate verification:", err);
        setError(err.response?.data?.message || "Certificate not found");
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();
  }, [id]);

  const statusLabel = Number(certificate?.status) === 0 ? "VALID" : "INVALID";
  const statusClass =
    Number(certificate?.status) === 0
      ? "bg-blue-500 text-white"
      : "bg-red-500 text-white";

  return (
    <div className="min-h-screen bg-[#efefef] py-10 px-4">
      <Meta
        title="Certificate Verification"
        description="Verify certificate authenticity"
      />

      <div className="mx-auto max-w-7xl bg-white border border-slate-200">
        <div className="px-6 pt-6 pb-3 text-center">
          <img
            src="/images/verification-logo.jpg"
            alt="MOL Maritime"
            className="mx-auto w-full max-w-4xl object-contain"
          />
          <h1 className="mt-3 text-[32px] font-medium text-slate-800">
            Authenticity Verification
          </h1>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="px-6 pb-10 text-center">
            <p className="text-lg font-medium text-red-600">{error}</p>
          </div>
        ) : (
          <div className="px-6 pb-8">
            <div className="overflow-hidden border border-slate-200">
              <table className="w-full border-collapse text-left">
                <tbody>
                  {[
                    ["Candidate Name", certificate?.candidate_name || "-"],
                    ["Date Of Birth", formatDate(certificate?.dob)],
                    ["Course Name", certificate?.master_course_name || "-"],
                    [
                      "Course Duration",
                      `${formatDate(certificate?.from_date)} - ${formatDate(
                        certificate?.to_date,
                      )}`,
                    ],
                    ["Certificate Number", certificate?.certificate_no || "-"],
                    ["Location", certificate?.location || "-"],
                    ["Date Issued", formatDate(certificate?.issue_date)],
                    [
                      "Status",
                      <span
                        key="status"
                        className={`inline-flex min-w-[96px] items-center justify-center px-4 py-1 text-sm font-semibold ${statusClass}`}
                      >
                        {statusLabel}
                      </span>,
                    ],
                    ["Signers", certificate?.trainer_name || "-"],
                  ].map(([label, value]) => (
                    <tr
                      key={label}
                      className="border-b border-slate-200 last:border-b-0"
                    >
                      <th className="w-1/3 bg-white px-4 py-4 text-[18px] font-semibold text-slate-800 border-r border-slate-200">
                        {label}
                      </th>
                      <td className="px-4 py-4 text-[18px] text-slate-700">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateVerification;
