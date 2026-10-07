import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AlertProvider } from '@/components/global/alert-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AlertProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ title: 'Masuk' }} />
              <Stack.Screen name="register" options={{ title: 'Daftar' }} />
              <Stack.Screen name="symbol/[symbol]" options={{ headerShown: false }} />
              <Stack.Screen name="transaction/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="trading-plan/create" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </AlertProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
