import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Printer } from "lucide-react";
import certificateService from "../../services/certificateService";
import LngCertificateTemplate from "./LngCertificateTemplate";
import DnvSt0029CertificateTemplate from "./DnvSt0029CertificateTemplate";
import DnvSt008CertificateTemplate from "./DnvSt008CertificateTemplate";
import OtherCertificateTemplate from "./OtherCertificateTemplate";

const getApiBaseUrl = () => {
  const rawUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
  const normalizedUrl = rawUrl.replace(/\/+$/, "");
  return /\/api$/i.test(normalizedUrl) ? normalizedUrl : `${normalizedUrl}/api`;
};

const buildUploadUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = String(path).replace(/^\/+/, "");
  return `${getApiBaseUrl()}/${normalizedPath.replace(/^api\/+/i, "")}`;
};

const CSS_PX_PER_INCH = 96;
const A4_PORTRAIT_PX = {
  width: 8.27 * CSS_PX_PER_INCH,
  height: 11.69 * CSS_PX_PER_INCH,
};
const PRINT_SCALE_SAFETY_OFFSET = 0.004;
const PRINT_BOTTOM_GUARD_PX = 14;
const MIN_PRINT_SCALE = 0.35;

const CertificatePrintView = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRootRef = useRef(null);
  const printContentRef = useRef(null);

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

  const isLngCertificate = certificate?.type === "SIGTTO / LNG";
  const printMarginTopInches = isLngCertificate
    ? 0.2
    : certificate?.show_logo === 1
      ? 0.05
      : 0.2;

  const fitCertificateToPage = useCallback(() => {
    const root = printRootRef.current;
    const content = printContentRef.current;
    if (!root || !content) return;

    root.style.removeProperty("--certificate-print-page-height");

    const surface =
      content.querySelector("[data-certificate-print-surface]") ||
      content.firstElementChild;
    const surfaceRect = surface?.getBoundingClientRect();
    const surfaceStyles = surface ? window.getComputedStyle(surface) : null;
    const surfaceMarginTop = surfaceStyles
      ? parseFloat(surfaceStyles.marginTop) || 0
      : 0;
    const surfaceMarginBottom = surfaceStyles
      ? parseFloat(surfaceStyles.marginBottom) || 0
      : 0;
    const fallbackRect = content.getBoundingClientRect();

    const contentWidth = surface
      ? Math.max(surface.scrollWidth, surfaceRect?.width || 0)
      : Math.max(content.scrollWidth, fallbackRect.width);
    const naturalHeight = surface
      ? Math.max(surface.scrollHeight, surfaceRect?.height || 0) +
        surfaceMarginTop +
        surfaceMarginBottom
      : Math.max(content.scrollHeight, fallbackRect.height);

    if (!contentWidth || !naturalHeight) return;

    const availableWidth =
      A4_PORTRAIT_PX.width - (0.4 + 0.5) * CSS_PX_PER_INCH;
    const availableHeight =
      A4_PORTRAIT_PX.height -
      printMarginTopInches * CSS_PX_PER_INCH -
      PRINT_BOTTOM_GUARD_PX;
    const widthScale = availableWidth / contentWidth;
    const naturalHeightScale = availableHeight / naturalHeight;
    const nextScale = Math.max(
      MIN_PRINT_SCALE,
      Math.min(1, widthScale, naturalHeightScale) - PRINT_SCALE_SAFETY_OFFSET,
    );
    const pageHeight = Math.max(naturalHeight, availableHeight / nextScale);

    root.style.setProperty("--certificate-print-scale", nextScale.toFixed(3));
    root.style.setProperty(
      "--certificate-print-page-height",
      `${Math.floor(pageHeight)}px`,
    );
  }, [printMarginTopInches]);

  useEffect(() => {
    if (!certificate) return undefined;

    const animationFrame = window.requestAnimationFrame(fitCertificateToPage);
    const content = printContentRef.current;
    const images = content ? Array.from(content.querySelectorAll("img")) : [];

    images.forEach((image) => {
      if (!image.complete) {
        image.addEventListener("load", fitCertificateToPage, { once: true });
        image.addEventListener("error", fitCertificateToPage, { once: true });
      }
    });
    window.addEventListener("beforeprint", fitCertificateToPage);
    window.addEventListener("resize", fitCertificateToPage);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      images.forEach((image) => {
        image.removeEventListener("load", fitCertificateToPage);
        image.removeEventListener("error", fitCertificateToPage);
      });
      window.removeEventListener("beforeprint", fitCertificateToPage);
      window.removeEventListener("resize", fitCertificateToPage);
    };
  }, [certificate, fitCertificateToPage]);

  const handlePrint = () => {
    fitCertificateToPage();
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
  const verifyLink = `${window.location.origin}/authenticity-verification/${certificate.id || id}`;
  const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(verifyLink)}&size=150`;

  const signatureUrl = certificate.digital_signature
    ? buildUploadUrl(`uploads/trainer/${certificate.digital_signature}`)
    : null;
  const candidatePhotoUrl = certificate.profile_image
    ? certificate.profile_image.startsWith("/uploads/")
      ? buildUploadUrl(certificate.profile_image)
      : buildUploadUrl(`uploads/candidate-profiles/${certificate.profile_image}`)
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
            --certificate-print-scale: ${isLngCertificate ? "0.89" : "0.7"};
          }

          @media print {
            html, body {
              width: 100%;
              height: auto;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              overflow: visible !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            #root {
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
            }
            @page {
              margin-left: 0.4in;
              margin-right: 0.5in;
              margin-top: ${printMarginTopInches}in;
              margin-bottom: 0;
              size: A4 portrait;
            }
            .cert-container {
              height: auto !important;
              min-height: 0 !important;
              padding: 0 !important;
              margin: 0 !important;
              overflow: visible !important;
              page-break-after: avoid !important;
              page-break-before: avoid !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .certificate-print-content {
              width: max-content !important;
              max-width: none !important;
              margin: 0 auto !important;
              padding: 0 !important;
              page-break-after: avoid !important;
              page-break-before: avoid !important;
              page-break-inside: avoid !important;
              break-after: avoid !important;
              break-before: avoid !important;
              break-inside: avoid !important;
            }
            #printBtn {
              display: none !important;
            }
          }
        `}
      </style>

      <div
        ref={printRootRef}
        className="cert-container pb-8 print:pb-0"
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

        <div ref={printContentRef} className="certificate-print-content">
          {template}
        </div>
      </div>
    </>
  );
};

export default CertificatePrintView;
