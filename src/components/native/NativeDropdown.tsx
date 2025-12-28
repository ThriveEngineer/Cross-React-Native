import React, { useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, BorderRadius } from '../../constants/theme';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NativeDropdownProps {
  options: string[];
  selectedIndex: number;
  onSelectionChange: (index: number, value: string) => void;
  placeholder?: string;
}

interface ButtonLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const NativeDropdown: React.FC<NativeDropdownProps> = ({
  options,
  selectedIndex,
  onSelectionChange,
  placeholder = 'Select',
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [buttonLayout, setButtonLayout] = useState<ButtonLayout | null>(null);
  const buttonRef = useRef<View>(null);
  const selectedValue = options[selectedIndex] || placeholder;

  const handleSelect = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectionChange(index, options[index]);
    setShowPicker(false);
  };

  const handleOpenPicker = useCallback(() => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setButtonLayout({ x, y, width, height });
      setShowPicker(true);
    });
  }, []);

  // Calculate dropdown position
  const getDropdownStyle = () => {
    if (!buttonLayout) return {};

    const dropdownHeight = Math.min(options.length * 48 + 16, 250);
    const spaceBelow = SCREEN_HEIGHT - buttonLayout.y - buttonLayout.height - 20;
    const showAbove = spaceBelow < dropdownHeight && buttonLayout.y > dropdownHeight;

    return {
      position: 'absolute' as const,
      left: Math.max(16, buttonLayout.x - 50),
      minWidth: 180,
      ...(showAbove
        ? { bottom: SCREEN_HEIGHT - buttonLayout.y + 8 }
        : { top: buttonLayout.y + buttonLayout.height + 8 }
      ),
    };
  };

  // Custom dropdown that matches UI (works on both platforms)
  return (
    <>
      <Pressable
        ref={buttonRef}
        style={styles.dropdownButton}
        onPress={handleOpenPicker}
      >
        <Text style={styles.dropdownText}>{selectedValue}</Text>
        <Ionicons name="chevron-down" size={16} color={Colors.light.textSecondary} />
      </Pressable>

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowPicker(false)}
        >
          <View style={[styles.dropdownMenu, getDropdownStyle()]}>
            <ScrollView style={styles.scrollView} bounces={false}>
              {options.map((option, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.dropdownItem,
                    selectedIndex === index && styles.dropdownItemSelected,
                  ]}
                  onPress={() => handleSelect(index)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedIndex === index && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {selectedIndex === index && (
                    <Ionicons name="checkmark" size={18} color={Colors.light.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: BorderRadius.md,
  },
  dropdownText: {
    fontSize: FontSizes.sm,
    color: Colors.light.text,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  dropdownMenu: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollView: {
    paddingVertical: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(29, 29, 29, 0.05)',
  },
  dropdownItemText: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: Colors.light.primary,
  },
});
