export interface Profile {
  id: string;
  full_name: string;
  role: string;
  country: string;
}

export interface UserData {
  full_name: string;
  role: string;
  country: string;
}

export interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: UserData) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export interface LenderData {
  id: string;
  profile_id: string;
  company_name: string;
  specialization: string;
  criteria_summary: string;
  contact_info: string;
  guideline_file_url: string;
  created_at: string;
  profile_completed: boolean;
}

export interface BrokerData {
  id: string;
  profile_id: string;
  agency_name: string;
  client_notes: string;
  subscription_tier: string;
  created_at: string;
  profile_completed: boolean;
}
