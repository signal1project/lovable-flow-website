
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { Upload, FileText, Building, Target, AlertCircle } from 'lucide-react';

interface LenderData {
  company_name?: string;
  specialization?: string;
  criteria_summary?: string;
  guideline_file_url?: string;
}

const LenderDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isComplete, loading: completionLoading } = useProfileCompletion();
  const [lenderData, setLenderData] = useState<LenderData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLenderData();
  }, [user]);

  const fetchLenderData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('lenders')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching lender data:', error);
      } else {
        setLenderData(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('lender_files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('lender_files')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('lenders')
        .upsert({
          id: user.id,
          guideline_file_url: publicUrl,
        });

      if (updateError) throw updateError;

      toast({
        title: "File uploaded successfully",
        description: "Your guideline file has been uploaded.",
      });

      fetchLenderData();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading || completionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {profile?.full_name}
          </h1>
          <p className="text-gray-600">Lender Dashboard</p>
        </div>

        {/* Profile Completion Alert */}
        {!isComplete && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-orange-800">Complete Your Profile</h3>
                  <p className="text-orange-700">
                    Complete your lender profile to unlock all features and start receiving matching requests.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/profile-completion')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Complete Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Company Info Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Company Information</CardTitle>
              <Building className="h-5 w-5 text-teal-600 ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Company:</strong> {lenderData?.company_name || 'Not set'}</p>
                <p><strong>Specialization:</strong> {lenderData?.specialization || 'Not set'}</p>
                <p><strong>Country:</strong> {profile?.country}</p>
              </div>
              {(!lenderData?.company_name || !lenderData?.specialization) && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/profile-completion')}
                >
                  Complete Profile
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Criteria Summary Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Lending Criteria</CardTitle>
              <Target className="h-5 w-5 text-teal-600 ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lenderData?.criteria_summary ? (
                  <p className="text-sm text-gray-700">{lenderData.criteria_summary}</p>
                ) : (
                  <p className="text-sm text-gray-500">No criteria summary available</p>
                )}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/profile-completion')}
              >
                Update Criteria
              </Button>
            </CardContent>
          </Card>

          {/* Guideline Files Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Guideline Files</CardTitle>
              <FileText className="h-5 w-5 text-teal-600 ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lenderData?.guideline_file_url ? (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Guideline File</span>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No guideline file uploaded</p>
                )}
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload New File'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matching Requests Card */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Recent Matching Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">No matching requests available</p>
                <p className="text-sm text-gray-400 mt-2">
                  Matching requests will appear here when brokers submit files that match your criteria
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LenderDashboard;
