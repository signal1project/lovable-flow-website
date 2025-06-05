
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const LenderOnboarding = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    specialization: '',
    criteriaSummary: '',
    contactInfo: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      let guidelineFileUrl = '';

      // Upload file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('lender_files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('lender_files')
          .getPublicUrl(fileName);

        guidelineFileUrl = publicUrl;
      }

      // Create lender record with profile_id
      const { error } = await supabase
        .from('lenders')
        .insert({
          profile_id: user.id, // Use profile_id instead of id
          company_name: formData.companyName,
          specialization: formData.specialization,
          criteria_summary: formData.criteriaSummary,
          contact_info: formData.contactInfo,
          guideline_file_url: guidelineFileUrl,
        });

      if (error) throw error;

      toast({
        title: "Onboarding complete!",
        description: "Your lender profile has been created successfully.",
      });

      navigate('/dashboard/lender');
    } catch (error: any) {
      console.error('❌ Lender onboarding error:', error);
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
          <CardTitle className="text-2xl text-center">Lender Onboarding</CardTitle>
          <p className="text-gray-600 text-center">Complete your lender profile</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                required
                placeholder="Enter your company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Lending Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                required
                placeholder="e.g., Commercial Real Estate, Residential Mortgages"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information</Label>
              <Input
                id="contactInfo"
                value={formData.contactInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                required
                placeholder="Phone number or email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="criteriaSummary">Criteria Summary</Label>
              <textarea
                id="criteriaSummary"
                className="w-full p-3 border rounded-md"
                rows={4}
                value={formData.criteriaSummary}
                onChange={(e) => setFormData(prev => ({ ...prev, criteriaSummary: e.target.value }))}
                placeholder="Describe your lending criteria and requirements"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guidelineFile">Guideline File (Optional)</Label>
              <Input
                id="guidelineFile"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx"
              />
              <p className="text-sm text-gray-500">Upload your lending guidelines (PDF, DOC, DOCX)</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Setting up profile..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LenderOnboarding;
