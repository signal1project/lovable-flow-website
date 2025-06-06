
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
    
    const hasData = user.role === 'lender' ? user.lender_data : user.broker_data;
    return {
      status: hasData ? 'Complete' : 'Incomplete',
      variant: hasData ? 'default' as const : 'destructive' as const
    };
  };

  return (
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
          );
        })}
      </TableBody>
    </Table>
  );
};

export default UserTable;
