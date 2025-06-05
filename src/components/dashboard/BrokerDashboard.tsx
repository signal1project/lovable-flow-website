
import { useAuth } from '@/components/auth/AuthProvider';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { Upload, FileText, Building, Crown, AlertCircle } from 'lucide-react';

interface BrokerData {
  agency_name?: string;
  client_notes?: string;
  subscription_tier?: string;
}

interface BrokerFile {
  id: string;
  file_type?: string;
  file_url: string;
  extracted_summary?: string;
  created_at: string;
}

const BrokerDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isComplete, loading: completionLoading } = useProfileCompletion();
  const [brokerData, setBrokerData] = useState<BrokerData | null>(null);
  const [brokerFiles, setBrokerFiles] = useState<BrokerFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrokerData();
    fetchBrokerFiles();
  }, [user]);

  const fetchBrokerData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('brokers')
        .select('*')
        .eq('profile_id', user.id) // Use profile_id instead of id
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching broker data:', error);
      } else {
        setBrokerData(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrokerFiles = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('broker_files')
        .select('*')
        .eq('broker_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching broker files:', error);
      } else {
        setBrokerFiles(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
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
        .from('broker_files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('broker_files')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('broker_files')
        .insert({
          broker_id: user.id,
          file_url: publicUrl,
          file_type: fileExt,
        });

      if (insertError) throw insertError;

      toast({
        title: "File uploaded successfully",
        description: "Your client file has been uploaded.",
      });

      fetchBrokerFiles();
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
          <p className="text-gray-600">Broker Dashboard</p>
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
                    Complete your broker profile to unlock all features and start uploading client files.
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Agency Info Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Agency Information</CardTitle>
              <Building className="h-5 w-5 text-teal-600 ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Agency:</strong> {brokerData?.agency_name || 'Not set'}</p>
                <p><strong>Country:</strong> {profile?.country}</p>
                <p><strong>Client Notes:</strong> {brokerData?.client_notes || 'None'}</p>
              </div>
              {!brokerData?.agency_name && (
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

          {/* Subscription Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Subscription</CardTitle>
              <Crown className="h-5 w-5 text-teal-600 ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-lg font-semibold capitalize">
                  {brokerData?.subscription_tier || 'Free'} Plan
                </p>
                <p className="text-sm text-gray-600">
                  {brokerData?.subscription_tier === 'free' ? 
                    'Limited file uploads and matching' : 
                    'Full access to all features'
                  }
                </p>
              </div>
              {brokerData?.subscription_tier === 'free' && (
                <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700">
                  Upgrade Plan
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Upload Files Card */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Upload Client Files</CardTitle>
              <FileText className="h-5 w-5 text-teal-600 ml-auto" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Upload .3.4 files, credit reports, or other client documents
                </p>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".34,.pdf,.doc,.docx,.txt"
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
        </div>

        {/* Client Files Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Client Files</CardTitle>
          </CardHeader>
          <CardContent>
            {brokerFiles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Type</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brokerFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="capitalize">
                        {file.file_type || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {new Date(file.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {file.extracted_summary ? (
                          <span className="text-sm text-gray-700">
                            {file.extracted_summary.substring(0, 50)}...
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Processing...</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No client files uploaded yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Upload your first client file to get started with lender matching
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrokerDashboard;
