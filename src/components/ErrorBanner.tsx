import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space } from '../theme';

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <View style={styles.box} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Text style={styles.text}>{message}</Text>
      {onDismiss ? (
        <Pressable onPress={onDismiss} accessibilityLabel="Dismiss error" hitSlop={8}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space(3),
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space(3),
  },
  text: { flex: 1, color: colors.danger, fontSize: 14, lineHeight: 20 },
  close: { color: colors.danger, fontSize: 14, fontWeight: '700' },
});
