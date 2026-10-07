import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';

export type HomeTab = 'all' | 'recommendation' | 'asset';

export function TabSwitcher({
  value,
  onChange,
  recommendationCount,
}: {
  value: HomeTab;
  onChange: (tab: HomeTab) => void;
  recommendationCount?: number;
}) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tab, value === 'all' && styles.tabActive]}
        onPress={() => onChange('all')}>
        <Text style={[styles.tabText, value === 'all' && styles.tabTextActive]}>All Coin</Text>
      </Pressable>
      <Pressable
        style={[styles.tab, value === 'recommendation' && styles.tabActive]}
        onPress={() => onChange('recommendation')}>
        <Text style={[styles.tabText, value === 'recommendation' && styles.tabTextActive]}>
          Top Pick
        </Text>
        {recommendationCount !== undefined ? (
          <View style={[styles.countBadge, value === 'recommendation' && styles.countBadgeActive]}>
            <Text
              style={[styles.countBadgeText, value === 'recommendation' && styles.countBadgeTextActive]}>
              {recommendationCount}
            </Text>
          </View>
        ) : null}
      </Pressable>
      <Pressable
        style={[styles.tab, value === 'asset' && styles.tabActive]}
        onPress={() => onChange('asset')}>
        <Text style={[styles.tabText, value === 'asset' && styles.tabTextActive]}>Asset</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  tabActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.subtle,
  },
  tabTextActive: {
    color: '#fff',
  },
  countBadge: {
    backgroundColor: 'rgba(47,107,255,0.15)',
    borderRadius: 999,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  countBadgeTextActive: {
    color: '#fff',
  },
});
