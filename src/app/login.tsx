import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { GoogleButton } from '../components/GoogleButton';
import { ErrorBanner } from '../components/ErrorBanner';
import { env } from '../config/env';
import { colors, radius, shadow, space } from '../theme';

export default function LoginScreen() {
  const { signIn, busy, error, clearError, ready } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.page, wide && styles.pageWide]} keyboardShouldPersistTaps="handled">
        {wide ? (
          <View style={styles.brandPanel}>
            <Logo size={48} light />
            <Text style={styles.brandTitle}>Your team's workspace,{'\n'}secured by Google.</Text>
            <Text style={styles.brandCopy}>
              One sign-in for everyone at {env.allowedDomain}. Accounts outside the organisation are turned away.
            </Text>
          </View>
        ) : null}

        <View style={[styles.card, wide && styles.cardWide]}>
          {!wide ? <Logo size={44} /> : null}
          <View style={{ gap: space(2) }}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in with your <Text style={styles.domain}>@{env.allowedDomain}</Text> Google account to continue.
            </Text>
          </View>

          {error ? <ErrorBanner message={error} onDismiss={clearError} /> : null}

          <GoogleButton onPress={signIn} loading={busy} disabled={!ready} />

          <Text style={styles.footnote}>
            Only official {env.allowedDomain} accounts can access this app.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Logo({ size, light }: { size: number; light?: boolean }) {
  return (
    <View style={[styles.logo, { width: size, height: size, borderRadius: size / 4 }, light && styles.logoLight]}>
      <Text style={[styles.logoText, { fontSize: size * 0.36 }, light && { color: colors.primary }]}>HB+</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  page: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: space(5) },
  pageWide: { flexDirection: 'row', gap: space(16), padding: space(10) },
  brandPanel: {
    maxWidth: 420,
    backgroundColor: colors.primary,
    borderRadius: radius.lg * 1.5,
    padding: space(10),
    gap: space(5),
    alignSelf: 'stretch',
    justifyContent: 'center',
    maxHeight: 520,
  },
  brandTitle: { color: '#fff', fontSize: 30, fontWeight: '800', lineHeight: 38 },
  brandCopy: { color: '#E0E7FF', fontSize: 16, lineHeight: 24 },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg * 1.5,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space(8),
    gap: space(6),
    ...shadow,
  },
  cardWide: { padding: space(10) },
  logo: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoLight: { backgroundColor: '#fff' },
  logoText: { color: '#fff', fontWeight: '800' },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.muted, lineHeight: 22 },
  domain: { color: colors.text, fontWeight: '700' },
  footnote: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 18 },
});
