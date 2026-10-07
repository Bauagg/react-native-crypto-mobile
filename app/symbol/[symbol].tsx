import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlert } from '@/components/global/alert-provider';
import { formatIdrPrice, formatPercent, getBaseAsset, getQuoteAsset } from '@/components/home/format-price';
import { palette } from '@/components/home/palette';
import { IndicatorModal } from '@/components/symbol-detail/indicator-modal';
import { OrderActionBar } from '@/components/symbol-detail/order-action-bar';
import { OrderModal, type OrderSide } from '@/components/symbol-detail/order-modal';
import { TimeframeTabs } from '@/components/symbol-detail/timeframe-tabs';
import type { Timeframe } from '@/components/symbol-detail/timeframes';
import { TradingPlanModal, type TradingPlan } from '@/components/symbol-detail/trading-plan-modal';
import { useUserIndicators } from '@/components/symbol-detail/use-user-indicators';
import { WebChart } from '@/components/symbol-detail/web-chart';
import { AuthService } from '@/utils/auth/AuthService';

export default function SymbolDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    symbol: string;
    photoUrl?: string;
    lastPrice?: string;
    priceChangePercent?: string;
    newPlanName?: string;
    newPlanDailyLoss?: string;
    newPlanDailyProfit?: string;
    newPlanIndicators?: string;
    newPlanDescription?: string;
  }>();

  const symbol = params.symbol ?? '';
  const base = getBaseAsset(symbol);
  const quote = getQuoteAsset(symbol);
  const percent = params.priceChangePercent ? formatPercent(params.priceChangePercent) : null;

  const [timeframe, setTimeframe] = useState<Timeframe>('1h');
  const [orderSide, setOrderSide] = useState<OrderSide | null>(null);
  const [isIndicatorModalVisible, setIsIndicatorModalVisible] = useState(false);
  const [isPlanModalVisible, setIsPlanModalVisible] = useState(false);
  const [plans, setPlans] = useState<TradingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const { showSuccess } = useAlert();
  const { indicators: activeIndicators } = useUserIndicators();
  const activeIndicatorCount = activeIndicators.filter((item) => item.is_active).length;

  const handleGoToCreatePlan = () => {
    setIsPlanModalVisible(false);
    router.push({ pathname: '/trading-plan/create', params: { symbol } });
  };

  // Setelah kembali dari halaman "Buat Trading Plan" dengan plan baru terisi lewat param.
  const handledNewPlanRef = useRef<string | null>(null);
  useEffect(() => {
    if (!params.newPlanName) return;
    const key = `${params.newPlanName}-${params.newPlanDailyLoss ?? ''}-${params.newPlanDailyProfit ?? ''}`;
    if (handledNewPlanRef.current === key) return;
    handledNewPlanRef.current = key;

    const newPlan: TradingPlan = {
      id: Date.now().toString(),
      name: params.newPlanName,
      dailyLoss: Number(params.newPlanDailyLoss) || 0,
      dailyProfit: Number(params.newPlanDailyProfit) || 0,
      indicators: params.newPlanIndicators ? params.newPlanIndicators.split(',') : [],
      description: params.newPlanDescription ?? '',
    };
    setPlans((prev) => [newPlan, ...prev]);
    setSelectedPlanId(newPlan.id);
    showSuccess({
      title: 'Trading Plan Dibuat',
      message: `"${newPlan.name}" berhasil ditambahkan`,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.newPlanName,
    params.newPlanDailyLoss,
    params.newPlanDailyProfit,
    params.newPlanIndicators,
    params.newPlanDescription,
  ]);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await AuthService.getCurrentUser();
      if (!res.success || !res.data) throw new Error(res.message ?? 'Gagal mengambil profil');
      return res.data;
    },
  });

  const handleConfirmOrder = (amount: number) => {
    const sideLabel = orderSide === 'buy' ? 'Buy' : 'Sell';
    setOrderSide(null);
    showSuccess({
      title: `${sideLabel} Berhasil Dicatat`,
      message: `${sideLabel} ${base} senilai $${amount.toFixed(2)} (demo)`,
    });
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={palette.ink} />
        </Pressable>

        <View style={styles.identity}>
          {params.photoUrl ? (
            <Image source={{ uri: params.photoUrl }} style={styles.icon} contentFit="cover" />
          ) : (
            <View style={[styles.icon, styles.iconPlaceholder]}>
              <Text style={styles.iconPlaceholderText}>{base.slice(0, 1)}</Text>
            </View>
          )}
          <View>
            <Text style={styles.baseAsset}>
              {base}
              <Text style={styles.quoteAsset}>/{quote}</Text>
            </Text>
            {params.lastPrice ? (
              <View style={styles.priceRow}>
                <Text style={styles.lastPrice}>{formatIdrPrice(params.lastPrice)}</Text>
                {percent ? (
                  <Text style={[styles.percentText, { color: percent.isUp ? palette.up : palette.down }]}>
                    {percent.label}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.topBarActions}>
          <Pressable
            style={styles.iconButton}
            hitSlop={8}
            onPress={() => setIsIndicatorModalVisible(true)}>
            <Ionicons name="stats-chart-outline" size={20} color={palette.ink} />
            {activeIndicatorCount > 0 ? (
              <View style={styles.iconBadge}>
                <Text style={styles.iconBadgeText}>{activeIndicatorCount}</Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable
            style={styles.iconButton}
            hitSlop={8}
            onPress={() => setIsPlanModalVisible(true)}>
            <Ionicons name="document-text-outline" size={20} color={palette.ink} />
          </Pressable>
        </View>
      </View>

      <View style={styles.timeframeWrap}>
        <TimeframeTabs value={timeframe} onChange={setTimeframe} />
      </View>

      <View style={styles.chartArea}>
        <WebChart symbol={symbol} interval={timeframe} />
      </View>

      <View style={[styles.actionBarWrap, { paddingBottom: insets.bottom + 12 }]}>
        <OrderActionBar onPress={setOrderSide} />
      </View>

      <OrderModal
        visible={orderSide !== null}
        side={orderSide ?? 'buy'}
        symbol={symbol}
        demoBalance={profile?.demo_balance ?? '0'}
        onClose={() => setOrderSide(null)}
        onConfirm={handleConfirmOrder}
      />

      <IndicatorModal
        visible={isIndicatorModalVisible}
        onClose={() => setIsIndicatorModalVisible(false)}
      />

      <TradingPlanModal
        visible={isPlanModalVisible}
        plans={plans}
        selectedId={selectedPlanId}
        onSelect={(id) => {
          setSelectedPlanId(id);
          setIsPlanModalVisible(false);
        }}
        onCreate={handleGoToCreatePlan}
        onClose={() => setIsPlanModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: palette.surface,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  timeframeWrap: {
    paddingBottom: 12,
  },
  chartArea: {
    flex: 1,
  },
  actionBarWrap: {
    backgroundColor: palette.surface,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  iconBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  iconBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  iconPlaceholder: {
    backgroundColor: palette.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholderText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.subtle,
  },
  baseAsset: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.ink,
  },
  quoteAsset: {
    fontSize: 13,
    fontWeight: '500',
    color: palette.subtle,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  lastPrice: {
    fontSize: 13,
    color: palette.subtle,
    fontVariant: ['tabular-nums'],
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
