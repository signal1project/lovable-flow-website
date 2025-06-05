
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BrokerProfileCompletion = () => {
  const [formData, setFormData] = useState({
    agencyName: '',
    clientNotes: '',
    subscriptionTier: 'free',
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Create or update broker record with profile_id
      const { error } = await supabase
        .from('brokers')
        .upsert({
          profile_id: user.id, // Use profile_id instead of id
          agency_name: formData.agencyName,
          client_notes: formData.clientNotes,
          subscription_tier: formData.subscriptionTier,
        });

      if (error) throw error;

      toast({
        title: "Profile completed!",
        description: "Your broker profile has been completed successfully.",
      });

      navigate('/dashboard/broker');
    } catch (error: any) {
      console.error('❌ Broker profile completion error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Complete Your Broker Profile</CardTitle>
          <p className="text-gray-600 text-center">Fill in the details to complete your profile</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="agencyName">Agency Name *</Label>
              <Input
                id="agencyName"
                value={formData.agencyName}
                onChange={(e) => setFormData(prev => ({ ...prev, agencyName: e.target.value }))}
                required
                placeholder="Enter your agency name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientNotes">Client Notes</Label>
              <textarea
                id="clientNotes"
                className="w-full p-3 border rounded-md"
                rows={4}
                value={formData.clientNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, clientNotes: e.target.value }))}
                placeholder="Additional information about your clients or services"
              />
            </div>

            <div className="space-y-3">
              <Label>Subscription Tier</Label>
              <RadioGroup
                value={formData.subscriptionTier}
                onValueChange={(value) => setFormData(prev => ({ ...prev, subscriptionTier: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free">Free</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="premium" id="premium" />
                  <Label htmlFor="premium">Premium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="enterprise" id="enterprise" />
                  <Label htmlFor="enterprise">Enterprise</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/broker')}
                className="flex-1"
              >
                Skip for Now
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Saving..." : "Complete Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrokerProfileCompletion;
