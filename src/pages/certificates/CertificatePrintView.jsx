import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Printer } from "lucide-react";
import certificateService from "../../services/certificateService";
import LngCertificateTemplate from "./LngCertificateTemplate";
import DnvSt0029CertificateTemplate from "./DnvSt0029CertificateTemplate";
import DnvSt008CertificateTemplate from "./DnvSt008CertificateTemplate";
import OtherCertificateTemplate from "./OtherCertificateTemplate";

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
        <p className="text-xl font-semibold text-slate-800">
          Certificate not found.
        </p>
      </div>
    );
  }

  const canPrefix = certificate.caprefix ? `${certificate.caprefix}. ` : "";
  const candidateFullName = `${canPrefix}${certificate.candidate_name || ""}`;
  const trPrefix = certificate.tprefix ? `${certificate.tprefix}. ` : "";
  const trainerFullName = `${trPrefix}${certificate.trainer_name || ""}`;
  const isLngCertificate = certificate.type === "SIGTTO / LNG";

  const verifyLink = `${window.location.origin}/authenticity-verification/${certificate.id || id}`;
  const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(verifyLink)}&size=150`;

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const signatureUrl = certificate.digital_signature
    ? `${apiUrl.replace("/api", "")}/uploads/trainer/${certificate.digital_signature}`
    : null;
  const candidatePhotoUrl = certificate.profile_image
    ? certificate.profile_image.startsWith("/uploads/")
      ? `${apiUrl.replace("/api", "")}${certificate.profile_image}`
      : `${apiUrl.replace("/api", "")}/uploads/candidate-profiles/${certificate.profile_image}`
    : null;

  const courseTemplateProps = {
    certificate,
    candidateFullName,
    trainerFullName,
    qrCodeUrl,
    signatureUrl,
  };

  let template = <OtherCertificateTemplate {...courseTemplateProps} />;

  if (isLngCertificate) {
    template = (
      <LngCertificateTemplate
        certificate={certificate}
        candidateFullName={candidateFullName}
        trainerFullName={trainerFullName}
        signatureUrl={signatureUrl}
        candidatePhotoUrl={candidatePhotoUrl}
      />
    );
  } else if (certificate.type === "DNV-ST0029") {
    template = <DnvSt0029CertificateTemplate {...courseTemplateProps} />;
  } else if (certificate.type === "DNV-ST008") {
    template = <DnvSt008CertificateTemplate {...courseTemplateProps} />;
  }

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Jost:wght@400;600;700&display=swap');

          body {
            margin: 0;
            padding: 0;
            background: #f0f0f0;
          }

          .cert-container {
            font-family: 'Jost', sans-serif;
          }

          @media print {
            body { background: white !important; }
            @page {
              margin-left: 0.4in;
              margin-right: 0.5in;
              margin-top: ${
                isLngCertificate
                  ? "0.2in"
                  : certificate.show_logo === 1
                    ? "0.05in"
                    : "0.2in"
              };
              margin-bottom: 0;
              size: A4 portrait;
            }
            #printBtn {
              display: none !important;
            }
          }
        `}
      </style>

      <div
        className="cert-container pb-8"
        style={{ height: "auto", paddingTop: "0px" }}
      >
        <button
          id="printBtn"
          onClick={handlePrint}
          style={{
            cursor: "pointer",
            position: "absolute",
            right: "4%",
            top: "20px",
            backgroundColor: "#0060aa",
            color: "#ffffff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "bold",
            }}
          >
            <Printer size={18} /> Print
          </div>
        </button>

        {template}
      </div>
    </>
  );
};

export default CertificatePrintView;
