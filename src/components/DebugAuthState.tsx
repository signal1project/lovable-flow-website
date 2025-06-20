import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchProfile, createProfile } from '@/utils/profileOperations';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';

const DebugAuthState = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [debugLog, setDebugLog] = useState<string>('');

  const handleDebug = async () => {
    let log = '';
    if (!user) {
      log += 'No user logged in.\n';
      setDebugLog(log);
      return;
    }
    log += `User ID: ${user.id}\n`;
    // Try to fetch profile
    const prof = await fetchProfile(user.id);
    if (prof) {
      log += `Profile found: ${JSON.stringify(prof, null, 2)}\n`;
    } else {
      log += 'Profile not found. Attempting to create...\n';
      try {
        const newProf = await createProfile(user, {
          full_name: user.user_metadata?.full_name || 'Debug User',
          role: user.user_metadata?.role || 'lender',
          country: user.user_metadata?.country || 'US',
        });
        log += `Profile created: ${JSON.stringify(newProf, null, 2)}\n`;
      } catch (err) {
        log += `Error creating profile: ${err?.message || err}\n`;
      }
    }
    setDebugLog(log);
  };

  const handleRefreshProfile = async () => {
    setDebugLog('Calling refreshProfile...');
    await refreshProfile();
    setDebugLog('refreshProfile called. Check if Profile updated above.');
  };

  return (
    <div style={{ background: '#fee', padding: 16, margin: 16, border: '1px solid #f00' }}>
      <h3>Debug Auth State</h3>
      <div>User: {user ? user.id : 'null'}</div>
      <div>Profile: {profile ? JSON.stringify(profile) : 'null'}</div>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <Button onClick={handleDebug}>Run Debug</Button>
      <Button onClick={handleRefreshProfile} style={{ marginLeft: 8 }}>Refresh Profile (App Logic)</Button>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{debugLog}</pre>
    </div>
  );
};

export default DebugAuthState;
