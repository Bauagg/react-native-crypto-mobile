import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';

import { useAlert } from '@/components/global/alert-provider';
import { AuthService } from '@/utils/auth/AuthService';

import type { ExchangeForm } from './exchange-section';
import type { ProfileForm } from './account-section';
import type { DemoBalanceForm } from './demo-balance-section';

export function useProfile() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useAlert();

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await AuthService.getCurrentUser();
      if (!res.success || !res.data) {
        const err = new Error(res.message ?? 'Gagal mengambil profil') as Error & { status?: number };
        err.status = res.status;
        throw err;
      }
      return res.data;
    },
  });

  // --- Informasi akun ---
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  const accountForm = useForm<ProfileForm>({
    defaultValues: { full_name: '', email: '', phone: '' },
  });

  useEffect(() => {
    if (profile) {
      accountForm.reset({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
      });
    }
  }, [profile, accountForm]);

  const accountMutation = useMutation({
    mutationFn: (data: ProfileForm) => {
      const formData = new FormData();
      formData.append('full_name', data.full_name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      return AuthService.updateProfile(formData);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        setIsEditingAccount(false);
        showSuccess({ title: 'Berhasil', message: 'Profil berhasil diperbarui' });
        return;
      }

      result.fieldErrors?.forEach((fieldError) => {
        if (fieldError.field in { full_name: '', email: '', phone: '' }) {
          accountForm.setError(fieldError.field as keyof ProfileForm, {
            type: 'server',
            message: fieldError.message,
          });
        }
      });

      showError({ title: 'Gagal Menyimpan', message: result.message ?? 'Terjadi kesalahan' });
    },
    onError: (error: Error) => {
      showError({ title: 'Gagal Menyimpan', message: error.message });
    },
  });

  const submitAccount = accountForm.handleSubmit((data) => accountMutation.mutate(data));

  const cancelAccountEdit = () => {
    if (profile) {
      accountForm.reset({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
      });
    }
    setIsEditingAccount(false);
  };

  // --- Koneksi exchange ---
  const [isEditingExchange, setIsEditingExchange] = useState(false);

  const exchangeForm = useForm<ExchangeForm>({
    defaultValues: { platform: '', api_key: '', api_secret: '' },
  });

  useEffect(() => {
    if (profile) {
      exchangeForm.reset({
        platform: profile.platform ?? '',
        api_key: profile.api_key ?? '',
        api_secret: '',
      });
    }
  }, [profile, exchangeForm]);

  const exchangeMutation = useMutation({
    mutationFn: (data: ExchangeForm) => {
      const formData = new FormData();
      formData.append('platform', data.platform);
      formData.append('api_key', data.api_key);
      if (data.api_secret) {
        formData.append('api_secret', data.api_secret);
      }
      return AuthService.updateProfile(formData);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        setIsEditingExchange(false);
        showSuccess({ title: 'Berhasil', message: 'Koneksi exchange berhasil diperbarui' });
        return;
      }

      result.fieldErrors?.forEach((fieldError) => {
        if (fieldError.field in { platform: '', api_key: '', api_secret: '' }) {
          exchangeForm.setError(fieldError.field as keyof ExchangeForm, {
            type: 'server',
            message: fieldError.message,
          });
        }
      });

      showError({ title: 'Gagal Menyimpan', message: result.message ?? 'Terjadi kesalahan' });
    },
    onError: (error: Error) => {
      showError({ title: 'Gagal Menyimpan', message: error.message });
    },
  });

  const submitExchange = exchangeForm.handleSubmit((data) => exchangeMutation.mutate(data));

  const cancelExchangeEdit = () => {
    if (profile) {
      exchangeForm.reset({
        platform: profile.platform ?? '',
        api_key: profile.api_key ?? '',
        api_secret: '',
      });
    }
    setIsEditingExchange(false);
  };

  // --- Saldo demo ---
  const [isEditingDemoBalance, setIsEditingDemoBalance] = useState(false);

  const demoBalanceForm = useForm<DemoBalanceForm>({
    defaultValues: { demo_balance: '' },
  });

  useEffect(() => {
    if (profile) {
      demoBalanceForm.reset({ demo_balance: profile.demo_balance });
    }
  }, [profile, demoBalanceForm]);

  const demoBalanceMutation = useMutation({
    mutationFn: (data: DemoBalanceForm) => {
      const formData = new FormData();
      formData.append('demo_balance', data.demo_balance);
      return AuthService.updateProfile(formData);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        setIsEditingDemoBalance(false);
        showSuccess({ title: 'Berhasil', message: 'Saldo demo berhasil diperbarui' });
        return;
      }

      result.fieldErrors?.forEach((fieldError) => {
        if (fieldError.field in { demo_balance: '' }) {
          demoBalanceForm.setError(fieldError.field as keyof DemoBalanceForm, {
            type: 'server',
            message: fieldError.message,
          });
        }
      });

      showError({ title: 'Gagal Menyimpan', message: result.message ?? 'Terjadi kesalahan' });
    },
    onError: (error: Error) => {
      showError({ title: 'Gagal Menyimpan', message: error.message });
    },
  });

  const submitDemoBalance = demoBalanceForm.handleSubmit((data) =>
    demoBalanceMutation.mutate(data)
  );

  const cancelDemoBalanceEdit = () => {
    if (profile) {
      demoBalanceForm.reset({ demo_balance: profile.demo_balance });
    }
    setIsEditingDemoBalance(false);
  };

  // --- Robot auto-trading (demo & real) ---
  const demoBotMutation = useMutation({
    mutationFn: (value: boolean) => {
      const formData = new FormData();
      formData.append('is_robot_demo_active', String(value));
      return AuthService.updateProfile(formData);
    },
    onSuccess: (result, value) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        showSuccess({
          title: value ? 'Robot Demo Diaktifkan' : 'Robot Demo Dinonaktifkan',
          message: value
            ? 'Robot auto-trading akan mulai trading otomatis di akun demo.'
            : 'Robot auto-trading berhenti melakukan trading otomatis di akun demo.',
        });
        return;
      }
      showError({ title: 'Gagal Mengubah Robot', message: result.message ?? 'Terjadi kesalahan' });
    },
    onError: (error: Error) => {
      showError({ title: 'Gagal Mengubah Robot', message: error.message });
    },
  });

  const toggleDemoBot = (value: boolean) => demoBotMutation.mutate(value);

  const liveBotMutation = useMutation({
    mutationFn: (value: boolean) => {
      const formData = new FormData();
      formData.append('is_robot_platform_active', String(value));
      return AuthService.updateProfile(formData);
    },
    onSuccess: (result, value) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        showSuccess({
          title: value ? 'Robot Real Diaktifkan' : 'Robot Real Dinonaktifkan',
          message: value
            ? 'Robot auto-trading akan mulai trading otomatis di akun exchange asli.'
            : 'Robot auto-trading berhenti melakukan trading otomatis di akun exchange asli.',
        });
        return;
      }
      showError({ title: 'Gagal Mengubah Robot', message: result.message ?? 'Terjadi kesalahan' });
    },
    onError: (error: Error) => {
      showError({ title: 'Gagal Mengubah Robot', message: error.message });
    },
  });

  const toggleLiveBot = (value: boolean) => liveBotMutation.mutate(value);

  // --- Foto profil ---
  const photoMutation = useMutation({
    mutationFn: (asset: ImagePicker.ImagePickerAsset) => {
      const formData = new FormData();
      const fileName = asset.fileName ?? `photo-${Date.now()}.jpg`;
      const mimeType = asset.mimeType ?? 'image/jpeg';
      formData.append('photo', {
        uri: asset.uri,
        name: fileName,
        type: mimeType,
      } as unknown as Blob);
      return AuthService.updateProfile(formData);
    },
    onSuccess: async (result) => {
      if (result.success) {
        await queryClient.refetchQueries({ queryKey: ['profile'] });
        showSuccess({ title: 'Berhasil', message: 'Foto profil berhasil diperbarui' });
        return;
      }
      showError({ title: 'Gagal Mengubah Foto', message: result.message ?? 'Terjadi kesalahan' });
    },
    onError: (error: Error) => {
      showError({ title: 'Gagal Mengubah Foto', message: error.message });
    },
  });

  const pickAndUploadPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin Dibutuhkan', 'Aktifkan izin akses galeri untuk mengganti foto profil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    photoMutation.mutate(result.assets[0]);
  };

  // --- Logout ---
  const logout = () => {
    Alert.alert('Keluar dari Akun', 'Kamu perlu masuk kembali untuk mengakses AlgoBot Pro.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await AuthService.logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return {
    profile,
    isLoading,
    isError,
    error,
    refetch,

    account: {
      control: accountForm.control,
      errors: accountForm.formState.errors,
      isEditing: isEditingAccount,
      isSaving: accountMutation.isPending,
      startEdit: () => setIsEditingAccount(true),
      cancelEdit: cancelAccountEdit,
      submit: submitAccount,
    },

    exchange: {
      control: exchangeForm.control,
      errors: exchangeForm.formState.errors,
      isEditing: isEditingExchange,
      isSaving: exchangeMutation.isPending,
      startEdit: () => setIsEditingExchange(true),
      cancelEdit: cancelExchangeEdit,
      submit: submitExchange,
      isBotActive: profile?.is_robot_platform_active ?? false,
      isBotSaving: liveBotMutation.isPending,
      toggleBot: toggleLiveBot,
    },

    demoBalance: {
      control: demoBalanceForm.control,
      errors: demoBalanceForm.formState.errors,
      isEditing: isEditingDemoBalance,
      isSaving: demoBalanceMutation.isPending,
      startEdit: () => setIsEditingDemoBalance(true),
      cancelEdit: cancelDemoBalanceEdit,
      submit: submitDemoBalance,
      isBotActive: profile?.is_robot_demo_active ?? false,
      isBotSaving: demoBotMutation.isPending,
      toggleBot: toggleDemoBot,
    },

    photo: {
      isUploading: photoMutation.isPending,
      pickAndUpload: pickAndUploadPhoto,
    },

    logout,
  };
}
