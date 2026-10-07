import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState, getErrorStateVariant } from '@/components/global/error-state';
import { ModeSwitch } from '@/components/global/mode-switch';

import { AssetCard } from './asset-card';
import { AssetEmpty } from './asset-empty';
import { AssetSummaryCard } from './asset-summary';
import type { AccountMode } from '@/client/transactions/types';
import { palette } from './palette';
import { SymbolSkeleton } from './symbol-skeleton';
import { useAssets, type PositionView } from './use-assets';

export function AssetTab({
  onPressItem,
}: {
  onPressItem: (symbol: string, photoUrl?: string | null) => void;
}) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AccountMode>('DEMO');
  const { positions, summary, isLoading, isError, error, refetch, isRefreshing } = useAssets({
    mode,
  });

  const modeSwitch = (
    <View style={styles.modeWrap}>
      <ModeSwitch value={mode} onChange={setMode} />
    </View>
  );

  if (isError && positions.length === 0) {
    return (
      <View style={styles.flex}>
        <View style={styles.errorModeWrap}>{modeSwitch}</View>
        <ErrorState
          variant={getErrorStateVariant(
            (error as (Error & { status?: number }) | null)?.status,
            error instanceof Error && error.message === 'Network Error'
          )}
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  return (
    <FlatList<PositionView>
      data={isLoading ? [] : positions}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={
        <View>
          {modeSwitch}
          {!isLoading && positions.length > 0 ? <AssetSummaryCard summary={summary} /> : null}
          {!isLoading && positions.length > 0 ? (
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Posisi Terbuka</Text>
              <Text style={styles.sectionMeta}>{positions.length} coin</Text>
            </View>
          ) : null}
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={palette.accent} />
      }
      renderItem={({ item }) => (
        <AssetCard item={item} onPress={() => onPressItem(item.symbol, item.photo_url)} />
      )}
      ListEmptyComponent={
        isLoading ? (
          <View style={styles.skeletonWrap}>
            {Array.from({ length: 4 }).map((_, index) => (
              <SymbolSkeleton key={index} />
            ))}
          </View>
        ) : (
          <AssetEmpty mode={mode} />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  modeWrap: {
    marginTop: 12,
    marginBottom: 12,
  },
  errorModeWrap: {
    paddingHorizontal: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.ink,
  },
  sectionMeta: {
    fontSize: 12,
    color: palette.subtle,
  },
  separator: {
    height: 5,
  },
  skeletonWrap: {
    gap: 5,
  },
});
