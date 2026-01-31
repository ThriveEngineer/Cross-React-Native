import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTaskStore } from '../store/taskStore';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { NativeBottomSheet } from './native';
import { showM3SelectionSheet, isNativeSheetsAvailable } from 'material3-expressive';
import { Icon, FOLDER_ICON_MAP, MATERIAL_ICON_MAP, IconName } from './Icon';

interface MoveToFolderSheetProps {
  visible: boolean;
  onClose: () => void;
  taskIds: string[];
  onMoveComplete?: () => void;
}

export const MoveToFolderSheet: React.FC<MoveToFolderSheetProps> = ({
  visible,
  onClose,
  taskIds,
  onMoveComplete,
}) => {
  const { folders, moveTasksToFolder, clearSelection } = useTaskStore();

  // Filter out Completed folder for move options
  const availableFolders = folders.filter(f => f.name !== 'Completed');

  // Use native sheet if available
  useEffect(() => {
    if (visible && isNativeSheetsAvailable) {
      showM3SelectionSheet({
        title: 'Move to folder',
        subtitle: `${taskIds.length} task${taskIds.length !== 1 ? 's' : ''} selected`,
        items: availableFolders.map(folder => ({
          id: folder.id,
          title: folder.name,
          icon: MATERIAL_ICON_MAP[folder.icon] || 'folder',
        })),
      }).then((result) => {
        if (!result.cancelled && result.selectedTitle) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          moveTasksToFolder(taskIds, result.selectedTitle);
          clearSelection();
          onMoveComplete?.();
        }
        onClose();
      });
    }
  }, [visible]);

  // If native sheets available, render nothing (sheet is shown imperatively)
  if (isNativeSheetsAvailable) {
    return null;
  }

  // Fallback to React Native bottom sheet
  const handleFolderSelect = useCallback((folderName: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    moveTasksToFolder(taskIds, folderName);
    clearSelection();
    onClose();
    onMoveComplete?.();
  }, [taskIds, moveTasksToFolder, clearSelection, onClose, onMoveComplete]);

  return (
    <NativeBottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>Move to folder</Text>
      <Text style={styles.subtitle}>
        {taskIds.length} task{taskIds.length !== 1 ? 's' : ''} selected
      </Text>

      <ScrollView
        style={styles.folderList}
        showsVerticalScrollIndicator={false}
      >
        {availableFolders.map((folder) => {
          const iconName: IconName = FOLDER_ICON_MAP[folder.icon] || 'folder';
          return (
            <Pressable
              key={folder.id}
              style={styles.folderRow}
              onPress={() => handleFolderSelect(folder.name)}
            >
              <Icon name={iconName} size={24} color={Colors.light.text} />
              <Text style={styles.folderName}>{folder.name}</Text>
              <View style={styles.spacer} />
              <Icon name="chevron-forward" size={20} color={Colors.light.textSecondary} />
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable style={styles.cancelButton} onPress={onClose}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
    </NativeBottomSheet>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  folderList: {
    maxHeight: 300,
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  folderName: {
    fontSize: FontSizes.md,
    color: Colors.light.text,
  },
  spacer: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  cancelButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
});
