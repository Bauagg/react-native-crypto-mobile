import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { palette } from './palette';

export type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences';
};

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: FormFieldProps) {
  const [isSecretVisible, setIsSecretVisible] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9AA3AC"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry && !isSecretVisible}
          style={[
            styles.input,
            secureTextEntry && styles.inputWithIcon,
            error ? styles.inputError : null,
          ]}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setIsSecretVisible((prev) => !prev)}
            style={styles.eyeButton}
            hitSlop={8}>
            <Ionicons
              name={isSecretVisible ? 'eye-off' : 'eye'}
              size={18}
              color={palette.subtle}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingVertical: 11,
    fontSize: 15,
    color: palette.ink,
    backgroundColor: palette.surface,
  },
  inputWrapper: {
    justifyContent: 'center',
  },
  inputWithIcon: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
  },
  inputError: {
    borderColor: palette.danger,
  },
  fieldError: {
    color: palette.danger,
    fontSize: 12,
    marginTop: 3,
  },
});
