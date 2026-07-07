import React from "react";

const formatLongDate = (date) => {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const LngCertificateTemplate = ({
  certificate,
  candidateFullName,
  trainerFullName,
  signatureUrl,
  candidatePhotoUrl,
}) => {
  const courseLevel = certificate.course_level || "Operational";
  const officerLabel = certificate.officer
    ? `${certificate.officer} Officer`
    : "Officer";
  const trainingContent =
    courseLevel === "Management"
      ? "This training is the LNG carrier standard training course that is intended to apply to seafarers classifying as the Management rank including the Master, which is certified by DNV-GL as compliant with the LNG Shipping suggested competency standards issued by SIGTTO and includes the Cargo simulator training."
      : "This training is the LNG carrier standard training course that is intended to apply to seafarers classifying as the Operational rank, which is certified by DNV as compliant with the LNG Shipping suggested competency standards issued by SIGTTO and includes the Cargo simulator training.";

  return (
    <div
      style={{
        backgroundColor: "#fff",
        color: "#000",
        margin: "40px auto 0",
        width: "210mm",
        minHeight: "297mm",
        boxSizing: "border-box",
        padding: "18mm 12mm 16mm",
        fontFamily: '"Times New Roman", serif',
      }}
    >
      <div style={{ position: "relative", minHeight: "240mm" }}>
        <img
          src="/mol-logo.png"
          alt="MOL"
          style={{
            display: "block",
            margin: "0 auto",
            height: "40px",
            width: "auto",
          }}
        />

        <p
          style={{
            fontSize: "12pt",
            fontStyle: "italic",
            fontWeight: 600,
            margin: "12px 0 6px 132mm",
          }}
        >
          No. : {certificate.certificate_no || "-"}
        </p>

        <h3
          style={{
            textAlign: "center",
            fontSize: "20pt",
            fontStyle: "italic",
            fontWeight: 600,
            margin: "6px 0 10px",
          }}
        >
          CERTIFICATE OF TRAINING
        </h3>

        <p
          style={{
            textAlign: "center",
            fontSize: "14pt",
            fontStyle: "italic",
            fontWeight: 600,
            margin: "0 0 10px",
          }}
        >
          This is to certify that
        </p>

        <p
          style={{
            textAlign: "center",
            fontSize: "14pt",
            fontStyle: "italic",
            fontWeight: 600,
            margin: "0 0 10px",
          }}
        >
          Name: {candidateFullName || "-"}
        </p>

        <p
          style={{
            textAlign: "center",
            fontSize: "14pt",
            fontStyle: "italic",
            fontWeight: 600,
            margin: "0 0 26px",
          }}
        >
          Date of Birth : {formatLongDate(certificate.dob)}
        </p>

        <p
          style={{
            textAlign: "center",
            fontSize: "14pt",
            fontStyle: "italic",
            fontWeight: 600,
            margin: "0 0 10px",
          }}
        >
          has satisfactorily completed the
        </p>

        <div
          style={{
            border: "1px dotted rgba(0, 0, 0, 0.35)",
            position: "absolute",
            top: "96px",
            right: "8px",
            width: "100px",
            height: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          {candidatePhotoUrl ? (
            <img
              src={candidatePhotoUrl}
              alt={candidateFullName || "Candidate"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : null}
        </div>

        <h3
          style={{
            margin: "18px 0 10px",
            textAlign: "center",
            color: "#000",
            fontSize: "20pt",
            fontStyle: "italic",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          {certificate.master_course_name || "-"}
        </h3>

        <h4
          style={{
            fontSize: "18pt",
            textAlign: "center",
            color: "#000",
            fontStyle: "italic",
            fontWeight: 600,
            margin: "0 0 10px",
          }}
        >
          ({officerLabel} - {courseLevel} Level)
        </h4>

        <p
          style={{
            textAlign: "center",
            fontSize: "14pt",
            fontStyle: "italic",
            fontWeight: 600,
            margin: "0 0 10px",
          }}
        >
          Date of Commencement: {formatLongDate(certificate.from_date)}
        </p>

        <p
          style={{
            textAlign: "center",
            fontSize: "14pt",
            fontStyle: "italic",
            fontWeight: 600,
            margin: "0 0 10px",
          }}
        >
          Date of Completion: {formatLongDate(certificate.to_date)}
        </p>

        <p
          style={{
            textAlign: "center",
            fontSize: "14pt",
            fontStyle: "italic",
            fontWeight: 600,
            margin: "0 0 16px",
          }}
        >
          Training Location : MOL Training Center (India)
        </p>

        <div style={{ padding: "0 36px", marginBottom: "14px" }}>
          <h5
            style={{
              fontSize: "14pt",
              fontStyle: "italic",
              fontWeight: 600,
              margin: "0 0 8px",
            }}
          >
            Content of Training:
          </h5>

          <h5
            style={{
              color: "#000",
              fontWeight: 600,
              fontSize: "13pt",
              fontStyle: "italic",
              lineHeight: 1.35,
              margin: "0 0 14px 20px",
            }}
          >
            {trainingContent}
          </h5>

          <h5
            style={{
              color: "#000",
              fontWeight: 600,
              fontSize: "13pt",
              fontStyle: "italic",
              lineHeight: 1.35,
              margin: "0 0 14px 20px",
            }}
          >
            This certificate is valid for all LNG vessels related to Mitsui
            O.S.K Lines. Organized by MOL Marine and Engineering Co., Ltd.
          </h5>

          <h3
            style={{
              textAlign: "center",
              color: "#000",
              fontSize: "20pt",
              fontStyle: "italic",
              fontWeight: 400,
              margin: "0 0 10px",
            }}
          >
            MOL Training Center (India)
          </h3>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: "14pt",
            fontStyle: "italic",
            fontWeight: 600,
            margin: "0 0 18px",
          }}
        >
          Trainer : {trainerFullName || "-"}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "16px",
            padding: "0 28px",
            marginTop: "10px",
          }}
        >
          <img
            src="/images/img0.jpg"
            alt="DNV"
            style={{
              width: "110px",
              height: "auto",
              objectFit: "contain",
            }}
          />

          <div
            style={{
              width: "220px",
              minHeight: "80px",
              borderBottom: "2px solid #000",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            {signatureUrl ? (
              <img
                src={signatureUrl}
                alt="Trainer Signature"
                style={{
                  width: "200px",
                  maxHeight: "70px",
                  objectFit: "contain",
                  marginBottom: "6px",
                }}
              />
            ) : null}
          </div>

          <img
            src="/images/GlobalMET-Logo.jpg"
            alt="GlobalMET"
            style={{
              width: "160px",
              height: "55px",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LngCertificateTemplate;
