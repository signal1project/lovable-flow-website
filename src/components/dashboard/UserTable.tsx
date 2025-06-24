import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Plus, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UserData {
  id: string;
  full_name: string;
  role: string;
  country: string;
  created_at: string;
  lender_data?: any;
  broker_data?: any;
}

interface UserTableProps {
  users: UserData[];
  onUserClick: (user: UserData) => void;
  onAddNote: (user: UserData) => void;
  onViewFiles: (user: UserData) => void;
  onDeleteUser: (userId: string) => void;
  onNotesClick: (user: UserData) => void;
}

const UserTable = ({ users, onUserClick, onAddNote, onViewFiles, onDeleteUser, onNotesClick }: UserTableProps) => {
  const { toast } = useToast();
  const [modalUser, setModalUser] = useState<UserData | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<UserData | null>(null);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'lender':
        return 'secondary';
      case 'broker':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getProfileStatus = (user: UserData) => {
    if (user.role === 'admin') return { status: 'N/A', variant: 'default' as const };

    let isComplete = false;
    if (user.role === 'lender' && user.lender_data) {
      isComplete = !!user.lender_data.profile_completed;
    } else if (user.role === 'broker' && user.broker_data) {
      isComplete = !!user.broker_data.profile_completed;
    }

    return {
      status: isComplete ? 'Complete' : 'Incomplete',
      variant: isComplete ? 'default' as const : 'destructive' as const
    };
  };

  const handleCopyDeleteSQL = (user: UserData) => {
    const sql = `select delete_user_everywhere('${user.id}');`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(sql);
        toast({
          title: 'SQL Copied',
          description: `Delete SQL for ${user.full_name} copied to clipboard.`,
        });
      } else {
        window.prompt('Copy the SQL below:', sql);
      }
    } catch (err) {
      window.prompt('Copy the SQL below:', sql);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Profile Status</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const profileStatus = getProfileStatus(user);
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>
                  <Badge variant={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.country}</TableCell>
                <TableCell>
                  <Badge variant={profileStatus.variant}>
                    {profileStatus.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUserClick(user)}
                      title="View/Edit Profile"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewFiles(user)}
                      title="View Files"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNotesClick(user)}
                      title="View Notes"
                    >
                      📝
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setPendingDeleteUser(user)}
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {/* Modal for deletion options */}
      <Dialog open={!!modalUser} onOpenChange={() => setModalUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User: {modalUser?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              To fully delete a user, you must:
              <ol className="list-decimal ml-6 mt-2">
                <li>Delete the user from the Supabase <b>Auth Users</b> dashboard.</li>
                <li>Delete all their data from your app tables using the SQL below.</li>
              </ol>
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => {
                  window.open('https://app.supabase.com/project/_/auth/users', '_blank');
                }}
              >
                Go to Auth Users
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (modalUser) handleCopyDeleteSQL(modalUser);
                }}
              >
                Copy SQL to Delete Data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal for confirming deletion */}
      <Dialog open={!!pendingDeleteUser} onOpenChange={() => setPendingDeleteUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete <b>{pendingDeleteUser?.full_name}</b>? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setPendingDeleteUser(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (pendingDeleteUser) {
                    onDeleteUser(pendingDeleteUser.id);
                    setPendingDeleteUser(null);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserTable;
