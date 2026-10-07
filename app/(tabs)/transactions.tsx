import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useClosedTransactions } from '@/client/transactions/hooks';
import type {
  AccountMode,
  HistoryResultFilter,
  HistorySort,
  Position,
} from '@/client/transactions/types';
import { AuthGuard } from '@/components/auth-guard';
import { ErrorState, getErrorStateVariant } from '@/components/global/error-state';
import { ModeSwitch } from '@/components/global/mode-switch';
import { ScreenHeader } from '@/components/global/screen-header';
import { SelectDropdown } from '@/components/global/select-dropdown';
import { palette } from '@/components/home/palette';
import { SearchBar } from '@/components/home/search-bar';
import { SymbolSkeleton } from '@/components/home/symbol-skeleton';
import { HistoryEmpty } from '@/components/transactions/history-empty';
import { TransactionCard } from '@/components/transactions/transaction-card';

const SEARCH_DEBOUNCE_MS = 350;

const RESULT_OPTIONS: { value: HistoryResultFilter; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: 'PROFIT', label: 'Untung' },
  { value: 'LOSS', label: 'Rugi' },
];

const SORT_OPTIONS: { value: HistorySort; label: string }[] = [
  { value: 'NEWEST', label: 'Terbaru' },
  { value: 'OLDEST', label: 'Terlama' },
  { value: 'BEST', label: 'Untung terbesar' },
  { value: 'WORST', label: 'Rugi terbesar' },
];

export default function TransactionsScreen() {
  return (
    <AuthGuard>
      <TransactionsContent />
    </AuthGuard>
  );
}

function TransactionsContent() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AccountMode>('DEMO');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [result, setResult] = useState<HistoryResultFilter>('ALL');
  const [sort, setSort] = useState<HistorySort>('NEWEST');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    transactions,
    total,
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useClosedTransactions({ mode, search: debouncedSearch, result, sort });

  const isFiltered = debouncedSearch.length > 0 || result !== 'ALL';

  return (
    <View style={styles.flex}>
      <ScreenHeader
        title="Riwayat Transaksi"
        subtitle="Posisi yang sudah ditutup"
        icon="receipt-outline"
      />

      <View style={styles.controls}>
        <View style={styles.modeRow}>
          <ModeSwitch value={mode} onChange={setMode} />
          {total !== undefined ? <Text style={styles.count}>{total} transaksi</Text> : null}
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Cari simbol, mis. BTC" />
      </View>

      <View style={styles.dropdownRow}>
        <SelectDropdown
          label="Filter"
          icon="funnel-outline"
          value={result}
          options={RESULT_OPTIONS}
          onChange={setResult}
        />
        <SelectDropdown
          label="Urutkan"
          icon="swap-vertical-outline"
          value={sort}
          options={SORT_OPTIONS}
          onChange={setSort}
        />
      </View>

      {isError && transactions.length === 0 ? (
        <ErrorState
          variant={getErrorStateVariant(
            (error as (Error & { status?: number }) | null)?.status,
            error instanceof Error && error.message === 'Network Error'
          )}
          onRetry={() => refetch()}
        />
      ) : (
        <FlatList<Position>
          data={isLoading ? [] : transactions}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={palette.accent} />
          }
          renderItem={({ item }) => (
            <TransactionCard
              item={item}
              onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: item.id } })}
            />
          )}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color={palette.accent} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.skeletonWrap}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <SymbolSkeleton key={index} />
                ))}
              </View>
            ) : (
              <HistoryEmpty mode={mode} filtered={isFiltered} />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: palette.surface,
  },
  controls: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  count: {
    fontSize: 12,
    color: palette.subtle,
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  separator: {
    height: 5,
  },
  skeletonWrap: {
    gap: 5,
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
