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
import { Input } from '@/components/ui/input';
import FileDeleteConfirmDialog from './FileDeleteConfirmDialog';

interface LenderData {
  company_name?: string;
  specialization?: string;
  criteria_summary?: string;
  guideline_file_url?: string;
  id?: string;
  contact_info?: string;
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const matchingRequests: any[] = [];
  const [fileToDelete, setFileToDelete] = useState<LenderFile | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState<any[]>([]);

  const {
    uploadUserFile,
    deleteFile,
    downloadFile,
    loading: fileLoading,
  } = useFileOperations();

  useEffect(() => {
    fetchLenderData();
    fetchLenderFiles();
    if (!profile?.id) return;
    supabase
      .from('admin_notes')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setAdminNotes(data || []);
      });
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0 || !user) return;
    setUploading(true);
    try {
      for (const file of selectedFiles) {
        await uploadUserFile({
          bucket: 'lender_files',
          tableName: 'lender_files',
          userId: user.id,
          file,
          folder: user.id,
        });
      }
      await fetchLenderFiles();
      setSelectedFiles([]);
    } catch {
      // error handled inside hook
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (file: LenderFile) => {
    setFileToDelete(file);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    const fileData = {
      ...fileToDelete,
      lender_id: user?.id,
    };
    const success = await deleteFile(fileData);
    if (success) {
      await fetchLenderFiles();
      setShowDeleteDialog(false);
      setFileToDelete(null);
    }
  };

  const handleFileView = (file: LenderFile) => {
    const bucket = 'lender_files';
    const { data } = supabase.storage.from(bucket).getPublicUrl(file.file_url_path);
    window.open(data.publicUrl, '_blank');
  };

  if (loading || completionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {profile?.full_name}
            </h1>
            <p className="text-gray-600">Lender Dashboard</p>
          </div>
          <div>
            <ProfileStatusBanner className="mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Company Information Card */}
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    Company Information
                  </CardTitle>
                  <Building className="h-5 w-5 text-teal-600 ml-auto" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>
                      <strong>Company Name:</strong> {lenderData?.company_name || 'Not set'}
                    </p>
                    <p>
                      <strong>Specialization:</strong> {lenderData?.specialization || 'Not set'}
                    </p>
                    <p>
                      <strong>Contact Info:</strong> {lenderData?.contact_info || 'Not set'}
                    </p>
                    <p>
                      <strong>Criteria Summary:</strong> {lenderData?.criteria_summary || 'Not set'}
                    </p>
                  </div>
                  {!lenderData?.company_name && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => navigate('/profile-completion')}
                    >
                      Complete Profile
                    </Button>
                  )}
                </CardContent>
              </Card>
              {/* Upload Guidelines Card */}
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    Upload Guidelines
                  </CardTitle>
                  <FileText className="h-5 w-5 text-teal-600 ml-auto" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-gray-500 text-sm">
                      Upload your lending guidelines or other relevant documents (PDF, DOC, DOCX)
                    </p>
                    <input
                      id="lender-file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        setUploading(true);
                        try {
                          for (const file of Array.from(files)) {
                            await uploadUserFile({
                              bucket: "lender_files",
                              tableName: "lender_files",
                              userId: user.id,
                              file,
                              folder: user.id,
                            });
                          }
                          await fetchLenderFiles();
                        } catch {
                          // error handled inside hook
                        } finally {
                          setUploading(false);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={() => document.getElementById('lender-file-upload')?.click()}
                    disabled={uploading}
                    className="w-full mt-4"
                  >
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </Button>
                </CardContent>
              </Card>
              {/* Files Card (remove from grid) */}
              {/* <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Files</CardTitle>
                  <FileText className="h-5 w-5 text-teal-600 ml-auto" />
                </CardHeader>
                <CardContent>
                  {lenderFiles.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <p className="mb-2">No files uploaded yet</p>
                      <p className="text-sm">Upload your first file to see it listed here</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {lenderFiles.map((file) => (
                        <li key={file.id} className="flex items-center justify-between py-2">
                          <div>
                            <span className="font-medium">{file.file_name}</span>
                            <span className="ml-2 text-xs text-gray-500">{new Date(file.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => downloadFile(file.file_url_path, file.file_name)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleFileDelete(file)} disabled={fileLoading}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card> */}
            </div>
            {/* Files Panel (full width) */}
            <Card className="mb-8">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Files</CardTitle>
                <FileText className="h-5 w-5 text-teal-600 ml-auto" />
              </CardHeader>
              <CardContent>
                {lenderFiles.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <p className="mb-2">No files uploaded yet</p>
                    <p className="text-sm">Upload your first file to see it listed here</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {lenderFiles.map((file) => (
                      <li key={file.id} className="flex items-center justify-between py-2">
                        <div>
                          <span className="font-medium">{file.file_name}</span>
                          <span className="ml-2 text-xs text-gray-500">{new Date(file.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleFileView(file)} title="View file">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => downloadFile('lender_files/' + file.file_url_path, file.file_name)} title="Download file">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteClick(file)} disabled={fileLoading} title="Delete file">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            {/* Recent Matching Requests Section */}
            <Card className="mb-8">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Recent Matching Requests</CardTitle>
                <FileText className="h-5 w-5 text-teal-600 ml-auto" />
              </CardHeader>
              <CardContent>
                {matchingRequests.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <p className="mb-2">No matching requests available</p>
                    <p className="text-sm">Matching requests will appear here when brokers submit files that match your criteria</p>
                  </div>
                ) : (
                  // ...existing matching requests table/content...
                  <div>Matching requests table goes here</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <FileDeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        fileName={fileToDelete ? fileToDelete.file_name : undefined}
        loading={fileLoading}
      />
    </>
  );
};

export default LenderDashboard;
