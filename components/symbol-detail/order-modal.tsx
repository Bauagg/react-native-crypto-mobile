import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette } from '@/components/home/palette';

export type OrderSide = 'buy' | 'sell';

export function OrderModal({
  visible,
  side,
  symbol,
  demoBalance,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  side: OrderSide;
  symbol: string;
  demoBalance: string;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const isBuy = side === 'buy';
  const balanceNumber = Number(demoBalance) || 0;

  // Kosongkan input tiap modal dibuka. Disesuaikan saat render (bukan di useEffect) sesuai anjuran React.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setAmount('');
  }

  const amountNumber = Number(amount);
  const isValid = amount.trim().length > 0 && Number.isFinite(amountNumber) && amountNumber > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.sheetInner, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetHandle} />

            <View style={styles.header}>
              <View
                style={[
                  styles.sideBadge,
                  { backgroundColor: isBuy ? palette.upSoft : palette.downSoft },
                ]}>
                <Ionicons
                  name={isBuy ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={isBuy ? palette.up : palette.down}
                />
                <Text
                  style={[styles.sideBadgeText, { color: isBuy ? palette.up : palette.down }]}>
                  {isBuy ? 'Buy' : 'Sell'}
                </Text>
              </View>
              <Text style={styles.symbol}>{symbol}</Text>
            </View>

            <Text style={styles.balanceLabel}>
              Saldo Demo: <Text style={styles.balanceValue}>${balanceNumber.toFixed(2)}</Text>
            </Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Jumlah (USD)</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#9AA3AC"
                keyboardType="decimal-pad"
                style={styles.input}
                autoFocus
              />
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Batal</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.confirmButton,
                  { backgroundColor: isBuy ? palette.up : palette.down },
                  !isValid && styles.disabled,
                ]}
                disabled={!isValid}
                onPress={() => onConfirm(amountNumber)}>
                <Text style={styles.confirmButtonText}>
                  Konfirmasi {isBuy ? 'Buy' : 'Sell'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 18, 32, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: palette.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetInner: {
    paddingTop: 10,
    paddingHorizontal: 20,
    gap: 14,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sideBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  symbol: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.ink,
  },
  balanceLabel: {
    fontSize: 13,
    color: palette.subtle,
  },
  balanceValue: {
    fontWeight: '700',
    color: palette.ink,
  },
  fieldContainer: {},
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.ink,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    color: palette.ink,
    backgroundColor: palette.surface,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: palette.border,
  },
  cancelButtonText: {
    color: palette.subtle,
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
