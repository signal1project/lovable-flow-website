
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const EmailVerificationBanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const [isResending, setIsResending] = useState(false);

  // Only show if user is not verified and banner is visible
  if (!user || user.email_confirmed_at || !isVisible) {
    return null;
  }

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to resend verification email",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email Sent",
          description: "Verification email has been resent to your inbox",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-yellow-400 mr-3" />
          <div className="flex-1">
            <p className="text-sm text-yellow-800">
              Please verify your email address to complete your account setup.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isResending}
            className="text-yellow-800 border-yellow-400 hover:bg-yellow-100"
          >
            {isResending ? 'Sending...' : 'Resend Email'}
          </Button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-yellow-400 hover:text-yellow-600 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
