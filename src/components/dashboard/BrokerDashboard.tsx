import { useAuth } from "@/components/auth/AuthProvider";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { useFileOperations } from "@/hooks/useFileOperations";
import {
  Upload,
  FileText,
  Building,
  Crown,
  AlertCircle,
  Trash2,
  Download,
  ExternalLink,
} from "lucide-react";
import FileDeleteConfirmDialog from "./FileDeleteConfirmDialog";
import ProfileStatusBanner from '@/components/ProfileStatusBanner';
import { Input } from "@/components/ui/input";

interface BrokerData {
  agency_name?: string;
  client_notes?: string;
  subscription_tier?: string;
}

interface BrokerFile {
  id: string;
  file_type?: string;
  file_url: string;
  extracted_summary?: string;
  created_at: string;
  file_name?: string;
  file_url_path?: string;
}

const BrokerDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isComplete, loading: completionLoading } = useProfileCompletion();
  const {
    deleteFile,
    canDeleteFile,
    downloadFile,
    uploadUserFile,
    loading: fileLoading,
  } = useFileOperations();

  const [brokerData, setBrokerData] = useState<BrokerData | null>(null);
  const [brokerFiles, setBrokerFiles] = useState<BrokerFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileToDelete, setFileToDelete] = useState<BrokerFile | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [adminNotes, setAdminNotes] = useState<any[]>([]);

  useEffect(() => {
    fetchBrokerData();
    fetchBrokerFiles();
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

  const fetchBrokerData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("brokers")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching broker data:", error);
      } else {
        setBrokerData(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrokerFiles = async () => {
    if (!user) return;

    let files: BrokerFile[] = [];
    try {
      const { data, error } = await supabase
        .from("broker_files")
        .select("*")
        .eq("broker_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching broker files:", error);
      } else {
        files = data || [];
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setBrokerFiles(files);
  };

  // Handle file upload using useFileOperations hook
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      await uploadUserFile({
        bucket: "broker_files",
        tableName: "broker_files",
        userId: user.id,
        file,
        folder: user.id,
      });
      await fetchBrokerFiles();
    } catch {
      // error handled inside hook
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (file: BrokerFile) => {
    setFileToDelete(file);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    const fileData = {
      ...fileToDelete,
      broker_id: user?.id,
    };
    const success = await deleteFile(fileData);
    if (success) {
      await fetchBrokerFiles();
      setShowDeleteDialog(false);
      setFileToDelete(null);
    }
  };

  const getFileName = (file: BrokerFile) => {
    return file.file_name || file.file_type || "Document";
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileList = Array.from(files);
      setSelectedFiles(fileList);
    }
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0 || !user) return;

    setUploading(true);
    try {
      for (const file of selectedFiles) {
        await uploadUserFile({
          bucket: "broker_files",
          tableName: "broker_files",
          userId: user.id,
          file,
          folder: user.id,
        });
      }
      await fetchBrokerFiles();
      setSelectedFiles([]);
    } catch {
      // error handled inside hook
    } finally {
      setUploading(false);
    }
  };

  const handleFileView = (file: BrokerFile) => {
    const bucket = 'broker_files';
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {profile?.full_name}
          </h1>
          <p className="text-gray-600">Broker Dashboard</p>
        </div>
        <div>
          <ProfileStatusBanner className="mb-6" />
          {adminNotes.length > 0 && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul>
                  {adminNotes.map(note => (
                    <li key={note.id} className="mb-2">
                      <div>{note.note}</div>
                      <div className="text-xs text-gray-400">{new Date(note.created_at).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Agency Info Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  Agency Information
                </CardTitle>
                <Building className="h-5 w-5 text-teal-600 ml-auto" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Agency:</strong>{' '}
                    {brokerData?.agency_name || 'Not set'}
                  </p>
                  <p>
                    <strong>Country:</strong> {profile?.country}
                  </p>
                  <p>
                    <strong>Client Notes:</strong>{' '}
                    {brokerData?.client_notes || 'None'}
                  </p>
                </div>
                {!brokerData?.agency_name && (
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
            {/* Subscription Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  Subscription
                </CardTitle>
                <Crown className="h-5 w-5 text-teal-600 ml-auto" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">{brokerData?.subscription_tier === 'premium' ? 'Premium Plan' : brokerData?.subscription_tier === 'enterprise' ? 'Enterprise Plan' : 'Free Plan'}</p>
                  <p className="text-gray-500 text-sm">
                    {brokerData?.subscription_tier === 'premium' && 'Access to premium features'}
                    {brokerData?.subscription_tier === 'enterprise' && 'Enterprise-level access'}
                    {!brokerData?.subscription_tier || brokerData?.subscription_tier === 'free' ? 'Full access to all features' : ''}
                  </p>
                </div>
              </CardContent>
            </Card>
            {/* Upload Client Files Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  Upload Client Files
                </CardTitle>
                <FileText className="h-5 w-5 text-teal-600 ml-auto" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-gray-500 text-sm">
                    Upload .3,4 files, credit reports, or other client documents
                  </p>
                  <input
                    id="broker-file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      setUploading(true);
                      try {
                        for (const file of Array.from(files)) {
                          await uploadUserFile({
                            bucket: "broker_files",
                            tableName: "broker_files",
                            userId: user.id,
                            file,
                            folder: user.id,
                          });
                        }
                        await fetchBrokerFiles();
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
                  onClick={() => document.getElementById('broker-file-upload')?.click()}
                  disabled={uploading}
                  className="w-full mt-4"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
              </CardContent>
            </Card>
          </div>
          {/* Files Panel (full width) */}
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Files</CardTitle>
              <FileText className="h-5 w-5 text-teal-600 ml-auto" />
            </CardHeader>
            <CardContent>
              {brokerFiles.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p className="mb-2">No files uploaded yet</p>
                  <p className="text-sm">Upload your first file to see it listed here</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {brokerFiles.map((file) => (
                    <li key={file.id} className="flex items-center justify-between py-2">
                      <div>
                        <span className="font-medium">{file.file_name}</span>
                        <span className="ml-2 text-xs text-gray-500">{new Date(file.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleFileView(file)} title="View file">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => downloadFile('broker_files/' + file.file_url_path, file.file_name)} title="Download file">
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
        </div>
      </div>

      <FileDeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        fileName={fileToDelete ? getFileName(fileToDelete) : undefined}
        loading={fileLoading}
      />
    </div>
  );
};

export default BrokerDashboard;
