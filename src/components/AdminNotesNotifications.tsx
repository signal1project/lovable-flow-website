import { useAdminNotes } from '@/hooks/useAdminNotes';
import { Bell } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from './ui/dialog';
import { Button } from './ui/button';

export function AdminNotesNotifications() {
  const { notes, loading, markAsRead } = useAdminNotes();
  const [open, setOpen] = useState(false);

  const unreadCount = notes.filter(n => !n.read).length;

  return (
    <>
      <Button
        variant="ghost"
        className="relative p-2 rounded-full hover:bg-teal-50 focus:outline-none"
        aria-label="Notifications"
        onClick={() => setOpen(true)}
        style={{ minWidth: 40, minHeight: 40 }}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold border border-white shadow">
            {unreadCount}
          </span>
        )}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md w-full p-0">
          <DialogHeader className="border-b px-6 py-4 flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Admin Notes</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : notes.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No admin notes.</div>
            ) : (
              <ul className="space-y-4">
                {notes.map(note => (
                  <li
                    key={note.id}
                    className={`rounded-lg p-4 border ${note.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'} cursor-pointer transition-shadow hover:shadow-md`}
                    onClick={() => { if (!note.read) markAsRead(note.id); }}
                  >
                    <div className="text-sm text-gray-800 mb-1">{note.note}</div>
                    <div className="text-xs text-gray-500 flex justify-between items-center">
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                      {!note.read && <span className="ml-2 text-blue-600 font-semibold">(new)</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 