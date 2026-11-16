import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

/**
 * Route protection lives here. Until Firebase restores (or rejects) a session
 * we render only a loader, so a protected screen never flashes. Afterwards
 * Stack.Protected removes routes whose guard is false: typing /dashboard into
 * the browser while signed out lands on /login, and /login while signed in
 * lands on the dashboard.
 */
function RootNavigator() {
  const { status } = useAuth();
  if (status === 'initializing') return <FullScreenLoader label="Checking your session…" />;

  const signedIn = status === 'signedIn';
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>
      <Stack.Screen name="index" />
    </Stack>
  );
}
