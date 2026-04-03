import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import assessmentService from "../../services/assessmentService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Meta from "../../components/common/Meta";
import { ArrowLeft, XCircle } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";

// Custom Back Button mimicking the old UI style
const BackButton = ({ to }) => (
  <Link
    to={to}
    className="flex items-center justify-center w-8 h-8 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
  >
    <ArrowLeft className="w-5 h-5" />
  </Link>
);

const SubmissionDetail = () => {
  const { resultId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!data) return;
    try {
      setIsDownloading(true);
      const response = await assessmentService.downloadSubmissionPdf(resultId);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Revoke after a short delay to allow the new tab to load
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error("PDF open error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await assessmentService.getSubmissionDetail(resultId);
        if (response.success) {
          setData(response.data);
        } else {
          setError("Failed to fetch submission details");
        }
      } catch (err) {
        console.error("Fetch submission detail error:", err);
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching details",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [resultId]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Error</h3>
        <p className="text-slate-500 max-w-sm">{error}</p>
        <Link
          to="/assessment/submitted-assessments"
          className="mt-6 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const { result, answers } = data;

  // Change back link to return to the main flat listing
  const backLink = "/assessment/submitted";

  // Only show download button for Post Course (type 2)
  const canDownload = result.type_of_test === 2 || result.type_of_test === "2";

  return (
    <div className="flex-1 overflow-y-auto">
      <Meta title="Submitted Assessment | MOLMI" />

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <BackButton to={backLink} />
          <h1 className="text-2xl font-light text-slate-800 tracking-tight">
            Submitted Assessment
          </h1>
        </div>
        {canDownload && (
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded bg-blue-600 px-4 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDownloading ? "Downloading..." : "Download"}
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <Card className="rounded-xl border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardContent className="p-8">
          <div className="space-y-10">
            {answers.length > 0 ? (
              answers.map((ans, index) => {
                const options = [
                  {
                    key: "option_a",
                    label: "A",
                    text: ans.option_a,
                    img: ans.opt_img_a,
                  },
                  {
                    key: "option_b",
                    label: "B",
                    text: ans.option_b,
                    img: ans.opt_img_b,
                  },
                  {
                    key: "option_c",
                    label: "C",
                    text: ans.option_c,
                    img: ans.opt_img_c,
                  },
                  {
                    key: "option_d",
                    label: "D",
                    text: ans.option_d,
                    img: ans.opt_img_d,
                  },
                ];

                return (
                  <div
                    key={ans.id}
                    className="pb-8 border-b border-slate-100 last:border-0 last:pb-0"
                  >
                    {/* Question Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 flex items-baseline">
                        <span className="text-4xl font-light text-slate-800 tracking-tighter mr-1">
                          Q
                        </span>
                        <span className="text-lg font-medium text-slate-700">
                          {index + 1}.
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium uppercase tracking-wide leading-relaxed pt-3">
                        {ans.question}
                      </p>
                    </div>

                    {/* Optional Question Image */}
                    {ans.image && (
                      <div className="mb-6 ml-14">
                        <img
                          src={ans.image}
                          alt="Question"
                          className="w-1/4 h-auto rounded border border-slate-200"
                        />
                      </div>
                    )}

                    {/* Options List */}
                    <div className="ml-14 space-y-1">
                      {options.map((opt) => {
                        if (!opt.text) return null;

                        const isSelected =
                          ans.selected_option === opt.key ||
                          ans.selected_option ===
                            opt.key.replace("option_", "opt_");
                        const isCorrect =
                          ans.correct_option === opt.key ||
                          ans.correct_option ===
                            opt.key.replace("option_", "opt_");

                        let rowStyle =
                          "border-b-2 border-slate-100 bg-white text-slate-600";
                        let iconHtml = null;
                        let correctLabel = null;

                        if (isCorrect && !isSelected) {
                          rowStyle =
                            "border-b-2 border-slate-100 bg-white text-slate-600";
                          correctLabel = (
                            <span className="text-green-600 font-bold ml-2 text-sm">
                              (Correct Answer)
                            </span>
                          );
                        }
                        if (isCorrect && isSelected) {
                          rowStyle =
                            "border-b-2 border-green-500 bg-green-100/50 text-slate-800";
                          iconHtml = (
                            <i className="fas fa-check text-green-600 ml-3"></i>
                          );
                        }
                        if (isSelected && !isCorrect) {
                          rowStyle =
                            "border-b-2 border-slate-100 bg-white text-slate-600";
                          iconHtml = (
                            <i className="fas fa-times text-red-500 ml-3"></i>
                          );
                        }

                        return (
                          <div
                            key={opt.key}
                            className={`flex items-start flex-col px-3 py-3 transition-colors ${rowStyle}`}
                          >
                            {opt.img && (
                              <img
                                src={opt.img}
                                alt={`Option ${opt.label}`}
                                className="w-1/4 h-auto mb-2 rounded border border-slate-200"
                              />
                            )}
                            <div className="flex items-center text-[13px] uppercase font-medium tracking-wide">
                              {opt.text}
                              {iconHtml}
                              {correctLabel}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-500">
                No answers recorded for this submission.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionDetail;


