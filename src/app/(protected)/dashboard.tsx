import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/Avatar';
import { Card, Row, RoleBadge } from '../../components/Card';
import { env } from '../../config/env';
import { colors, radius, space } from '../../theme';

export default function Dashboard() {
  const { user, isAdmin, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const columns = width >= 1024 ? 3 : width >= 680 ? 2 : 1;
  if (!user) return null;

  const firstName = user.displayName?.split(' ')[0] ?? user.email.split('@')[0];
  const lastLogin = user.lastLoginAt?.toDate?.().toLocaleString() ?? 'Just now';
  const cardStyle = { flexBasis: columns === 1 ? '100%' : `${100 / columns - 2}%`, flexGrow: 1 } as const;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topbar}>
        <View style={styles.topbarInner}>
          <Text style={styles.brand}>HB+ Workspace</Text>
          <Pressable
            onPress={signOut}
            accessibilityRole="button"
            accessibilityLabel="Log out"
            style={({ pressed, hovered }: any) => [styles.logout, (pressed || hovered) && styles.logoutActive]}
          >
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inner}>
          <View style={styles.hero}>
            <Avatar name={user.displayName} email={user.email} photoURL={user.photoURL} size={56} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.hello}>Hi, {firstName}</Text>
              <Text style={styles.sub}>You're signed in to the {env.allowedDomain} workspace.</Text>
            </View>
            <RoleBadge role={user.role} />
          </View>

          <View style={styles.grid}>
            <Card title="Profile" style={cardStyle}>
              <Row label="Name" value={user.displayName ?? '—'} />
              <Row label="Email" value={user.email} />
              <Row label="Role" value={<RoleBadge role={user.role} />} />
            </Card>

            <Card title="Session" style={cardStyle}>
              <Row label="Provider" value="Google" />
              <Row label="Domain check" value={`Verified @${env.allowedDomain}`} />
              <Row label="Last login" value={lastLogin} />
            </Card>

            <Card title={isAdmin ? 'Administration' : 'Access'} style={cardStyle}>
              {isAdmin ? (
                <>
                  <Text style={styles.body}>Manage who has Admin rights in the workspace.</Text>
                  <Link href="/admin" asChild>
                    <Pressable style={styles.primaryBtn} accessibilityRole="link">
                      <Text style={styles.primaryBtnText}>Open admin panel</Text>
                    </Pressable>
                  </Link>
                </>
              ) : (
                <Text style={styles.body}>
                  You have standard User access. Ask an admin if you need elevated permissions.
                </Text>
              )}
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topbar: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  topbarInner: {
    maxWidth: 1080, width: '100%', alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space(5), paddingVertical: space(3),
  },
  brand: { fontSize: 17, fontWeight: '800', color: colors.primary },
  logout: { paddingHorizontal: space(4), paddingVertical: space(2), borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  logoutActive: { backgroundColor: '#F1F5F9' },
  logoutText: { fontSize: 14, fontWeight: '600', color: colors.text },
  content: { padding: space(5) },
  inner: { maxWidth: 1080, width: '100%', alignSelf: 'center', gap: space(6) },
  hero: { flexDirection: 'row', alignItems: 'center', gap: space(4), flexWrap: 'wrap' },
  hello: { fontSize: 26, fontWeight: '800', color: colors.text },
  sub: { fontSize: 15, color: colors.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(4) },
  body: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: space(3), alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
