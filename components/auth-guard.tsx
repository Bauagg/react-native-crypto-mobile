import { useFocusEffect, router } from 'expo-router';
import { type PropsWithChildren, useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { AuthService } from '@/utils/auth/AuthService';

export function AuthGuard({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<'checking' | 'authenticated'>('checking');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      AuthService.isAuthenticated().then((authenticated) => {
        if (!isActive) return;

        if (authenticated) {
          setStatus('authenticated');
        } else {
          router.replace('/login');
        }
      });

      return () => {
        isActive = false;
      };
    }, [])
  );

  if (status !== 'authenticated') {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return children;
}
