
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRegistrationForm } from '@/hooks/useRegistrationForm';
import { GoogleSignInButton } from './GoogleSignInButton';
import { RegistrationFormFields } from './RegistrationFormFields';
import { TermsCheckbox } from './TermsCheckbox';

const RegisterForm = () => {
  const { formData, loading, updateFormData, handleSubmit } = useRegistrationForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Join Signal1</CardTitle>
          <CardDescription className="text-center">
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleSignInButton />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <RegistrationFormFields 
              formData={formData}
              onUpdateField={updateFormData}
            />

            <TermsCheckbox
              checked={formData.termsAccepted}
              onCheckedChange={(checked) => updateFormData('termsAccepted', checked)}
            />

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link
              to="/login"
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;
