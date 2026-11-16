import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';

// Second line of defence: even if this group were reached without a session,
// it redirects before rendering anything. Admin-only screens get their own guard.
export default function ProtectedLayout() {
  const { status, isAdmin } = useAuth();
  if (status !== 'signedIn') return <Redirect href="/login" />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="dashboard" />
      <Stack.Protected guard={isAdmin}>
        <Stack.Screen name="admin" />
      </Stack.Protected>
    </Stack>
  );
}
