import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { palette } from './palette';

export function EditTrigger({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.editTrigger}>
      <Ionicons name="pencil" size={14} color={palette.accent} />
      <Text style={styles.editTriggerText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  editTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editTriggerText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.accent,
  },
});
