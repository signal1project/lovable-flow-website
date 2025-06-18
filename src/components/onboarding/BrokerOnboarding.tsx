import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BrokerOnboarding = () => {
  const [formData, setFormData] = useState({
    agencyName: '',
    clientNotes: '',
    subscriptionTier: 'free',
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Create broker record with both id and profile_id
      const { error: brokerError } = await supabase
        .from('brokers')
        .insert({
          id: user.id, // Primary key
          profile_id: user.id, // For RLS policies
          agency_name: formData.agencyName,
          client_notes: formData.clientNotes,
          subscription_tier: formData.subscriptionTier,
        });

      if (brokerError) throw brokerError;

      // Upload files if provided
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('broker_files')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('broker_files')
            .getPublicUrl(fileName);

          // Create file record
          await supabase
            .from('broker_files')
            .insert({
              broker_id: user.id,
              file_url: publicUrl,
              file_type: file.type,
              extracted_summary: '', // Will be processed later
            });
        }
      }

      toast({
        title: "Onboarding complete!",
        description: "Your broker profile has been created successfully.",
      });

      navigate('/dashboard/broker');
    } catch (error: any) {
      console.error('❌ Broker onboarding error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('brokers')
        .upsert({
          id: user.id,
          profile_id: user.id,
          profile_completed: false,
        });
      if (error) throw error;
      toast({
        title: "Profile setup skipped",
        description: "You can complete your profile later from the dashboard.",
      });
      navigate('/dashboard/broker');
    } catch (error: any) {
      console.error('❌ Error skipping broker onboarding:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Broker Onboarding</CardTitle>
          <p className="text-gray-600 text-center">Complete your broker profile</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="agencyName">Agency Name</Label>
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

            <div className="space-y-2">
              <Label htmlFor="files">Upload Files (Optional)</Label>
              <Input
                id="files"
                type="file"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              />
              <p className="text-sm text-gray-500">
                Upload client files, credit reports, or other relevant documents
              </p>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
                disabled={loading}
              >
                Skip for Now
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Setting up profile..." : "Complete Setup"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrokerOnboarding;
