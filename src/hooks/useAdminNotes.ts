import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AdminNote {
  id: string;
  note: string;
  created_by: string;
  user_id: string;
  created_at: string;
  read: boolean;
}

export function useAdminNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_notes')
      .select('id, note, created_by, user_id, created_at, read')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setNotes(data as AdminNote[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Mark a note as read
  const markAsRead = async (noteId: string) => {
    const { error } = await supabase
      .from('admin_notes')
      .update({ read: true })
      .eq('id', noteId)
      .select('id'); // select to avoid linter error
    if (!error) {
      setNotes((prev) => prev.map(n => n.id === noteId ? { ...n, read: true } : n));
    }
  };

  return { notes, loading, fetchNotes, markAsRead };
} 