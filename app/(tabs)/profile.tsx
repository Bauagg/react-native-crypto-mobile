import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useManualRefetch } from '@/client/use-manual-refetch';
import { AuthGuard } from '@/components/auth-guard';
import { ErrorState, getErrorStateVariant } from '@/components/global/error-state';
import { AccountSection } from '@/components/profile/account-section';
import { DemoBalanceSection } from '@/components/profile/demo-balance-section';
import { ExchangeSection } from '@/components/profile/exchange-section';
import { palette } from '@/components/profile/palette';
import { ProfileHeader } from '@/components/profile/profile-header';
import { useProfile } from '@/components/profile/use-profile';

export default function ProfileScreen() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const insets = useSafeAreaInsets();
  const {
    profile,
    isLoading,
    isError,
    error,
    refetch,
    account,
    exchange,
    demoBalance,
    photo,
    logout,
  } = useProfile();

  // Tarik layar ke bawah (saat sudah di paling atas) untuk memuat ulang profil.
  const { refetch: refreshProfile, isRefreshing } = useManualRefetch(refetch);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color={palette.accent} />
      </View>
    );
  }

  if (isError || !profile) {
    const status = (error as (Error & { status?: number }) | null)?.status;
    const isNetworkError = error instanceof Error && error.message === 'Network Error';

    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorStateWrap}>
          <ErrorState
            variant={getErrorStateVariant(status, isNetworkError)}
            onRetry={() => refetch()}
          />
        </View>
        <Pressable style={styles.logoutButtonError} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color={palette.danger} />
          <Text style={styles.logoutButtonText}>Keluar dari Akun</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={20}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refreshProfile}
          tintColor={palette.accent}
          colors={[palette.accent]}
        />
      }>
      <ProfileHeader
        profile={profile}
        onChangePhoto={photo.pickAndUpload}
        isUploadingPhoto={photo.isUploading}
      />

      <View style={styles.body}>
        <AccountSection
          profile={profile}
          isEditing={account.isEditing}
          onStartEdit={account.startEdit}
          onCancelEdit={account.cancelEdit}
          onSubmit={account.submit}
          isSaving={account.isSaving}
          control={account.control}
          errors={account.errors}
        />

        <ExchangeSection
          profile={profile}
          isEditing={exchange.isEditing}
          onStartEdit={exchange.startEdit}
          onCancelEdit={exchange.cancelEdit}
          onSubmit={exchange.submit}
          isSaving={exchange.isSaving}
          control={exchange.control}
          errors={exchange.errors}
          isBotActive={exchange.isBotActive}
          isBotSaving={exchange.isBotSaving}
          onToggleBot={exchange.toggleBot}
        />

        <DemoBalanceSection
          profile={profile}
          isEditing={demoBalance.isEditing}
          onStartEdit={demoBalance.startEdit}
          onCancelEdit={demoBalance.cancelEdit}
          onSubmit={demoBalance.submit}
          isSaving={demoBalance.isSaving}
          control={demoBalance.control}
          errors={demoBalance.errors}
          isBotActive={demoBalance.isBotActive}
          isBotSaving={demoBalance.isBotSaving}
          onToggleBot={demoBalance.toggleBot}
        />

        <Pressable style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color={palette.danger} />
          <Text style={styles.logoutButtonText}>Keluar dari Akun</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: palette.surface,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  errorStateWrap: {
    flexShrink: 1,
  },
  body: {
    padding: 20,
    gap: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: palette.dangerSoft,
  },
  logoutButtonError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: palette.dangerSoft,
  },
  logoutButtonText: {
    color: palette.danger,
    fontSize: 15,
    fontWeight: '700',
  },
});
