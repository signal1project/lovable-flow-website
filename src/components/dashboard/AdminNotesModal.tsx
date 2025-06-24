import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface AdminNotesModalProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AdminNote {
  id: string;
  user_id: string;
  created_by: string;
  note: string;
  created_at: string;
}

const AdminNotesModal = ({ user, open, onOpenChange }: AdminNotesModalProps) => {
  const { user: currentAdmin } = useAuth();
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addValue, setAddValue] = useState('');

  const fetchNotes = async () => {
    if (!user?.id || !currentAdmin?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('created_by', currentAdmin.id)
      .order('created_at', { ascending: false });
    if (!error) {
      setNotes((data || []).map((note: any) => ({ user_id: user.id, ...note })));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchNotes();
    // eslint-disable-next-line
  }, [user, open, currentAdmin]);

  const handleEdit = (note: AdminNote) => {
    setEditingId(note.id);
    setEditValue(note.note);
  };

  const handleEditSave = async (note: AdminNote) => {
    if (!editValue.trim()) return;
    const { error } = await supabase
      .from('admin_notes')
      .update({ note: editValue })
      .eq('id', note.id);
    if (!error) {
      setEditingId(null);
      setEditValue('');
      fetchNotes();
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = async (note: AdminNote) => {
    setDeletingId(note.id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const { error } = await supabase
      .from('admin_notes')
      .delete()
      .eq('id', deletingId);
    if (!error) {
      setDeletingId(null);
      fetchNotes();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Admin Notes for {user?.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-100 rounded p-4 min-h-[100px]">
            {loading ? (
              <div className="text-center text-gray-500">Loading notes...</div>
            ) : notes.length === 0 ? (
              <div className="text-center text-gray-500">No notes found.</div>
            ) : (
              <ul className="space-y-2">
                {notes.map((note) => (
                  <li key={note.id} className="bg-white rounded p-2 shadow text-sm flex justify-between items-center gap-2">
                    {editingId === note.id ? (
                      <>
                        <Input
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="flex-1 mr-2"
                          autoFocus
                        />
                        <Button size="sm" variant="outline" onClick={() => handleEditSave(note)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleEditCancel}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1">{note.note}</span>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(note)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(note)}>
                          Delete
                        </Button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {adding ? (
            <div className="flex gap-2">
              <Input
                value={addValue}
                onChange={e => setAddValue(e.target.value)}
                placeholder="Enter note..."
                autoFocus
              />
              <Button
                variant="outline"
                onClick={async () => {
                  if (!addValue.trim() || !user?.id || !currentAdmin?.id) return;
                  const { error } = await supabase
                    .from('admin_notes')
                    .insert({
                      user_id: user.id,
                      created_by: currentAdmin.id,
                      note: addValue,
                    });
                  if (!error) {
                    setAddValue('');
                    setAdding(false);
                    fetchNotes();
                  }
                }}
              >
                Save
              </Button>
              <Button variant="outline" onClick={() => { setAdding(false); setAddValue(''); }}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button className="w-full" variant="outline" onClick={() => setAdding(true)}>
              + Add Note
            </Button>
          )}
        </div>
        {/* Delete confirmation dialog */}
        {deletingId && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded shadow p-6 w-full max-w-xs text-center">
              <p>Are you sure you want to delete this note?</p>
              <div className="flex gap-2 justify-center mt-4">
                <Button variant="outline" onClick={() => setDeletingId(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminNotesModal; 