
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';

interface FileData {
  id: string;
  file_url: string;
  file_type?: string;
  created_at: string;
  extracted_summary?: string;
  broker_id?: string;
}

export const useFileOperations = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const deleteFile = async (file: FileData) => {
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "You must be logged in to delete files",
        variant: "destructive",
      });
      return false;
    }

    // Check permissions
    const canDelete = profile.role === 'admin' || 
                     (profile.role === 'broker' && file.broker_id === user.id);

    if (!canDelete) {
      toast({
        title: "Error",
        description: "You don't have permission to delete this file",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // Extract file path from URL for storage deletion
      const url = new URL(file.file_url);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = pathParts.slice(-2).join('/'); // Get folder/filename

      // Delete from database first
      const { error: dbError } = await supabase
        .from('broker_files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('broker-files')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion failed:', storageError);
        // Don't fail the entire operation if storage deletion fails
      }

      toast({
        title: "Success",
        description: "File deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const canDeleteFile = (file: FileData) => {
    if (!user || !profile) return false;
    return profile.role === 'admin' || 
           (profile.role === 'broker' && file.broker_id === user.id);
  };

  const downloadFile = (fileUrl: string, fileName?: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    deleteFile,
    canDeleteFile,
    downloadFile,
    loading
  };
};
