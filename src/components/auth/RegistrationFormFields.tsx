
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RegistrationFormData } from '@/hooks/useRegistrationForm';

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
  'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Other'
];

interface RegistrationFormFieldsProps {
  formData: RegistrationFormData;
  onUpdateField: (field: keyof RegistrationFormData, value: string) => void;
}

export const RegistrationFormFields = ({ formData, onUpdateField }: RegistrationFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={(e) => onUpdateField('fullName', e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => onUpdateField('email', e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={(e) => onUpdateField('password', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => onUpdateField('role', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lender">Lender</SelectItem>
            <SelectItem value="broker">Broker</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select value={formData.country} onValueChange={(value) => onUpdateField('country', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your country" />
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
    </>
  );
};
