import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserDetailModalProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

const UserDetailModal = ({ user, open, onOpenChange, onUserUpdated }: UserDetailModalProps) => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    role: '',
    country: ''
  });
  const [roleSpecificData, setRoleSpecificData] = useState<any>({});
  const [notes, setNotes] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name,
        role: user.role,
        country: user.country
      });
      
      if (user.role === 'lender' && user.lender_data) {
        setRoleSpecificData(user.lender_data);
      } else if (user.role === 'broker' && user.broker_data) {
        setRoleSpecificData(user.broker_data);
      }
      
      fetchUserNotes();
    }
  }, [user]);

  const fetchUserNotes = async () => {
    try {
      // First get the notes
      const { data: notesData, error: notesError } = await supabase
        .from('admin_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (notesError) throw notesError;

      // Then get the creator profiles for each note
      const notesWithProfiles = await Promise.all(
        (notesData || []).map(async (note) => {
          if (note.created_by) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', note.created_by)
              .single();
            
            return {
              ...note,
              profiles: profile
            };
          }
          return {
            ...note,
            profiles: null
          };
        })
      );
      
      setNotes(notesWithProfiles);
    } catch (error) {
      console.error('Error fetching user notes:', error);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    
    try {
      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (profileError) throw profileError;

      // Update role-specific data
      if (profileData.role === 'lender') {
        const { error } = await supabase
          .from('lenders')
          .upsert({ 
            id: user.id,
            ...roleSpecificData 
          });
        if (error) throw error;
      } 
      else if (profileData.role === 'broker') {
        const { error } = await supabase
          .from('brokers')
          .upsert({ 
            id: user.id,
            ...roleSpecificData 
          });
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "User profile updated successfully"
      });
      
      onUserUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderRoleFields = () => {
    if (profileData.role === 'lender') {
      return (
        <>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={roleSpecificData.company_name || ''}
              onChange={(e) => setRoleSpecificData({ ...roleSpecificData, company_name: e.target.value })}
            />
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={roleSpecificData.specialization || ''}
              onChange={(e) => setRoleSpecificData({ ...roleSpecificData, specialization: e.target.value })}
            />
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="criteria_summary">Criteria Summary</Label>
            <Textarea
              id="criteria_summary"
              value={roleSpecificData.criteria_summary || ''}
              onChange={(e) => setRoleSpecificData({ ...roleSpecificData, criteria_summary: e.target.value })}
            />
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="contact_info">Contact Info</Label>
            <Input
              id="contact_info"
              value={roleSpecificData.contact_info || ''}
              onChange={(e) => setRoleSpecificData({ ...roleSpecificData, contact_info: e.target.value })}
            />
          </div>
        </>
      );
    } else if (profileData.role === 'broker') {
      return (
        <>
          <div className="grid w-full gap-1.5">
            <Label htmlFor="agency_name">Agency Name</Label>
            <Input
              id="agency_name"
              value={roleSpecificData.agency_name || ''}
              onChange={(e) => setRoleSpecificData({ ...roleSpecificData, agency_name: e.target.value })}
            />
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="client_notes">Client Notes</Label>
            <Textarea
              id="client_notes"
              value={roleSpecificData.client_notes || ''}
              onChange={(e) => setRoleSpecificData({ ...roleSpecificData, client_notes: e.target.value })}
            />
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="subscription_tier">Subscription Tier</Label>
            <Select
              value={roleSpecificData.subscription_tier || 'free'}
              onValueChange={(value) => setRoleSpecificData({ ...roleSpecificData, subscription_tier: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            User Details - {user?.full_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <h3 className="text-lg font-semibold border-b pb-2">Profile Information</h3>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profileData.full_name}
              onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
            />
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="role">Role</Label>
            <Select
              value={profileData.role}
              onValueChange={(value) => setProfileData({ ...profileData, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="lender">Lender</SelectItem>
                <SelectItem value="broker">Broker</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={profileData.country || ''}
              onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
            />
          </div>

          <h3 className="text-lg font-semibold border-b pb-2 mt-4">Role Specific Information</h3>
          {renderRoleFields()}

          {notes.length > 0 && (
            <>
              <h3 className="text-lg font-semibold border-b pb-2 mt-4">Admin Notes</h3>
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm">{note.note}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>By {note.profiles?.full_name || 'Unknown'}</span>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleProfileUpdate} disabled={loading}>
              {loading ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;
