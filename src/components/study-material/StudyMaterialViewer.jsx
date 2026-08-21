import React, { useEffect, useState, useMemo } from "react";
import { studyMaterialService } from "../../services/studyMaterialService";
import { toast } from "sonner";
import { getErrorMessage } from "../../lib/utils/errorUtils";
import { FileText, Eye, Download, BookOpen, Clock, ChevronDown, Folder, Video, Music, Image as ImageIcon, File } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import SecureDocumentViewer from "./SecureDocumentViewer";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const StudyMaterialViewer = ({ masterCourseId, userType }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCategories, setOpenCategories] = useState({});
  
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

  const groupedCategories = useMemo(() => {
    const groups = {};
    materials.forEach((material) => {
      const category = material.category || "Uncategorized";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(material);
    });
    return groups;
  }, [materials]);

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

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
    <div className="space-y-4">
      {Object.entries(groupedCategories).map(([category, catMaterials]) => {
        const isOpen = !!openCategories[category];
        const totalFiles = catMaterials.reduce(
          (sum, m) => sum + (m.files ? m.files.length : 0),
          0
        );

        return (
          <div
            key={category}
            className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden transition-all"
          >
            {/* Category Accordion Header */}
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/75 hover:bg-slate-100/80 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Folder className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    {category}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {totalFiles} {totalFiles === 1 ? "file" : "files"}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-slate-600" : ""
                }`}
              />
            </button>

            {/* Accordion Content */}
            {isOpen && (
              <div className="p-5 border-t border-slate-100 space-y-4 bg-white">
                {catMaterials.map((material) => (
                  <div key={material.id} className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          Uploaded: {new Date(material.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge
                        variant={
                          material.access_type === "view" ? "warning" : "success"
                        }
                      >
                        {material.access_type === "view"
                          ? "View Only"
                          : "View & Download"}
                      </Badge>
                    </div>

                    <div className="space-y-2.5">
                      {material.files && material.files.length > 0 ? (
                        material.files.map((file) => {
                          const fileUrl = `${API_URL}/uploads/study_material/${file.file_name}`;
                          const ext = (file.file_original_name || file.file_name || "").split(".").pop().toLowerCase();
                          const isImg = ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"].includes(ext);
                          const isVid = ["mp4", "webm", "mkv", "mov", "avi", "m4v"].includes(ext);
                          const isAud = ["mp3", "wav", "ogg", "aac", "m4a", "flac"].includes(ext);
                          const isPdf = ext === "pdf";

                          return (
                            <div
                              key={file.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-slate-100 rounded-lg bg-slate-50/40 hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isImg ? "bg-emerald-50 text-emerald-600" :
                                  isVid ? "bg-purple-50 text-purple-600" :
                                  isAud ? "bg-pink-50 text-pink-600" :
                                  isPdf ? "bg-rose-50 text-rose-600" :
                                  "bg-indigo-50 text-indigo-600"
                                }`}>
                                  {isImg ? <ImageIcon className="w-4 h-4" /> :
                                   isVid ? <Video className="w-4 h-4" /> :
                                   isAud ? <Music className="w-4 h-4" /> :
                                   isPdf ? <FileText className="w-4 h-4" /> :
                                   <File className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0">
                                  <p
                                    className="text-sm font-medium text-slate-700 truncate"
                                    title={file.display_name}
                                  >
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
                                  onClick={() =>
                                    setActiveFile({
                                      url: fileUrl,
                                      name:
                                        file.display_name || file.file_original_name,
                                      originalName: file.file_original_name,
                                      accessType: material.access_type,
                                    })
                                  }
                                  className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                                >
                                  <Eye className="w-4 h-4 mr-1.5" />
                                  View
                                </Button>

                                {material.access_type === "view_download" && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() =>
                                      handleDownload(
                                        fileUrl,
                                        file.file_original_name
                                      )
                                    }
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
                        <p className="text-xs text-slate-400 italic py-2">
                          No files attached to this study material.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Render overlay viewer when a file is selected for viewing */}
      {activeFile && (
        <SecureDocumentViewer
          fileUrl={activeFile.url}
          fileName={activeFile.name}
          originalName={activeFile.originalName}
          accessType={activeFile.accessType}
          onClose={() => setActiveFile(null)}
        />
      )}
    </div>
  );
};

export default StudyMaterialViewer;
