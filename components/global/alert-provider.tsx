import { Ionicons } from '@expo/vector-icons';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AlertVariant = 'success' | 'error' | 'info';

type AlertOptions = {
  title: string;
  message?: string;
  duration?: number;
};

type AlertState = AlertOptions & {
  id: number;
  variant: AlertVariant;
};

type AlertContextValue = {
  showSuccess: (options: AlertOptions | string) => void;
  showError: (options: AlertOptions | string) => void;
  showInfo: (options: AlertOptions | string) => void;
};

const VARIANT_STYLE: Record<AlertVariant, { bg: string; iconBg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { bg: '#16A34A', iconBg: 'rgba(255,255,255,0.22)', icon: 'checkmark-circle' },
  error: { bg: '#DC2626', iconBg: 'rgba(255,255,255,0.22)', icon: 'close-circle' },
  info: { bg: '#2F6BFF', iconBg: 'rgba(255,255,255,0.22)', icon: 'information-circle' },
};

const AlertContext = createContext<AlertContextValue | null>(null);

function normalize(options: AlertOptions | string): AlertOptions {
  return typeof options === 'string' ? { title: options } : options;
}

export function AlertProvider({ children }: PropsWithChildren) {
  const [alert, setAlert] = useState<AlertState | null>(null);
  const insets = useSafeAreaInsets();
  // useState (bukan useRef) supaya nilai animasi aman dibaca saat render.
  const [anim] = useState(() => new Animated.Value(0));
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const dismiss = useCallback(() => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setAlert(null));
  }, [anim]);

  const push = useCallback(
    (variant: AlertVariant, options: AlertOptions | string) => {
      const { title, message, duration = 2800 } = normalize(options);

      if (hideTimer.current) clearTimeout(hideTimer.current);

      idRef.current += 1;
      setAlert({ id: idRef.current, variant, title, message });
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 9,
        tension: 80,
      }).start();

      hideTimer.current = setTimeout(dismiss, duration);
    },
    [anim, dismiss]
  );

  const value = useMemo<AlertContextValue>(
    () => ({
      showSuccess: (options) => push('success', options),
      showError: (options) => push('error', options),
      showInfo: (options) => push('info', options),
    }),
    [push]
  );

  const variantStyle = alert ? VARIANT_STYLE[alert.variant] : null;

  return (
    <AlertContext.Provider value={value}>
      {children}

      {alert && variantStyle ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.wrapper,
            { top: insets.top + 8 },
            {
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-24, 0],
                  }),
                },
              ],
            },
          ]}>
          <Pressable
            style={[styles.card, { backgroundColor: variantStyle.bg }]}
            onPress={dismiss}>
            <View style={[styles.iconWrap, { backgroundColor: variantStyle.iconBg }]}>
              <Ionicons name={variantStyle.icon} size={20} color="#fff" />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.title}>{alert.title}</Text>
              {alert.message ? <Text style={styles.message}>{alert.message}</Text> : null}
            </View>
          </Pressable>
        </Animated.View>
      ) : null}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert harus dipakai di dalam <AlertProvider>');
  }
  return ctx;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    lineHeight: 17,
  },
});
