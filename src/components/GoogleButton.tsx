import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space } from '../theme';

interface Props {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function GoogleButton({ onPress, loading, disabled }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Login with Google"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed, hovered }: any) => [
        styles.button,
        hovered && !isDisabled && styles.hovered,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <View style={styles.badge}>
          <Text style={styles.g}>G</Text>
        </View>
      )}
      <Text style={styles.label}>{loading ? 'Signing in…' : 'Login with Google'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space(3),
    paddingHorizontal: space(4),
  },
  hovered: { backgroundColor: '#F8FAFC' },
  pressed: { backgroundColor: '#F1F5F9' },
  disabled: { opacity: 0.6 },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  g: { color: '#fff', fontWeight: '800', fontSize: 13 },
  label: { fontSize: 15, fontWeight: '600', color: colors.text },
});
