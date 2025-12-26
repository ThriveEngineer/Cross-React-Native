import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

// Note: @expo/ui requires a development build (npx expo prebuild)
// For Expo Go compatibility, we use a custom React Native Modal picker
// To enable native SwiftUI/Jetpack Picker, run a development build

export interface PickerOption {
  label: string;
  value: string;
}

interface NativePickerProps {
  options: PickerOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const NativePicker: React.FC<NativePickerProps> = ({
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select...',
}) => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const selectedOption = options.find(o => o.value === selectedValue);

  // Custom modal picker
  return (
    <>
      <Pressable
        style={styles.pickerButton}
        onPress={() => setPickerVisible(true)}
      >
        <Text style={styles.pickerButtonText}>
          {selectedOption?.label || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={Colors.light.textSecondary} />
      </Pressable>

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable
          style={styles.pickerOverlay}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select</Text>
              <Pressable onPress={() => setPickerVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.pickerScroll}>
              {options.map((option, index) => (
                <React.Fragment key={option.value}>
                  <Pressable
                    style={styles.pickerOption}
                    onPress={() => {
                      onValueChange(option.value);
                      setPickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        selectedValue === option.value && styles.pickerOptionSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {selectedValue === option.value && (
                      <Ionicons name="checkmark" size={20} color={Colors.light.primary} />
                    )}
                  </Pressable>
                  {index < options.length - 1 && <View style={styles.pickerDivider} />}
                </React.Fragment>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  pickerButtonText: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  pickerContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    width: '100%',
    maxHeight: 400,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.light.border,
  },
  pickerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.light.text,
  },
  pickerScroll: {
    maxHeight: 300,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  pickerOptionText: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  pickerOptionSelected: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  pickerDivider: {
    height: 0.5,
    backgroundColor: Colors.light.border,
    marginHorizontal: Spacing.md,
  },
});
