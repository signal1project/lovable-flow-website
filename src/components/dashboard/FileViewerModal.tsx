
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
}

const FileViewerModal = ({ user, open, onOpenChange }: FileViewerModalProps) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  return (
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
                        {file.file_type || 'Document'}
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
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewerModal;
