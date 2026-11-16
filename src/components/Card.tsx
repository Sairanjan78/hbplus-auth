import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, radius, shadow, space } from '../theme';

export function Card({ title, children, style }: { title?: string; children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {typeof value === 'string' ? <Text style={styles.value} numberOfLines={1}>{value}</Text> : value}
    </View>
  );
}

export function RoleBadge({ role }: { role: 'admin' | 'user' }) {
  const admin = role === 'admin';
  return (
    <View style={[styles.badge, { backgroundColor: admin ? colors.primarySoft : colors.successSoft }]}>
      <Text style={[styles.badgeText, { color: admin ? colors.primary : colors.success }]}>
        {admin ? 'Admin' : 'User'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space(5),
    gap: space(3),
    ...shadow,
  },
  title: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space(4) },
  label: { color: colors.muted, fontSize: 14 },
  value: { color: colors.text, fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '700' },
});
