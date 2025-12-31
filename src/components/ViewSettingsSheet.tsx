import React, { useCallback, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  InteractionManager,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useShallow } from 'zustand/react/shallow';
import { useTaskStore } from '../store/taskStore';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { SortOption } from '../types/types';
import { NativeSwitch, NativeBottomSheet, NativeDropdown } from './native';
import { showM3SettingsSheet } from 'material3-expressive';
import { Icon, IconName } from './Icon';

interface ViewSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: IconName }[] = [
  { value: 'manual', label: 'Manual', icon: 'blend' },
  { value: 'name', label: 'Name', icon: 'text' },
  { value: 'date', label: 'Date', icon: 'calendar' },
  { value: 'folder', label: 'Folder', icon: 'folder' },
];

const ViewSettingsSheetComponent: React.FC<ViewSettingsSheetProps> = ({
  visible,
  onClose,
}) => {
  // Use selective subscription - only subscribe to view settings state
  const {
    showCompletedInToday,
    showFolderNames,
    sortOption,
    setShowCompletedInToday,
    setShowFolderNames,
    setSortOption,
  } = useTaskStore(
    useShallow(state => ({
      showCompletedInToday: state.showCompletedInToday,
      showFolderNames: state.showFolderNames,
      sortOption: state.sortOption,
      setShowCompletedInToday: state.setShowCompletedInToday,
      setShowFolderNames: state.setShowFolderNames,
      setSortOption: state.setSortOption,
    }))
  );

  // Use native Android sheet - defer to allow animations to complete first
  useEffect(() => {
    if (visible && Platform.OS === 'android') {
      // Wait for any ongoing animations/interactions to complete before showing native sheet
      const handle = InteractionManager.runAfterInteractions(() => {
        const currentSortIndex = SORT_OPTIONS.findIndex(o => o.value === sortOption);

        showM3SettingsSheet({
          title: '',
          toggles: [
            { id: 'completed', title: 'Completed tasks', icon: 'check', value: showCompletedInToday },
            { id: 'folders', title: 'Folder', icon: 'folder', value: showFolderNames },
          ],
          dropdowns: [
            { id: 'sort', title: 'Sort', icon: 'sort', options: SORT_OPTIONS.map(o => o.label), selectedIndex: currentSortIndex >= 0 ? currentSortIndex : 0 },
            { id: 'group', title: 'Group', icon: 'grid', options: ['None'], selectedIndex: 0 },
          ],
        }).then((result) => {
          if (!result.cancelled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (result.toggles) {
              if (result.toggles.completed !== undefined) {
                setShowCompletedInToday(result.toggles.completed);
              }
              if (result.toggles.folders !== undefined) {
                setShowFolderNames(result.toggles.folders);
              }
            }
            if (result.dropdowns?.sort !== undefined) {
              setSortOption(SORT_OPTIONS[result.dropdowns.sort].value);
            }
          }
          onClose();
        });
      });

      return () => handle.cancel();
    }
  }, [visible]);

  // iOS fallback
  if (Platform.OS === 'android') {
    return null;
  }

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

  const currentSortIndex = SORT_OPTIONS.findIndex(o => o.value === sortOption);

  return (
    <NativeBottomSheet visible={visible} onClose={onClose}>
      <View style={styles.cardsContainer}>
        {/* Toggles Card */}
        <View style={styles.settingsCard}>
        {/* Completed Tasks Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Icon name="tick-circle" size={22} color={Colors.light.text} variant="Bold" />
            <Text style={styles.settingLabel}>Completed tasks</Text>
          </View>
          <NativeSwitch
            value={showCompletedInToday}
            onValueChange={handleToggleCompleted}
          />
        </View>

        <View style={styles.divider} />

        {/* Folder Names Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Icon name="folder" size={22} color={Colors.light.text} variant="Bold" />
            <Text style={styles.settingLabel}>Folder</Text>
          </View>
          <NativeSwitch
            value={showFolderNames}
            onValueChange={handleToggleFolderNames}
          />
        </View>
      </View>

      {/* Sort Card */}
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Icon name="sort" size={22} color={Colors.light.text} variant="Bold" />
            <Text style={styles.settingLabel}>Sort</Text>
          </View>
          <NativeDropdown
            options={SORT_OPTIONS.map(o => o.label)}
            selectedIndex={currentSortIndex >= 0 ? currentSortIndex : 0}
            onSelectionChange={(index) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSortOption(SORT_OPTIONS[index].value);
            }}
          />
        </View>
      </View>

      {/* Group Card */}
      <View style={styles.settingsCard}>
        <View style={[styles.settingRow, styles.disabledRow]}>
          <View style={styles.settingLeft}>
            <Icon name="category" size={22} color={Colors.light.textSecondary} variant="Broken" />
            <Text style={[styles.settingLabel, styles.disabledText]}>Group</Text>
          </View>
          <View style={styles.dropdownButton}>
            <Text style={[styles.dropdownText, styles.disabledText]}>None</Text>
            <Icon name="chevron-down" size={16} color={Colors.light.textSecondary} />
          </View>
        </View>
      </View>
      </View>
    </NativeBottomSheet>
  );
};

const styles = StyleSheet.create({
  cardsContainer: {
    alignItems: 'center',
    width: '100%',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 25,
    width: 353,
    maxWidth: '100%',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  settingLabel: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#C2C2C2',
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
  disabledRow: {
    opacity: 0.5,
  },
  disabledText: {
    color: Colors.light.textSecondary,
  },
});

// Memoize the component to prevent unnecessary re-renders
export const ViewSettingsSheet = memo(ViewSettingsSheetComponent);
