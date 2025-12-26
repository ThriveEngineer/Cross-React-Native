import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTaskStore } from '../store/taskStore';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

// Icon mapping for folders
const FOLDER_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  'inbox': 'mail-outline',
  'heart': 'heart-outline',
  'check-square': 'checkbox-outline',
  'folder': 'folder-outline',
  'star': 'star-outline',
  'bookmark': 'bookmark-outline',
  'flag': 'flag-outline',
  'briefcase': 'briefcase-outline',
  'home': 'home-outline',
  'cart': 'cart-outline',
  'gift': 'gift-outline',
  'bulb': 'bulb-outline',
  'fitness': 'fitness-outline',
  'musical-notes': 'musical-notes-outline',
  'camera': 'camera-outline',
  'airplane': 'airplane-outline',
  'car': 'car-outline',
  'restaurant': 'restaurant-outline',
  'cafe': 'cafe-outline',
  'medical': 'medical-outline',
  'school': 'school-outline',
  'library': 'library-outline',
};

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

  const handleFolderSelect = useCallback((folderName: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    moveTasksToFolder(taskIds, folderName);
    clearSelection();
    onClose();
    onMoveComplete?.();
  }, [taskIds, moveTasksToFolder, clearSelection, onClose, onMoveComplete]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={e => e.stopPropagation()}>
          <View style={styles.dragHandle} />

          <Text style={styles.title}>Move to folder</Text>
          <Text style={styles.subtitle}>
            {taskIds.length} task{taskIds.length !== 1 ? 's' : ''} selected
          </Text>

          <ScrollView
            style={styles.folderList}
            showsVerticalScrollIndicator={false}
          >
            {availableFolders.map((folder) => {
              const iconName = FOLDER_ICON_MAP[folder.icon] || 'folder-outline';
              return (
                <Pressable
                  key={folder.id}
                  style={styles.folderRow}
                  onPress={() => handleFolderSelect(folder.name)}
                >
                  <Ionicons name={iconName} size={24} color={Colors.light.text} />
                  <Text style={styles.folderName}>{folder.name}</Text>
                  <View style={styles.spacer} />
                  <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
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
  content: {
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
