
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
