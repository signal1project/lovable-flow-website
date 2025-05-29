
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

const LenderProfileCompletion = () => {
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

      // Create or update lender record
      const { error } = await supabase
        .from('lenders')
        .upsert({
          id: user.id,
          company_name: formData.companyName,
          specialization: formData.specialization,
          criteria_summary: formData.criteriaSummary,
          contact_info: formData.contactInfo,
          guideline_file_url: guidelineFileUrl,
        });

      if (error) throw error;

      toast({
        title: "Profile completed!",
        description: "Your lender profile has been completed successfully.",
      });

      navigate('/dashboard/lender');
    } catch (error: any) {
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
          <CardTitle className="text-2xl text-center">Complete Your Lender Profile</CardTitle>
          <p className="text-gray-600 text-center">Fill in the details to complete your profile</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                required
                placeholder="Enter your company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Lending Specialization *</Label>
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
              <div className="relative">
                <input
                  id="guidelineFile"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-center w-full h-12 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400">
                  <div className="flex items-center space-x-2">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {file ? file.name : 'Upload guideline file (PDF, DOC, DOCX)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/lender')}
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

export default LenderProfileCompletion;
