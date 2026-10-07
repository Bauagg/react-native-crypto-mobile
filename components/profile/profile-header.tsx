import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { UserProfile } from '@/utils/auth/AuthService';

import { getInitials } from './get-initials';
import { palette } from './palette';
import { getStatusInfo } from './status-badge';

export function ProfileHeader({
  profile,
  onChangePhoto,
  isUploadingPhoto,
}: {
  profile: UserProfile;
  onChangePhoto: () => void;
  isUploadingPhoto: boolean;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        style={styles.avatarWrapper}
        onPress={onChangePhoto}
        disabled={isUploadingPhoto}
        hitSlop={8}>
        {profile.photo_url ? (
          <Image
            key={profile.photo_url}
            source={{ uri: profile.photo_url }}
            style={styles.avatar}
            contentFit="cover"
            cachePolicy="none"
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>{getInitials(profile.full_name)}</Text>
          </View>
        )}

        <View style={styles.cameraBadge}>
          {isUploadingPhoto ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="camera" size={14} color="#fff" />
          )}
        </View>
      </Pressable>
      <Text style={styles.headerName}>{profile.full_name}</Text>
      <View style={styles.roleBadge}>
        <View style={[styles.roleDot, { backgroundColor: getStatusInfo(profile.status).color }]} />
        <Text style={styles.roleBadgeText}>
          {profile.role === 'admin' ? 'Administrator' : getStatusInfo(profile.status).label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: palette.accentDeep,
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 10,
  },
  avatarWrapper: {
    padding: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  avatarPlaceholder: {
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: palette.accent,
    borderWidth: 2,
    borderColor: palette.accentDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.success,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: '#fff',
    textTransform: 'uppercase',
  },
});
