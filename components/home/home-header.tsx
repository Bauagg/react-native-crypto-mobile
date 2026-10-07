import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getInitials } from '@/components/profile/get-initials';
import type { UserProfile } from '@/utils/auth/AuthService';

import { palette } from './palette';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

export function HomeHeader({ profile }: { profile?: UserProfile }) {
  const insets = useSafeAreaInsets();
  const firstName = profile?.full_name.trim().split(/\s+/)[0] ?? '';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Pressable style={styles.identity} onPress={() => router.push('/(tabs)/profile')}>
        {profile?.photo_url ? (
          <Image source={{ uri: profile.photo_url }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {profile ? getInitials(profile.full_name) : ''}
            </Text>
          </View>
        )}

        <View style={styles.textWrap}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {firstName || 'Trader'}
          </Text>
        </View>
      </Pressable>

      <Pressable style={styles.bellButton} hitSlop={8}>
        <Ionicons name="notifications-outline" size={20} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.accentDeep,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  textWrap: {
    gap: 1,
    flexShrink: 1,
  },
  greeting: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
});
