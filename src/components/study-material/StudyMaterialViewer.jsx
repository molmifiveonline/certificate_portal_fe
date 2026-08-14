import React, { useEffect, useState } from "react";
import { studyMaterialService } from "../../services/studyMaterialService";
import { toast } from "sonner";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import { FileText, Eye, Download, BookOpen, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import SecureDocumentViewer from "./SecureDocumentViewer";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const StudyMaterialViewer = ({ masterCourseId, userType }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Viewer state
  const [activeFile, setActiveFile] = useState(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!masterCourseId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await studyMaterialService.getStudyMaterials({
          master_course_id: masterCourseId,
          user_type: userType,
          limit: 100, // Fetch all for simple layout
        });

        if (response.success && response.data) {
          // If the API returns paginated data (e.g. { data: [...] })
          const fetchedData = response.data.data || response.data || [];
          
          // Now fetch details for each material to get their files
          const detailedMaterials = await Promise.all(
            fetchedData.map(async (material) => {
              try {
                const detailResp = await studyMaterialService.getStudyMaterialById(material.id);
                return detailResp.success ? detailResp.data : material;
              } catch (e) {
                console.error("Error fetching detail for material", material.id, e);
                return material;
              }
            })
          );
          setMaterials(detailedMaterials);
        }
      } catch (error) {
        console.error("Error fetching study materials for viewer:", error);
        toast.error(getErrorMessage(error, "Failed to load study materials"));
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [masterCourseId, userType]);

  const handleDownload = (fileUrl, originalName) => {
    // Standard trigger download
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse bg-slate-100/50 border border-slate-200/60 rounded-xl p-6 space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            <div className="h-10 bg-slate-200 rounded w-full mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
        <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-700">No Study Materials</h3>
        <p className="text-xs text-slate-500 mt-1">There are no study materials uploaded for this course yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {materials.map((material) => (
        <Card key={material.id} className="border border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm overflow-hidden rounded-xl">
          <CardHeader className="bg-slate-50/55 border-b border-slate-100 px-6 py-4 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold text-slate-800">
                {material.category}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Uploaded: {new Date(material.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div>
              <Badge variant={material.access_type === "view" ? "warning" : "success"}>
                {material.access_type === "view" ? "View Only" : "View & Download"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {material.files && material.files.length > 0 ? (
                material.files.map((file) => {
                  const fileUrl = `${API_URL}/uploads/study_material/${file.file_name}`;
                  return (
                    <div
                      key={file.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate" title={file.display_name}>
                            {file.display_name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {file.file_original_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveFile({
                            url: fileUrl,
                            name: file.display_name || file.file_original_name,
                            accessType: material.access_type
                          })}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                        >
                          <Eye className="w-4 h-4 mr-1.5" />
                          View
                        </Button>
                        
                        {material.access_type === "view_download" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleDownload(fileUrl, file.file_original_name)}
                            className="text-xs font-semibold"
                          >
                            <Download className="w-4 h-4 mr-1.5" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic">No files attached to this study material.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Render overlay viewer when a file is selected for viewing */}
      {activeFile && (
        <SecureDocumentViewer
          fileUrl={activeFile.url}
          fileName={activeFile.name}
          accessType={activeFile.accessType}
          onClose={() => setActiveFile(null)}
        />
      )}
    </div>
  );
};

export default StudyMaterialViewer;
