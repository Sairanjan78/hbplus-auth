import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

// Unknown URLs never show content: send people to the right starting point.
export default function NotFound() {
  const { status } = useAuth();
  return <Redirect href={status === 'signedIn' ? '/dashboard' : '/login'} />;
}
