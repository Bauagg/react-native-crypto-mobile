import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';

export function EditFormActions({
  onCancel,
  onSave,
  isSaving,
  saveLabel = 'Simpan',
}: {
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  saveLabel?: string;
}) {
  return (
    <View style={styles.editActions}>
      <Pressable style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Batal</Text>
      </Pressable>
      <Pressable
        style={[styles.saveButton, isSaving && styles.disabled]}
        onPress={onSave}
        disabled={isSaving}>
        <Text style={styles.saveButtonText}>{isSaving ? 'Menyimpan...' : saveLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: palette.border,
  },
  cancelButtonText: {
    color: palette.subtle,
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: palette.accent,
  },
  disabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
