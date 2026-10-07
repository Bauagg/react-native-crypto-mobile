import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { palette } from '@/components/home/palette';

import { TIMEFRAMES, type Timeframe } from './timeframes';

export function TimeframeTabs({
  value,
  onChange,
}: {
  value: Timeframe;
  onChange: (timeframe: Timeframe) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {TIMEFRAMES.map((timeframe) => {
        const isActive = timeframe === value;
        return (
          <Pressable
            key={timeframe}
            onPress={() => onChange(timeframe)}
            style={[styles.tab, isActive && styles.tabActive]}>
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {timeframe.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  tabActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.subtle,
  },
  tabTextActive: {
    color: '#fff',
  },
});
