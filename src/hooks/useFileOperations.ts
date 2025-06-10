import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";

interface FileData {
  id: string;
  file_url: string;
  file_url_path?: string;
  file_name?: string;
  file_type?: string;
  created_at: string;
  extracted_summary?: string;
  broker_id?: string;
  lender_id?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/jpeg',
  'image/png'
];

export const useFileOperations = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const sanitizeFileName = (fileName: string): string => {
    // Remove any path components and special characters
    const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    // Ensure unique filename by adding timestamp
    const timestamp = new Date().getTime();
    const extension = sanitized.split('.').pop();
    const nameWithoutExt = sanitized.slice(0, -(extension?.length || 0) - 1);
    return `${nameWithoutExt}_${timestamp}.${extension}`;
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `File type ${file.type} is not allowed. Allowed types: PDF, Word, Excel, Text, Images`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    return null;
  };

  async function deleteFile(file: FileData) {
    setLoading(true);
    try {
      if (!file.file_url_path) {
        throw new Error("File path missing for deletion");
      }

      const bucket = file.broker_id ? "broker_files" : "lender_files";
      const table = file.broker_id ? "broker_files" : "lender_files";

      // Remove from storage
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([file.file_url_path]);

      if (storageError) {
        console.error("Storage deletion error:", storageError);
        throw new Error("Failed to delete file from storage");
      }

      // Remove DB record
      const { error: dbError } = await supabase
        .from(table)
        .delete()
        .eq("id", file.id);

      if (dbError) {
        console.error("Database deletion error:", dbError);
        throw new Error("Failed to delete file record from database");
      }

      toast({
        title: "Success",
        description: "File deleted successfully",
      });

      return true;
    } catch (error: any) {
      console.error("Delete file error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function uploadUserFile({
    bucket,
    tableName,
    userId,
    file,
    folder = "",
  }: {
    bucket: "broker_files" | "lender_files";
    tableName: "broker_files" | "lender_files";
    userId: string;
    file: File;
    folder?: string;
  }) {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      throw new Error("User not authenticated");
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      throw new Error(validationError);
    }

    setLoading(true);
    try {
      const sanitizedFileName = sanitizeFileName(file.name);
      const path = folder ? `${folder}/${sanitizedFileName}` : sanitizedFileName;

      // 1. Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to upload file to storage");
      }

      // 2. Insert metadata record into DB
      const { error: dbError } = await supabase
        .from(tableName)
        .insert({
          [bucket === "broker_files" ? "broker_id" : "lender_id"]: userId,
          file_url: uploadData.path,
          file_url_path: uploadData.path,
          file_name: sanitizedFileName,
          file_type: file.type,
          created_at: new Date().toISOString(),
        });

      if (dbError) {
        // Cleanup uploaded file on failure
        await supabase.storage.from(bucket).remove([uploadData.path]);
        console.error("Database error:", dbError);
        throw new Error("Failed to save file metadata to database");
      }

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      return uploadData.path;
    } catch (error: any) {
      console.error("Upload file error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const canDeleteFile = (file: FileData) => {
    if (!user || !profile) return false;
    return (
      profile.role === "admin" ||
      (profile.role === "broker" && file.broker_id === user.id) ||
      (profile.role === "lender" && file.lender_id === user.id)
    );
  };

  const downloadFile = async (fileUrl: string, fileName?: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(fileUrl.split('/')[0])
        .download(fileUrl.split('/').slice(1).join('/'));

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  return {
    deleteFile,
    uploadUserFile,
    canDeleteFile,
    downloadFile,
    loading,
  };
};
