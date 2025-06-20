import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFileOperations } from "@/hooks/useFileOperations";
import FileDeleteConfirmDialog from "./FileDeleteConfirmDialog";

interface FileViewerModalProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FileData {
  id: string;
  file_url: string;
  file_url_path: string;
  file_name: string;
  file_type?: string;
  created_at: string;
  extracted_summary?: string;
  broker_id?: string;
  lender_id?: string;
}

const FileViewerModal = ({ user, open, onOpenChange }: FileViewerModalProps) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const { deleteFile, canDeleteFile, loading: deleteLoading } = useFileOperations();

  useEffect(() => {
    if (open && user) {
      fetchUserFiles();
    }
  }, [open, user]);

  const fetchUserFiles = async () => {
    setLoading(true);
    try {
      let query;
      
      if (user.role === 'broker') {
        query = supabase
          .from('broker_files')
          .select('*')
          .eq('broker_id', user.id);
      } else if (user.role === 'lender') {
        query = supabase
          .from('lender_files')
          .select('*')
          .eq('lender_id', user.id);
      } else {
        setFiles([]);
        setLoading(false);
        return;
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to load user files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileView = (file: FileData) => {
    const bucket = file.broker_id ? "broker_files" : "lender_files";
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(file.file_url_path);
    window.open(data.publicUrl, '_blank');
  };

  const handleDownload = async (file: FileData) => {
    try {
      const bucket = file.broker_id ? "broker_files" : "lender_files";
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(file.file_url_path);

      if (error) throw error;

      // Create a download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (file: FileData) => {
    if (!canDeleteFile(file)) {
      toast({
        title: "Error",
        description: "You don't have permission to delete this file",
        variant: "destructive",
      });
      return;
    }
    setFileToDelete(file);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    // Ensure correct broker_id/lender_id for admin context
    let fileData = { ...fileToDelete };
    if (user.role === 'broker' && !fileData.broker_id) {
      fileData.broker_id = user.id;
    } else if (user.role === 'lender' && !fileData.lender_id) {
      fileData.lender_id = user.id;
    }

    const success = await deleteFile(fileData);
    if (success) {
      await fetchUserFiles(); // Always refresh from backend
      setShowDeleteDialog(false);
      setFileToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-full sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Files for {user?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No files found for this user</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        <span
                          className="font-medium truncate"
                          title={file.file_name}
                        >
                          {file.file_name.length > 48
                            ? file.file_name.slice(0, 48) + '...'
                            : file.file_name}
                        </span>
                        {file.file_type && (
                          <Badge variant="secondary" className="text-xs">
                            {file.file_type}
                          </Badge>
                        )}
                      </div>
                      {file.extracted_summary && (
                        <p className="text-sm text-gray-600 mb-2">
                          {file.extracted_summary}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        Uploaded: {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 mt-2 md:mt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFileView(file)}
                        title="View file"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(file)}
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {canDeleteFile(file) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(file)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <FileDeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        fileName={fileToDelete ? fileToDelete.file_name : undefined}
        loading={deleteLoading}
      />
    </>
  );
};

export default FileViewerModal;
