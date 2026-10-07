import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { palette } from '@/components/home/palette';

import type { Timeframe } from './timeframes';

export function WebChart({ symbol, interval }: { symbol: string; interval: Timeframe }) {
  const chartBaseUrl = process.env.EXPO_PUBLIC_CHART_URL ?? '';
  const uri = useMemo(
    () => `${chartBaseUrl}?symbol=${symbol}&interval=${interval}`,
    [chartBaseUrl, symbol, interval]
  );

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={palette.accent} />
          </View>
        )}
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: palette.surface,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
});
