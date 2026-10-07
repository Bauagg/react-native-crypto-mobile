import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlert } from '@/components/global/alert-provider';
import { Colors } from '@/constants/theme';
import { AuthService } from '@/utils/auth/AuthService';

const tint = Colors.light.tint;

type LoginForm = {
  email: string;
  password: string;
};

const defaultValues: LoginForm = {
  email: '',
  password: '',
};

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { showSuccess, showError } = useAlert();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({ defaultValues });

  const mutation = useMutation({
    mutationFn: (data: LoginForm) => AuthService.login(data),
    onSuccess: (result) => {
      if (result.success) {
        showSuccess({ title: 'Berhasil', message: 'Selamat datang kembali' });
        router.replace('/(tabs)');
        return;
      }

      result.fieldErrors?.forEach((fieldError) => {
        if (fieldError.field in defaultValues) {
          setError(fieldError.field as keyof LoginForm, {
            type: 'server',
            message: fieldError.message,
          });
        }
      });

      showError({ title: 'Login Gagal', message: result.message ?? 'Terjadi kesalahan' });
    },
    onError: (error: Error) => {
      showError({ title: 'Login Gagal', message: error.message });
    },
  });

  const handleLogin = (data: LoginForm) => {
    mutation.mutate(data);
  };

  return (
    <KeyboardAwareScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={20}>
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/log-robot.png')}
          style={styles.logo}
          contentFit="contain"
        />

        <Text style={styles.title}>Masuk</Text>
        <Text style={styles.subtitle}>Masuk untuk lanjut pakai AlgoBot Pro</Text>

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
          name="password"
          rules={{ required: 'Password wajib diisi' }}
          render={({ field: { onChange, value } }) => (
            <FormField
              label="Password"
              value={value}
              onChangeText={onChange}
              placeholder="Password"
              secureTextEntry
              error={errors.password?.message}
            />
          )}
        />

        <Pressable
          style={[styles.submitButton, mutation.isPending && styles.disabled]}
          onPress={handleSubmit(handleLogin)}
          disabled={mutation.isPending}>
          <Text style={styles.submitButtonText}>
            {mutation.isPending ? 'Memproses...' : 'Masuk'}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push('/register')} style={styles.registerLink}>
          <Text style={styles.registerLinkText}>Belum punya akun? Daftar</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: FormFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#687076"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[
            styles.input,
            secureTextEntry && styles.inputWithIcon,
            { borderColor: error ? '#E5484D' : tint },
          ]}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            style={styles.eyeButton}
            hitSlop={8}>
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color="#687076"
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
    alignItems: 'stretch',
    backgroundColor: '#fff',
  },
  logo: {
    width: 96,
    height: 96,
    alignSelf: 'center',
    marginTop: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
    color: '#11181C',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#11181C',
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.7,
  },
  fieldContainer: {},
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#11181C',
  },
  inputWrapper: {
    justifyContent: 'center',
  },
  inputWithIcon: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
  },
  fieldError: {
    color: '#E5484D',
    fontSize: 13,
    marginTop: 3,
  },
  submitButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: tint,
  },
  disabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 8,
  },
  registerLinkText: {
    color: tint,
    fontSize: 16,
  },
});
