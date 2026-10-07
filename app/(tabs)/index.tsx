import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MarketSymbol, Recommendation } from '@/client/market/types';
import { AuthGuard } from '@/components/auth-guard';
import { ErrorState, getErrorStateVariant } from '@/components/global/error-state';
import { AssetTab } from '@/components/home/asset-tab';
import { HomeHeader } from '@/components/home/home-header';
import { MarketRegimeCard } from '@/components/home/market-regime-card';
import { palette } from '@/components/home/palette';
import { RecommendationCard } from '@/components/home/recommendation-card';
import { SearchBar } from '@/components/home/search-bar';
import { SymbolCard } from '@/components/home/symbol-card';
import { SymbolSkeleton } from '@/components/home/symbol-skeleton';
import { TabSwitcher, type HomeTab } from '@/components/home/tab-switcher';
import { useHome } from '@/components/home/use-home';

export default function HomeScreen() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}

function HomeContent() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<HomeTab>('all');
  const {
    profile,
    query,
    setQuery,
    symbols,
    total,
    isSymbolsLoading,
    isSymbolsError,
    symbolsError,
    refetchSymbols,
    isRefreshingSymbols,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    recommendationsData,
    recommendations,
    isRecommendationsLoading,
    isRecommendationsError,
    recommendationsError,
    refetchRecommendations,
    isRefreshingRecommendations,
  } = useHome({ liveEnabled: tab === 'all' });

  const goToSymbol = (symbol: string, photoUrl?: string | null) =>
    router.push({
      pathname: '/symbol/[symbol]',
      params: { symbol, photoUrl: photoUrl ?? undefined },
    });

  const marketCapSummary = total !== undefined ? `${total} pair dipantau` : undefined;

  const renderAllCoinHeader = () => (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>Pasar Kripto</Text>
      {marketCapSummary ? <Text style={styles.sectionMeta}>{marketCapSummary}</Text> : null}
    </View>
  );

  const renderRecommendationHeader = () => (
    <>
      {recommendationsData ? <MarketRegimeCard data={recommendationsData} /> : null}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Rekomendasi Hari Ini</Text>
        {recommendationsData ? (
          <Text style={styles.sectionMeta}>
            Top {recommendations.length} dari {recommendationsData.universe.count} coin
          </Text>
        ) : null}
      </View>
    </>
  );

  return (
    <View style={styles.flex}>
      <HomeHeader profile={profile} />

      <View style={styles.searchWrap}>
        <SearchBar value={query} onChangeText={setQuery} />
      </View>

      <View style={styles.tabWrap}>
        <TabSwitcher value={tab} onChange={setTab} recommendationCount={recommendations.length} />
      </View>

      {tab === 'asset' ? (
        <AssetTab onPressItem={goToSymbol} />
      ) : tab === 'all' ? (
        isSymbolsError && symbols.length === 0 ? (
          <ErrorState
            variant={getErrorStateVariant(
              (symbolsError as (Error & { status?: number }) | null)?.status,
              symbolsError instanceof Error && symbolsError.message === 'Network Error'
            )}
            onRetry={() => refetchSymbols()}
          />
        ) : (
          <FlatList<MarketSymbol>
            data={isSymbolsLoading ? [] : symbols}
            keyExtractor={(item) => item.symbol}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={renderAllCoinHeader}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshingSymbols}
                onRefresh={refetchSymbols}
                tintColor={palette.accent}
              />
            }
            renderItem={({ item }) => (
              <SymbolCard item={item} onPress={() => goToSymbol(item.symbol, item.photo_url)} />
            )}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator color={palette.accent} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              isSymbolsLoading ? (
                <View style={styles.skeletonWrap}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <SymbolSkeleton key={index} />
                  ))}
                </View>
              ) : query ? (
                <View style={styles.noResult}>
                  <Text style={styles.noResultText}>
                    Tidak ada koin yang cocok dengan &quot;{query}&quot;
                  </Text>
                </View>
              ) : null
            }
          />
        )
      ) : isRecommendationsError && recommendations.length === 0 ? (
        <ErrorState
          variant={getErrorStateVariant(
            (recommendationsError as (Error & { status?: number }) | null)?.status,
            recommendationsError instanceof Error && recommendationsError.message === 'Network Error'
          )}
          onRetry={() => refetchRecommendations()}
        />
      ) : (
        <FlatList<Recommendation>
          data={isRecommendationsLoading ? [] : recommendations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={renderRecommendationHeader}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshingRecommendations}
              onRefresh={refetchRecommendations}
              tintColor={palette.accent}
            />
          }
          renderItem={({ item }) => (
            <RecommendationCard item={item} onPress={() => goToSymbol(item.symbol, item.image_url)} />
          )}
          ListEmptyComponent={
            isRecommendationsLoading ? (
              <View style={styles.skeletonWrap}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <SymbolSkeleton key={index} />
                ))}
              </View>
            ) : (
              <View style={styles.noResult}>
                <Text style={styles.noResultText}>
                  Belum ada rekomendasi coin hari ini. Coba lagi nanti.
                </Text>
              </View>
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
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  searchWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  tabWrap: {
    paddingTop: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 16,
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
  noResult: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  noResultText: {
    fontSize: 13,
    color: palette.subtle,
    textAlign: 'center',
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
