
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TermsCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const TermsCheckbox = ({ checked, onCheckedChange }: TermsCheckboxProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="terms"
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
      />
      <Label htmlFor="terms" className="text-sm">
        I agree to the{' '}
        <Link to="/terms" className="text-teal-600 hover:text-teal-500">
          Terms and Conditions
        </Link>
      </Label>
    </div>
  );
};
