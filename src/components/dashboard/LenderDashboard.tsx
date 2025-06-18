import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { Upload, FileText, Building, Target, AlertCircle, Trash2, Download, ExternalLink } from "lucide-react";
import { useFileOperations } from "@/hooks/useFileOperations";
import ProfileStatusBanner from '@/components/ProfileStatusBanner';

interface LenderData {
  company_name?: string;
  specialization?: string;
  criteria_summary?: string;
  guideline_file_url?: string;
  id?: string;
}

interface LenderFile {
  id: string;
  file_url: string;
  file_url_path: string;
  file_name: string;
  file_type?: string;
  created_at: string;
  lender_id: string;
}

const LenderDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isComplete, loading: completionLoading } = useProfileCompletion();
  const [lenderData, setLenderData] = useState<LenderData | null>(null);
  const [lenderFiles, setLenderFiles] = useState<LenderFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const {
    uploadUserFile,
    deleteFile,
    downloadFile,
    loading: fileLoading,
  } = useFileOperations();

  useEffect(() => {
    fetchLenderData();
    fetchLenderFiles();
  }, [user]);

  const fetchLenderData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("lenders")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching lender data:", error);
      } else {
        setLenderData(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLenderFiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("lender_files")
        .select("*")
        .eq("lender_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching lender files:", error);
      } else {
        setLenderFiles(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      await uploadUserFile({
        bucket: "lender_files",
        tableName: "lender_files",
        userId: user.id,
        file,
        folder: user.id,
      });
      await fetchLenderFiles();
    } catch (error) {
      // Errors handled inside hook
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (file: LenderFile) => {
    if (!file.id) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this file?"
    );
    if (!confirmed) return;

    const success = await deleteFile(file);
    if (success) {
      await fetchLenderFiles();
    }
  };

  if (loading || completionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lender Dashboard</h1>
          <p className="text-gray-600">
            Manage your lending profile and files
          </p>
        </div>
        <div>
          <ProfileStatusBanner className="mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Company Info Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  Company Information
                </CardTitle>
                <Building className="h-5 w-5 text-teal-600 ml-auto" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company Name</p>
                    <p className="text-lg">{lenderData?.company_name || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Specialization</p>
                    <p className="text-lg">{lenderData?.specialization || "Not set"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Files Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  Your Files
                </CardTitle>
                <FileText className="h-5 w-5 text-teal-600 ml-auto" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lenderFiles.length > 0 ? (
                    lenderFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-700">
                          {file.file_name}
                        </span>
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mr-2"
                            onClick={() => downloadFile(file.file_url_path, file.file_name)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleFileDelete(file)}
                            disabled={fileLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No files uploaded yet
                    </p>
                  )}
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={fileLoading || uploading}
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={fileLoading || uploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {fileLoading || uploading
                        ? "Uploading..."
                        : "Upload New File"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Matching Requests Card */}
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Recent Matching Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">No matching requests available</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Matching requests will appear here when brokers submit files
                    that match your criteria
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LenderDashboard;
