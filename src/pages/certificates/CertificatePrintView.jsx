import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import certificateService from "../../services/certificateService";
import { Loader2, Printer } from "lucide-react";

export const formatCustomDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-GB", { month: "long" });
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

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

  // Prepare Name format logic (Prefix + Name)
  const canPrefix = certificate.caprefix ? `${certificate.caprefix}. ` : "";
  const candidateFullName = `${canPrefix}${certificate.candidate_name || ""}`;

  const trPrefix = certificate.tprefix ? `${certificate.tprefix}. ` : "";
  const trainerFullName = `${trPrefix}${certificate.trainer_name || ""}`;

  // Verify Link for QR Code
  const verifyLink = `${window.location.origin}/authenticity-verification/${certificate.id || id}`;
  const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(verifyLink)}&size=150`;

  // Signatures
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  // The PHP code used `upload/trainer/`
  const signatureUrl = certificate.digital_signature
    ? `${apiUrl.replace("/api", "")}/uploads/trainer/${certificate.digital_signature}`
    : null;

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
                            margin-top: ${certificate.show_logo === 1 ? "0.05in" : "0.2in"};
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

        <table
          align="center"
          border="0"
          cellPadding="0"
          cellSpacing="0"
          style={{
            width: "1000px",
            border: "1px solid #333",
            backgroundImage: "url(/images/navy.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            marginTop: "40px",
            backgroundColor: "#fff",
          }}
        >
          <tbody>
            <tr>
              <td>
                {/* Header with Logo and QR Code */}
                <table
                  align="center"
                  border="0"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ width: "1000px", margin: "0 auto" }}
                >
                  <tbody>
                    <tr>
                      <td height="40" style={{ fontSize: "0px" }}>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table
                          align="center"
                          border="0"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{ width: "900px" }}
                        >
                          <tbody>
                            <tr>
                              <td valign="top">
                                <table
                                  align="left"
                                  border="0"
                                  cellPadding="0"
                                  cellSpacing="0"
                                  style={{
                                    width: "700px",
                                    overflow: "hidden",
                                    borderRadius: "4px",
                                  }}
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        height="40"
                                        style={{ fontSize: "0px" }}
                                      >
                                        &nbsp;
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>
                                        <img
                                          width="188"
                                          src="/images/certificate-logo.jpg"
                                          alt="MOL Logo"
                                          style={{
                                            width: "100%",
                                            display: "block",
                                            lineHeight: "0px",
                                            fontSize: "0px",
                                            border: "0px",
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>

                                <table
                                  align="right"
                                  border="0"
                                  cellPadding="0"
                                  cellSpacing="0"
                                  style={{
                                    width: "150px",
                                    overflow: "hidden",
                                    borderRadius: "4px",
                                  }}
                                >
                                  <tbody>
                                    <tr>
                                      <td>
                                        <img
                                          src={qrCodeUrl}
                                          alt="QR Code"
                                          style={{
                                            display: "block",
                                            border: "0px",
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Title & Name */}
                <table
                  align="center"
                  border="0"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ width: "1000px", margin: "0 auto" }}
                >
                  <tbody>
                    <tr>
                      <td height="10" style={{ fontSize: "0px" }}>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td height="13" style={{ fontSize: "0px" }}>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          textAlign: "center",
                          color: "#1b1b1b",
                          fontSize: "32px",
                          letterSpacing: "0.7px",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          wordBreak: "break-word",
                          padding: "0 50px",
                        }}
                      >
                        {certificate.master_course_name}
                      </td>
                    </tr>
                    <tr>
                      <td height="10" style={{ fontSize: "0px" }}>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table
                          align="center"
                          border="0"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{ width: "900px" }}
                        >
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  textAlign: "center",
                                  color: "#1b1b1b",
                                  textTransform: "uppercase",
                                  fontSize: "25px",
                                  letterSpacing: "0.7px",
                                  wordBreak: "break-word",
                                  borderBottom: "1px solid #b7b7b7",
                                  lineHeight: "55px",
                                }}
                              >
                                {candidateFullName}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  textAlign: "center",
                                  color: "#202020",
                                  fontSize: "18px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.4px",
                                  lineHeight: "23px",
                                  wordBreak: "break-word",
                                }}
                              >
                                Name and Last Name
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="15" style={{ fontSize: "0px" }}>
                        &nbsp;
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* DOB & Nationality Grid */}
                <table
                  align="center"
                  border="0"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ width: "850px", margin: "0 auto" }}
                >
                  <tbody>
                    <tr>
                      <td height="0" style={{ fontSize: "0px" }}>
                        &nbsp;
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table
                          align="center"
                          border="0"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{ width: "900px" }}
                        >
                          <tbody>
                            <tr>
                              <td valign="top">
                                <table
                                  align="left"
                                  border="0"
                                  cellPadding="0"
                                  cellSpacing="0"
                                  style={{ width: "395px" }}
                                >
                                  <tbody>
                                    <tr>
                                      <td width="190">
                                        <table
                                          align="center"
                                          border="0"
                                          cellPadding="0"
                                          cellSpacing="0"
                                          style={{
                                            width: "100%",
                                            padding: "5px",
                                            lineHeight: "27px",
                                          }}
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                style={{
                                                  textAlign: "center",
                                                  color: "#1b1b1b",
                                                  textTransform: "uppercase",
                                                  fontSize: "18px",
                                                  letterSpacing: "0.7px",
                                                  wordBreak: "break-word",
                                                  borderBottom:
                                                    "1px solid #b7b7b7",
                                                  lineHeight: "40px",
                                                  fontWeight: "600",
                                                }}
                                              >
                                                {certificate.dob
                                                  ? formatCustomDate(
                                                      certificate.dob,
                                                      "dd-MMMM-yyyy",
                                                    )
                                                  : "-"}
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                style={{
                                                  textAlign: "center",
                                                  color: "#202020",
                                                  textTransform: "uppercase",
                                                  fontSize: "17px",
                                                  letterSpacing: "0.4px",
                                                  lineHeight: "23px",
                                                  wordBreak: "break-word",
                                                }}
                                              >
                                                Date Of Birth
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                      <td width="190">
                                        <table
                                          align="center"
                                          border="0"
                                          cellPadding="0"
                                          cellSpacing="0"
                                          style={{ width: "100%" }}
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                style={{
                                                  textAlign: "center",
                                                  textTransform: "uppercase",
                                                  color: "#1b1b1b",
                                                  fontSize: "18px",
                                                  letterSpacing: "0.7px",
                                                  wordBreak: "break-word",
                                                  borderBottom:
                                                    "1px solid #b7b7b7",
                                                  lineHeight: "40px",
                                                  fontWeight: "600",
                                                }}
                                              >
                                                {certificate.nationality ||
                                                  "UNKNOWN"}
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                style={{
                                                  textAlign: "center",
                                                  color: "#202020",
                                                  textTransform: "uppercase",
                                                  fontSize: "17px",
                                                  letterSpacing: "0.4px",
                                                  lineHeight: "23px",
                                                  wordBreak: "break-word",
                                                }}
                                              >
                                                Nationality
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td height="20" style={{ fontSize: "0px" }}>
                        &nbsp;
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Dates and Conducted Text */}
                <table
                  align="center"
                  border="0"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ width: "1050px", margin: "0 auto" }}
                >
                  <tbody>
                    <tr>
                      <td>
                        <table
                          align="center"
                          border="0"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{ width: "1050px" }}
                        >
                          <tbody>
                            <tr>
                              <td>
                                <table
                                  align="center"
                                  border="0"
                                  cellPadding="0"
                                  cellSpacing="0"
                                  style={{ width: "100%" }}
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        valign="top"
                                        style={{
                                          display: "flex",
                                          justifyContent: "center",
                                          gap: "40px",
                                        }}
                                      >
                                        <table
                                          align="left"
                                          border="0"
                                          cellPadding="0"
                                          cellSpacing="0"
                                          style={{
                                            width: "300px",
                                            overflow: "hidden",
                                            borderRadius: "4px",
                                          }}
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                style={{
                                                  textAlign: "center",
                                                  textTransform: "uppercase",
                                                  color: "#202020",
                                                  fontSize: "15px",
                                                  letterSpacing: "0.4px",
                                                  lineHeight: "23px",
                                                  wordBreak: "break-word",
                                                }}
                                              >
                                                Conducted from:
                                              </td>
                                              <td
                                                style={{
                                                  textAlign: "center",
                                                  textTransform: "uppercase",
                                                  color: "#1b1b1b",
                                                  fontSize: "15px",
                                                  letterSpacing: "0.7px",
                                                  wordBreak: "break-word",
                                                  fontWeight: "600",
                                                }}
                                              >
                                                &nbsp;
                                                {formatCustomDate(
                                                  certificate.from_date,
                                                  "dd-MMMM-yyyy",
                                                )}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>

                                        <table
                                          align="left"
                                          border="0"
                                          cellPadding="0"
                                          cellSpacing="0"
                                          style={{
                                            width: "200px",
                                            overflow: "hidden",
                                            borderRadius: "4px",
                                          }}
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                style={{
                                                  textAlign: "center",
                                                  textTransform: "uppercase",
                                                  color: "#202020",
                                                  fontSize: "15px",
                                                  letterSpacing: "0.4px",
                                                  lineHeight: "23px",
                                                  wordBreak: "break-word",
                                                }}
                                              >
                                                To:
                                              </td>
                                              <td
                                                style={{
                                                  textAlign: "center",
                                                  textTransform: "uppercase",
                                                  color: "#1b1b1b",
                                                  fontSize: "15px",
                                                  letterSpacing: "0.7px",
                                                  wordBreak: "break-word",
                                                  fontWeight: "600",
                                                }}
                                              >
                                                &nbsp;
                                                {formatCustomDate(
                                                  certificate.to_date,
                                                  "dd-MMMM-yyyy",
                                                )}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Success message */}
                <table
                  align="center"
                  border="0"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ width: "750px", margin: "0 auto" }}
                >
                  <tbody>
                    <tr>
                      <td>
                        <table
                          align="center"
                          border="0"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{ width: "600px" }}
                        >
                          <tbody>
                            <tr>
                              <td height="15" style={{ fontSize: "0px" }}>
                                &nbsp;
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  textAlign: "center",
                                  textTransform: "uppercase",
                                  color: "#181818",
                                  fontSize: "18px",
                                  letterSpacing: "0.4px",
                                  fontWeight: "600",
                                  lineHeight: "23px",
                                  wordBreak: "break-word",
                                }}
                              >
                                Has sucessfully completed the following course.
                              </td>
                            </tr>
                            <tr>
                              <td height="10" style={{ fontSize: "0px" }}>
                                &nbsp;
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Description */}
                <table
                  align="center"
                  border="0"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ width: "750px", margin: "0 auto" }}
                >
                  <tbody>
                    <tr>
                      <td>
                        <table
                          align="center"
                          border="0"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{ width: "900px" }}
                        >
                          <tbody>
                            <tr>
                              <td height="20" style={{ fontSize: "0px" }}>
                                &nbsp;
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <table
                                  align="left"
                                  border="0"
                                  cellPadding="0"
                                  cellSpacing="0"
                                  style={{ width: "100%" }}
                                >
                                  <tbody>
                                    <tr>
                                      <td>
                                        <table
                                          align="center"
                                          border="0"
                                          cellPadding="0"
                                          cellSpacing="0"
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                style={{
                                                  textAlign: "left",
                                                  textTransform: "uppercase",
                                                  color: "#383838",
                                                  fontSize: "19px",
                                                  letterSpacing: "0.4px",
                                                  lineHeight: "23px",
                                                  wordBreak: "break-word",
                                                  fontWeight: "600",
                                                }}
                                              >
                                                The training program consisted
                                                of detailed instructions on the
                                                following:
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  textAlign: "left",
                                  color: "#202020",
                                  textTransform: "uppercase",
                                  fontSize: "18px",
                                  letterSpacing: "0.4px",
                                  height: "550px",
                                  verticalAlign: "baseline",
                                }}
                                dangerouslySetInnerHTML={{
                                  __html: certificate.description1,
                                }}
                              />
                            </tr>
                            <tr>
                              <td height="40" style={{ fontSize: "0px" }}>
                                &nbsp;
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Footer Data Grid - Part 1 */}
                <table
                  align="center"
                  border="0"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ width: "950px", margin: "0 auto" }}
                >
                  <tbody>
                    <tr>
                      <td>
                        <table
                          align="center"
                          border="0"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{ width: "900px" }}
                        >
                          <tbody>
                            <tr>
                              <td>
                                <table
                                  align="center"
                                  border="0"
                                  cellPadding="0"
                                  cellSpacing="0"
                                  style={{ width: "900px" }}
                                >
                                  <tbody>
                                    <tr>
                                      <td valign="top">
                                        {/* Certificate No */}
                                        <table
                                          align="left"
                                          border="0"
                                          cellPadding="0"
                                          cellSpacing="0"
                                          style={{ width: "350px" }}
                                        >
                                          <tbody>
                                            <tr>
                                              <td>
                                                <table
                                                  align="center"
                                                  border="0"
                                                  cellPadding="0"
                                                  cellSpacing="0"
                                                  style={{
                                                    borderRadius: "0px",
                                                  }}
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td width="130">
                                                        <table
                                                          align="left"
                                                          border="0"
                                                          cellPadding="0"
                                                          cellSpacing="0"
                                                          style={{
                                                            width: "100%",
                                                          }}
                                                        >
                                                          <tbody>
                                                            <tr>
                                                              <td>
                                                                <table
                                                                  align="center"
                                                                  border="0"
                                                                  cellPadding="0"
                                                                  cellSpacing="0"
                                                                >
                                                                  <tbody>
                                                                    <tr>
                                                                      <td
                                                                        style={{
                                                                          textAlign:
                                                                            "left",
                                                                          textTransform:
                                                                            "uppercase",
                                                                          color:
                                                                            "#202020",
                                                                          fontSize:
                                                                            "14px",
                                                                          letterSpacing:
                                                                            "0.4px",
                                                                          lineHeight:
                                                                            "23px",
                                                                          wordBreak:
                                                                            "break-word",
                                                                        }}
                                                                      >
                                                                        Certificate
                                                                        No. :
                                                                      </td>
                                                                    </tr>
                                                                  </tbody>
                                                                </table>
                                                              </td>
                                                            </tr>
                                                          </tbody>
                                                        </table>
                                                      </td>
                                                      <td>
                                                        <table
                                                          align="center"
                                                          border="0"
                                                          cellPadding="0"
                                                          cellSpacing="0"
                                                          style={{
                                                            width: "100%",
                                                          }}
                                                        >
                                                          <tbody>
                                                            <tr>
                                                              <td
                                                                style={{
                                                                  textAlign:
                                                                    "center",
                                                                  color:
                                                                    "#1b1b1b",
                                                                  textTransform:
                                                                    "uppercase",
                                                                  fontSize:
                                                                    "14px",
                                                                  letterSpacing:
                                                                    "0.7px",
                                                                  wordBreak:
                                                                    "break-word",
                                                                  fontWeight:
                                                                    "600",
                                                                }}
                                                              >
                                                                {
                                                                  certificate.certificate_no
                                                                }
                                                              </td>
                                                            </tr>
                                                          </tbody>
                                                        </table>
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>

                                        {/* Course Conducted & Issue Date */}
                                        <table
                                          align="right"
                                          border="0"
                                          cellPadding="0"
                                          cellSpacing="0"
                                          style={{ width: "350px" }}
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                style={{
                                                  textAlign: "right",
                                                  color: "#202020",
                                                  textTransform: "uppercase",
                                                  fontSize: "14px",
                                                  letterSpacing: "0.4px",
                                                  lineHeight: "23px",
                                                  wordBreak: "break-word",
                                                }}
                                              >
                                                Course conducted :{" "}
                                                <strong>
                                                  {certificate.course_conduct
                                                    ? `${certificate.course_conduct} / ${certificate.location}`
                                                    : certificate.location}
                                                </strong>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                height="4"
                                                style={{ fontSize: "0px" }}
                                              >
                                                &nbsp;
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                style={{
                                                  textAlign: "right",
                                                  color: "#202020",
                                                  textTransform: "uppercase",
                                                  fontSize: "14px",
                                                  letterSpacing: "0.4px",
                                                  lineHeight: "23px",
                                                  wordBreak: "break-word",
                                                }}
                                              >
                                                Issued On :{" "}
                                                <strong>
                                                  {formatCustomDate(
                                                    certificate.issue_date,
                                                    "dd-MMMM-yyyy",
                                                  )}
                                                </strong>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td height="50" style={{ fontSize: "0px" }}>
                                &nbsp;
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Footer Data Grid - Part 2 */}
                <table
                  align="center"
                  border="0"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ width: "950px", margin: "0 auto" }}
                >
                  <tbody>
                    <tr>
                      <td>
                        <table
                          align="center"
                          border="0"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{ width: "900px" }}
                        >
                          <tbody>
                            <tr>
                              <td>
                                <table
                                  align="center"
                                  border="0"
                                  cellPadding="0"
                                  cellSpacing="0"
                                  style={{ width: "900px" }}
                                >
                                  <tbody>
                                    <tr>
                                      <td valign="top">
                                        {/* Trainer Info */}
                                        <table
                                          align="left"
                                          border="0"
                                          cellPadding="0"
                                          cellSpacing="0"
                                          style={{ width: "290px" }}
                                        >
                                          <tbody>
                                            <tr>
                                              <td>
                                                <table
                                                  align="left"
                                                  border="0"
                                                  cellPadding="0"
                                                  cellSpacing="0"
                                                  style={{ width: "100%" }}
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td>
                                                        <table
                                                          align="center"
                                                          border="0"
                                                          cellPadding="0"
                                                          cellSpacing="0"
                                                          style={{
                                                            borderRadius: "0px",
                                                          }}
                                                        >
                                                          <tbody>
                                                            <tr>
                                                              <td>
                                                                <table
                                                                  align="center"
                                                                  border="0"
                                                                  cellPadding="0"
                                                                  cellSpacing="0"
                                                                >
                                                                  <tbody>
                                                                    <tr>
                                                                      <td
                                                                        style={{
                                                                          textAlign:
                                                                            "center",
                                                                          textTransform:
                                                                            "uppercase",
                                                                          color:
                                                                            "#1b1b1b",
                                                                          fontSize:
                                                                            "18px",
                                                                          letterSpacing:
                                                                            "0.7px",
                                                                          wordBreak:
                                                                            "break-word",
                                                                          borderBottom:
                                                                            "1px solid #b7b7b7",
                                                                          lineHeight:
                                                                            "40px",
                                                                          fontWeight:
                                                                            "600",
                                                                        }}
                                                                      >
                                                                        {
                                                                          trainerFullName
                                                                        }
                                                                      </td>
                                                                    </tr>
                                                                    <tr>
                                                                      <td
                                                                        style={{
                                                                          textAlign:
                                                                            "center",
                                                                          color:
                                                                            "#202020",
                                                                          textTransform:
                                                                            "uppercase",
                                                                          fontSize:
                                                                            "18px",
                                                                          letterSpacing:
                                                                            "0.4px",
                                                                          lineHeight:
                                                                            "23px",
                                                                          wordBreak:
                                                                            "break-word",
                                                                        }}
                                                                      >
                                                                        (Course
                                                                        Faculty)
                                                                      </td>
                                                                    </tr>
                                                                  </tbody>
                                                                </table>
                                                              </td>
                                                            </tr>
                                                          </tbody>
                                                        </table>
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>

                                        {/* DNV Stamp (If active) */}
                                        <table
                                          align="left"
                                          border="0"
                                          cellPadding="0"
                                          cellSpacing="0"
                                          style={{
                                            margin: "0 0 0 40px",
                                          }}
                                        >
                                          <tbody>
                                            <tr>
                                              {certificate.show_logo === 1 && (
                                                <td>
                                                  <img
                                                    src={`/images/${certificate.type === "DNV-ST0029" ? "DNV-ST0029.png" : "img0.jpg"}`}
                                                    alt="Stamp Logo"
                                                    style={{
                                                      width: "130px",
                                                      maxWidth: "none",
                                                      display: "block",
                                                    }}
                                                  />
                                                </td>
                                              )}
                                            </tr>
                                          </tbody>
                                        </table>

                                        {/* Digital Signature */}
                                        <table
                                          align="right"
                                          border="0"
                                          cellPadding="0"
                                          cellSpacing="0"
                                          style={{ width: "290px" }}
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                style={{
                                                  textAlign: "center",
                                                  color: "#1b1b1b",
                                                  fontSize: "18px",
                                                  letterSpacing: "0.7px",
                                                  wordBreak: "break-word",
                                                  borderBottom:
                                                    "1px solid #b7b7b7",
                                                  fontWeight: "600",
                                                  height: "85px",
                                                  verticalAlign: "middle",
                                                }}
                                              >
                                                {signatureUrl && (
                                                  <img
                                                    src={signatureUrl}
                                                    height="20px"
                                                    width="80px"
                                                    alt="Trainer Signature"
                                                    style={{
                                                      display: "block",
                                                      margin: "0 auto",
                                                    }}
                                                  />
                                                )}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td
                                        height="50"
                                        style={{ fontSize: "0px" }}
                                      >
                                        &nbsp;
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Copyright & Verification Info */}
                <table
                  align="center"
                  border="0"
                  cellPadding="0"
                  cellSpacing="0"
                  style={{
                    width: "750px",
                    margin: "0 auto",
                    borderRadius: "0 0 6px 6px",
                  }}
                >
                  <tbody>
                    <tr>
                      <td>
                        <table
                          align="center"
                          border="0"
                          cellPadding="0"
                          cellSpacing="0"
                          style={{ width: "700px" }}
                        >
                          <tbody>
                            <tr>
                              <td>
                                <img
                                  src="/images/GlobalMET-Logo.jpg"
                                  alt="GlobalMET"
                                  style={{
                                    width: "300px",
                                    verticalAlign: "middle",
                                    border: "0",
                                    marginLeft: "-50px",
                                  }}
                                />
                              </td>
                              <td
                                style={{
                                  textAlign: "center",
                                  textTransform: "uppercase",
                                  color: "#202020",
                                  fontSize: "12px",
                                  letterSpacing: "0.4px",
                                  lineHeight: "23px",
                                  wordBreak: "break-word",
                                }}
                              >
                                The Quality management system of MOL Maritime
                                (India) Pvt. Ltd. Has been certified to comply
                                with ISO 9001:2015 standards by LRQA
                              </td>
                            </tr>
                            <tr>
                              <td></td>
                              <td
                                style={{
                                  textAlign: "center",
                                  textTransform: "uppercase",
                                  color: "#202020",
                                  fontSize: "10px",
                                  letterSpacing: "0.4px",
                                  lineHeight: "23px",
                                  wordBreak: "break-word",
                                }}
                              >
                                *This is an Electronically generated certificate
                                for Validity Verification Scan QR CODE on the
                                certificate.
                              </td>
                            </tr>
                            <tr>
                              <td height="20" style={{ fontSize: "0px" }}>
                                &nbsp;
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CertificatePrintView;
