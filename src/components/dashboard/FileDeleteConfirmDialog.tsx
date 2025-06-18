import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FileDeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  fileName?: string;
  loading?: boolean;
}

const getBaseName = (fileName?: string) => {
  if (!fileName) return '';
  return fileName.split('/').pop() || fileName;
};

const FileDeleteConfirmDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  fileName,
  loading = false 
}: FileDeleteConfirmDialogProps) => {
  const baseName = getBaseName(fileName);
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete File</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete
            {baseName && (
              <span
                style={{
                  display: 'inline-block',
                  maxWidth: 240,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  verticalAlign: 'bottom',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  marginLeft: 4,
                  marginRight: 4,
                  color: '#374151',
                }}
                title={baseName}
              >
                "{baseName}"
              </span>
            )}?
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FileDeleteConfirmDialog;
