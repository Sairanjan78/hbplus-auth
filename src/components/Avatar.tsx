import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function Avatar({ name, email, photoURL, size = 44 }: { name?: string | null; email: string; photoURL?: string | null; size?: number }) {
  const initials = (name || email).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join('');
  const dims = { width: size, height: size, borderRadius: size / 2 };
  if (photoURL) return <Image source={{ uri: photoURL }} style={dims} accessibilityLabel={name ?? email} />;
  return (
    <View style={[styles.fallback, dims]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.primary, fontWeight: '700' },
});
