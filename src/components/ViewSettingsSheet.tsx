import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTaskStore } from '../store/taskStore';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { SortOption } from '../types/types';

interface ViewSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'manual', label: 'Manual', icon: 'options-outline' },
  { value: 'name', label: 'Name', icon: 'text-outline' },
  { value: 'date', label: 'Date', icon: 'calendar-outline' },
  { value: 'folder', label: 'Folder', icon: 'folder-outline' },
];

export const ViewSettingsSheet: React.FC<ViewSettingsSheetProps> = ({
  visible,
  onClose,
}) => {
  const {
    showCompletedInToday,
    showFolderNames,
    sortOption,
    setShowCompletedInToday,
    setShowFolderNames,
    setSortOption,
  } = useTaskStore();

  const [sortMenuVisible, setSortMenuVisible] = React.useState(false);

  const handleToggleCompleted = useCallback(
    (value: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowCompletedInToday(value);
    },
    [setShowCompletedInToday]
  );

  const handleToggleFolderNames = useCallback(
    (value: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowFolderNames(value);
    },
    [setShowFolderNames]
  );

  const handleSortChange = useCallback(
    (option: SortOption) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSortOption(option);
      setSortMenuVisible(false);
    },
    [setSortOption]
  );

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortOption)?.label || 'Manual';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          <Text style={styles.title}>View Settings</Text>

          {/* Settings Container */}
          <View style={styles.settingsContainer}>
            {/* Completed Tasks Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="checkmark-circle" size={22} color={Colors.light.text} />
                <Text style={styles.settingLabel}>Completed tasks</Text>
              </View>
              <Switch
                value={showCompletedInToday}
                onValueChange={handleToggleCompleted}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.primary,
                }}
              />
            </View>

            <View style={styles.divider} />

            {/* Folder Names Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="folder" size={22} color={Colors.light.text} />
                <Text style={styles.settingLabel}>Folder</Text>
              </View>
              <Switch
                value={showFolderNames}
                onValueChange={handleToggleFolderNames}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.primary,
                }}
              />
            </View>

            <View style={styles.divider} />

            {/* Sort Option */}
            <Pressable
              style={styles.settingRow}
              onPress={() => setSortMenuVisible(!sortMenuVisible)}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="swap-vertical" size={22} color={Colors.light.text} />
                <Text style={styles.settingLabel}>Sort</Text>
              </View>
              <View style={styles.dropdownButton}>
                <Text style={styles.dropdownText}>{currentSortLabel}</Text>
                <Ionicons
                  name={sortMenuVisible ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={Colors.light.textSecondary}
                />
              </View>
            </Pressable>

            {/* Sort Options Dropdown */}
            {sortMenuVisible && (
              <View style={styles.sortOptions}>
                {SORT_OPTIONS.map(option => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.sortOption,
                      sortOption === option.value && styles.sortOptionSelected,
                    ]}
                    onPress={() => handleSortChange(option.value)}
                  >
                    <Ionicons
                      name={option.icon}
                      size={18}
                      color={
                        sortOption === option.value
                          ? Colors.light.primary
                          : Colors.light.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.sortOptionText,
                        sortOption === option.value && styles.sortOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {sortOption === option.value && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={Colors.light.primary}
                        style={styles.checkmark}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            )}

            <View style={styles.divider} />

            {/* Group Option (disabled/future feature) */}
            <View style={[styles.settingRow, styles.disabledRow]}>
              <View style={styles.settingLeft}>
                <Ionicons name="apps-outline" size={22} color={Colors.light.textSecondary} />
                <Text style={[styles.settingLabel, styles.disabledText]}>Group</Text>
              </View>
              <View style={styles.dropdownButton}>
                <Text style={[styles.dropdownText, styles.disabledText]}>None</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.light.textSecondary} />
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.light.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  settingsContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingLabel: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.light.border,
    marginLeft: 50,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dropdownText: {
    fontSize: FontSizes.md,
    color: Colors.light.textSecondary,
  },
  sortOptions: {
    backgroundColor: Colors.light.cardBackground,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  sortOptionSelected: {
    backgroundColor: 'rgba(29, 29, 29, 0.05)',
  },
  sortOptionText: {
    fontSize: FontSizes.sm,
    color: Colors.light.text,
    flex: 1,
  },
  sortOptionTextSelected: {
    fontWeight: '600',
    color: Colors.light.primary,
  },
  checkmark: {
    marginLeft: 'auto',
  },
  disabledRow: {
    opacity: 0.5,
  },
  disabledText: {
    color: Colors.light.textSecondary,
  },
});
