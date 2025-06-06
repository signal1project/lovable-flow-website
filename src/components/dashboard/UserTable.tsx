
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Plus, Trash2, FileText } from 'lucide-react';

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
}

const UserTable = ({ users, onUserClick, onAddNote, onViewFiles, onDeleteUser }: UserTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Profile Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.full_name}</TableCell>
            <TableCell>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>{user.country}</TableCell>
            <TableCell>
              {user.role === 'lender' && (
                <Badge variant={user.lender_data ? 'default' : 'destructive'}>
                  {user.lender_data ? 'Complete' : 'Incomplete'}
                </Badge>
              )}
              {user.role === 'broker' && (
                <Badge variant={user.broker_data ? 'default' : 'destructive'}>
                  {user.broker_data ? 'Complete' : 'Incomplete'}
                </Badge>
              )}
              {user.role === 'admin' && (
                <Badge variant="default">N/A</Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUserClick(user)}
                  title="View/Edit"
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
                  onClick={() => onAddNote(user)}
                  title="Add Note"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                {user.role !== 'admin' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDeleteUser(user.id)}
                    title="Delete User"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
