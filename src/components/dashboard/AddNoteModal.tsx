
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AddNoteModalProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteAdded: () => void;
}

const AddNoteModal = ({ user, open, onOpenChange, onNoteAdded }: AddNoteModalProps) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const handleAddNote = async () => {
    if (!note.trim()) {
      toast({
        title: "Error",
        description: "Note cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.from('admin_notes').insert({
        user_id: user.id,
        admin_id: currentUser?.id,
        note: note.trim()
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Note added successfully"
      });
      
      setNote('');
      onNoteAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Note for {user?.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Textarea 
            placeholder="Add your note here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={loading}>
              {loading ? 'Adding...' : 'Add Note'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoteModal;
