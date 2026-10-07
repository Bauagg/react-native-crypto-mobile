import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { palette } from './palette';

export function BotToggleRow({
  icon,
  label,
  activeDescription,
  inactiveDescription,
  value,
  onValueChange,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  activeDescription: string;
  inactiveDescription: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={16} color={palette.accent} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{value ? activeDescription : inactiveDescription}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: palette.border, true: palette.accent }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EAF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.ink,
  },
  description: {
    fontSize: 12,
    color: palette.subtle,
    lineHeight: 16,
  },
});
