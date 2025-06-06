
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
  file_type?: string;
  created_at: string;
  extracted_summary?: string;
  broker_id?: string;
}

const FileViewerModal = ({ user, open, onOpenChange }: FileViewerModalProps) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const { deleteFile, canDeleteFile, downloadFile, loading: deleteLoading } = useFileOperations();

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
        // For lenders, we'll check if they have a guideline file
        const { data: lenderData } = await supabase
          .from('lenders')
          .select('guideline_file_url')
          .eq('id', user.id)
          .single();
        
        if (lenderData?.guideline_file_url) {
          setFiles([{
            id: 'guideline',
            file_url: lenderData.guideline_file_url,
            file_type: 'guideline',
            created_at: new Date().toISOString(),
            extracted_summary: 'Lender guideline document'
          }]);
        } else {
          setFiles([]);
        }
        setLoading(false);
        return;
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

  const handleFileView = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
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

    const success = await deleteFile(fileToDelete);
    if (success) {
      setFiles(files.filter(f => f.id !== fileToDelete.id));
      setShowDeleteDialog(false);
      setFileToDelete(null);
    }
  };

  const getFileName = (file: FileData) => {
    if (file.file_type) return `${file.file_type} file`;
    try {
      const url = new URL(file.file_url);
      const fileName = url.pathname.split('/').pop();
      return fileName || 'Document';
    } catch {
      return 'Document';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
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
                  <div key={file.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">
                          {getFileName(file)}
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
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFileView(file.file_url)}
                        title="View file"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadFile(file.file_url, getFileName(file))}
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
        fileName={fileToDelete ? getFileName(fileToDelete) : undefined}
        loading={deleteLoading}
      />
    </>
  );
};

export default FileViewerModal;
