import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette } from '@/components/home/palette';

/** Header biru dengan sudut bawah membulat, gaya yang sama seperti header di Beranda. */
export function ScreenHeader({
  title,
  subtitle,
  icon,
  onBack,
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  /** Kalau diisi, muncul tombol kembali di kiri (untuk layar yang dibuka dari layar lain). */
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {onBack ? (
        <Pressable style={styles.iconWrap} onPress={onBack} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </Pressable>
      ) : null}

      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: palette.accentDeep,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  textWrap: {
    gap: 2,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
});
