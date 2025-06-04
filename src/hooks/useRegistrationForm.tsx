
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface RegistrationFormData {
  email: string;
  password: string;
  fullName: string;
  role: string;
  country: string;
  termsAccepted: boolean;
}

export const useRegistrationForm = () => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    password: '',
    fullName: '',
    role: '',
    country: '',
    termsAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateFormData = (field: keyof RegistrationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.fullName || !formData.role || !formData.country) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.termsAccepted) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    console.log('🚀 Starting signup process for:', formData.email, 'with role:', formData.role);
    
    try {
      // Step 1: Create user account with metadata
      const { error: signUpError } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        role: formData.role,
        country: formData.country,
      });

      if (signUpError) {
        console.error('❌ Signup failed:', signUpError);
        
        if (signUpError.message.includes('already registered')) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Failed",
            description: signUpError.message,
            variant: "destructive",
          });
        }
        return;
      }

      console.log('✅ User signup successful');
      
      // Step 2: Get the authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ Failed to get user after signup:', userError);
        throw new Error('Failed to authenticate after signup');
      }

      console.log('✅ Got authenticated user:', user.id);

      // Step 3: Create profile using upsert to avoid conflicts
      console.log('🔄 Creating profile using upsert for user:', user.id);
      
      const profileData = {
        id: user.id,
        full_name: formData.fullName,
        role: formData.role,
        country: formData.country,
      };

      console.log('📝 Profile data to upsert:', profileData);

      const { data: upsertedProfile, error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile upsert failed:', profileError);
        console.error('❌ Full error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        
        toast({
          title: "Profile Creation Failed",
          description: `Database error: ${profileError.message}. Code: ${profileError.code}`,
          variant: "destructive",
        });
        return;
      }

      if (!upsertedProfile) {
        console.error('❌ Profile upsert returned no data');
        toast({
          title: "Profile Creation Failed",
          description: "Profile was not created (no data returned)",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Profile created successfully:', upsertedProfile);

      toast({
        title: "Registration Successful",
        description: "Welcome to Signal1! Redirecting to your dashboard...",
      });

      // Step 4: Redirect to appropriate dashboard
      setTimeout(() => {
        const dashboardMap = {
          admin: '/dashboard/admin',
          lender: '/dashboard/lender',
          broker: '/dashboard/broker'
        };
        
        const targetDashboard = dashboardMap[formData.role as keyof typeof dashboardMap] || '/dashboard';
        console.log('🎯 Redirecting to:', targetDashboard);
        navigate(targetDashboard);
      }, 1000);

    } catch (error: any) {
      console.error('💥 Registration process failed:', error);
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      toast({
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    updateFormData,
    handleSubmit,
  };
};
