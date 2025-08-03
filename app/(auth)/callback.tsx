// this is the callback file for authentication
import { AdminLoadingScreen } from '../../src/components/ui/AdminLoadingScreen';

export default function AuthCallback() {
  // Just show loading and let the Root Layout handle navigation
  console.log('[AuthCallback] Waiting for authentication to complete');
  return <AdminLoadingScreen />;
}
