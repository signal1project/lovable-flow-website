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

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
  'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Other'
];

const UserDetailModal = ({ user, open, onOpenChange, onUserUpdated }: UserDetailModalProps) => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    role: '',
    country: ''
  });
  const [roleSpecificData, setRoleSpecificData] = useState<any>({});
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
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      // Detect role change
      const oldRole = user.role;
      const newRole = profileData.role;

      // Update profile data
      console.log('user.id:', user.id);
      console.log('profileData:', profileData);
      const { error: profileError, data: profileUpdateData } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select();
      console.log('Profile update response:', profileUpdateData, 'Error:', profileError);
      if (profileError) throw profileError;

      // If role changed, remove from old role table
      if (oldRole !== newRole) {
        if (oldRole === 'lender') {
          const { error } = await supabase.from('lenders').delete().eq('id', user.id);
          if (error) throw error;
        } else if (oldRole === 'broker') {
          const { error } = await supabase.from('brokers').delete().eq('id', user.id);
          if (error) throw error;
        }
      }

      // Upsert into new role table if needed
      if (newRole === 'lender') {
        const lenderUpsert = {
          id: user.id,
          profile_id: user.id,
          company_name: roleSpecificData.company_name || '',
          specialization: roleSpecificData.specialization || '',
          criteria_summary: roleSpecificData.criteria_summary || '',
          contact_info: roleSpecificData.contact_info || '',
          profile_completed: false,
        };
        const { error } = await supabase
          .from('lenders')
          .upsert(lenderUpsert);
        if (error) throw error;
      } else if (newRole === 'broker') {
        const brokerUpsert = {
          id: user.id,
          profile_id: user.id,
          agency_name: roleSpecificData.agency_name || '',
          client_notes: roleSpecificData.client_notes || '',
          subscription_tier: roleSpecificData.subscription_tier || 'free',
          profile_completed: false,
        };
        const { error } = await supabase
          .from('brokers')
          .upsert(brokerUpsert);
        if (error) throw error;
      }

      // After successful profile update, if role is set to admin, call backend to update user_metadata.role
      if (newRole === 'admin') {
        try {
          const response = await fetch('http://localhost:4000/admin/set-user-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, role: 'admin' })
          });
          const result = await response.json();
          console.log('Backend role update result:', result);
        } catch (err) {
          console.error('Failed to update user_metadata.role to admin:', err);
        }
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
              onValueChange={(value) => {
                setProfileData({ ...profileData, role: value });
                setRoleSpecificData({}); // Reset role-specific data on role change
              }}
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
            <Select
              value={profileData.country || ''}
              onValueChange={(value) => setProfileData({ ...profileData, country: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((countryOption) => (
                  <SelectItem key={countryOption} value={countryOption}>
                    {countryOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <h3 className="text-lg font-semibold border-b pb-2 mt-4">Role Specific Information</h3>
          {renderRoleFields()}

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
