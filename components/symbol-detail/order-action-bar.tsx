import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '@/components/home/palette';

import type { OrderSide } from './order-modal';

export function OrderActionBar({ onPress }: { onPress: (side: OrderSide) => void }) {
  return (
    <View style={styles.container}>
      <Pressable style={[styles.button, styles.buyButton]} onPress={() => onPress('buy')}>
        <Ionicons name="trending-up" size={18} color="#fff" />
        <Text style={styles.buttonText}>Buy</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.sellButton]} onPress={() => onPress('sell')}>
        <Ionicons name="trending-down" size={18} color="#fff" />
        <Text style={styles.buttonText}>Sell</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  buyButton: {
    backgroundColor: palette.up,
  },
  sellButton: {
    backgroundColor: palette.down,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
