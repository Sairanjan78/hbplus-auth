import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { listUsers, setUserRole, type AppUser, type Role } from '../../services/userService';
import { Avatar } from '../../components/Avatar';
import { RoleBadge } from '../../components/Card';
import { ErrorBanner } from '../../components/ErrorBanner';
import { colors, radius, space } from '../../theme';

// Admin-only (guarded in (protected)/_layout and by Firestore rules).
export default function AdminScreen() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await listUsers());
      setError(null);
    } catch {
      setError('Could not load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (u: AppUser) => {
    const next: Role = u.role === 'admin' ? 'user' : 'admin';
    setSavingId(u.uid);
    try {
      await setUserRole(u.uid, next);
      setUsers((list) => list.map((x) => (x.uid === u.uid ? { ...x, role: next } : x)));
    } catch {
      setError('Could not update role.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard'))} accessibilityRole="button">
            <Text style={styles.back}>← Dashboard</Text>
          </Pressable>
          <Text style={styles.title}>Users & roles</Text>
        </View>

        {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: space(10) }} />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(u) => u.uid}
            contentContainerStyle={{ gap: space(3), paddingBottom: space(10) }}
            renderItem={({ item }) => {
              const isMe = item.uid === me?.uid;
              return (
                <View style={styles.row}>
                  <Avatar name={item.displayName} email={item.email} photoURL={item.photoURL} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1}>{item.displayName ?? item.email}{isMe ? ' (you)' : ''}</Text>
                    <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                  </View>
                  <RoleBadge role={item.role} />
                  {!isMe ? (
                    <Pressable onPress={() => toggle(item)} disabled={savingId === item.uid} style={styles.action}>
                      {savingId === item.uid ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Text style={styles.actionText}>{item.role === 'admin' ? 'Make user' : 'Make admin'}</Text>
                      )}
                    </Pressable>
                  ) : null}
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, maxWidth: 800, width: '100%', alignSelf: 'center', padding: space(5), gap: space(4) },
  header: { gap: space(2) },
  back: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: space(3),
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: space(3),
  },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  email: { fontSize: 13, color: colors.muted },
  action: { paddingHorizontal: space(3), paddingVertical: space(2), borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, minWidth: 96, alignItems: 'center' },
  actionText: { fontSize: 13, fontWeight: '600', color: colors.primary },
});
