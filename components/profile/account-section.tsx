import { Control, Controller, FieldErrors } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import type { UserProfile } from '@/utils/auth/AuthService';

import { EditFormActions } from './edit-form-actions';
import { EditTrigger } from './edit-trigger';
import { FormField } from './form-field';
import { InfoRow } from './info-row';
import { SectionCard } from './section-card';

export type ProfileForm = {
  full_name: string;
  email: string;
  phone: string;
};

export function AccountSection({
  profile,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSubmit,
  isSaving,
  control,
  errors,
}: {
  profile: UserProfile;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSubmit: () => void;
  isSaving: boolean;
  control: Control<ProfileForm>;
  errors: FieldErrors<ProfileForm>;
}) {
  return (
    <SectionCard
      title="Informasi Akun"
      action={!isEditing ? <EditTrigger label="Ubah" onPress={onStartEdit} /> : undefined}>
      {isEditing ? (
        <View style={styles.editForm}>
          <Controller
            control={control}
            name="full_name"
            rules={{ required: 'Nama lengkap wajib diisi' }}
            render={({ field: { onChange, value } }) => (
              <FormField
                label="Nama Lengkap"
                value={value}
                onChangeText={onChange}
                placeholder="Budi Santoso"
                error={errors.full_name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            rules={{ required: 'Email wajib diisi' }}
            render={({ field: { onChange, value } }) => (
              <FormField
                label="Email"
                value={value}
                onChangeText={onChange}
                placeholder="budi@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            rules={{ required: 'Nomor telepon wajib diisi' }}
            render={({ field: { onChange, value } }) => (
              <FormField
                label="Nomor Telepon"
                value={value}
                onChangeText={onChange}
                placeholder="081234567890"
                keyboardType="phone-pad"
                error={errors.phone?.message}
              />
            )}
          />

          <EditFormActions onCancel={onCancelEdit} onSave={onSubmit} isSaving={isSaving} />
        </View>
      ) : (
        <View style={styles.infoList}>
          <InfoRow icon="mail-outline" label="Email" value={profile.email} />
          <InfoRow icon="call-outline" label="Nomor Telepon" value={profile.phone} />
          <InfoRow
            icon="shield-checkmark-outline"
            label="Peran"
            value={profile.role === 'admin' ? 'Administrator' : 'Pengguna'}
          />
        </View>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  editForm: {
    gap: 14,
  },
  infoList: {
    gap: 14,
  },
});
