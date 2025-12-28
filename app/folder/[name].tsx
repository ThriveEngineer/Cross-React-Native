import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { TaskList } from '../../src/components/TaskList';
import { FloatingActionButton } from '../../src/components/FloatingActionButton';
import { EmptyState } from '../../src/components/EmptyState';
import { MoveToFolderSheet } from '../../src/components/MoveToFolderSheet';
import { useTaskStore } from '../../src/store/taskStore';
import { notionAutoSync } from '../../src/services/notionService';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';

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

export default function FolderDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const folderName = decodeURIComponent(name || 'Inbox');

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [moveToFolderVisible, setMoveToFolderVisible] = useState(false);

  const {
    tasks,
    folders,
    selectionMode,
    selectedTasks,
    toggleSelectionMode,
    toggleTaskSelection,
    deleteTasks,
    moveTasksToFolder,
    clearSelection,
    sortOption,
  } = useTaskStore();

  // Get tasks for this folder
  const folderTasks = useMemo(() => {
    let filtered = tasks.filter(t => t.folder === folderName);

    // Sort based on sort option
    switch (sortOption) {
      case 'name':
        filtered = [...filtered].sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
        break;
      case 'date':
        filtered = [...filtered].sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case 'folder':
        // Already filtered by folder, no additional sorting needed
        break;
      default:
        // manual - preserve original order
        break;
    }

    return filtered;
  }, [tasks, folderName, sortOption]);

  // Get folder info
  const folder = folders.find(f => f.name === folderName);
  const iconName = folder?.icon
    ? (FOLDER_ICON_MAP[folder.icon] || 'folder-outline')
    : 'folder-outline';

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await notionAutoSync.triggerImmediateSync();
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const selectedIds = Array.from(selectedTasks);
    if (selectedIds.length === 0) return;

    Alert.alert(
      'Delete Tasks',
      `Are you sure you want to delete ${selectedIds.length} task(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteTasks(selectedIds);
            clearSelection();
          },
        },
      ]
    );
  }, [selectedTasks, deleteTasks, clearSelection]);

  const handleMoveSelected = useCallback(
    (targetFolder: string) => {
      const selectedIds = Array.from(selectedTasks);
      if (selectedIds.length === 0) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      moveTasksToFolder(selectedIds, targetFolder);
      clearSelection();
    },
    [selectedTasks, moveTasksToFolder, clearSelection]
  );

  const hasSelection = selectedTasks.size > 0;

  const Header = () => (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
      </Pressable>
      <View style={styles.headerCenter}>
        <Ionicons name={iconName} size={22} color={Colors.light.text} />
        <Text style={styles.title} numberOfLines={1}>
          {folderName}
        </Text>
      </View>
      <View style={styles.headerActions}>
        <Text style={styles.taskCount}>{folderTasks.length}</Text>
      </View>
    </View>
  );

  const selectedTaskIds = Array.from(selectedTasks);

  if (folderTasks.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header />
        <EmptyState
          title={`No tasks in ${folderName}`}
          subtitle="Add tasks to this folder to see them here"
          icon="folder-open-outline"
        />
        <FloatingActionButton defaultFolder={folderName} />
        {selectionMode && (
          <View style={styles.selectionActionsContainer}>
            <Pressable
              style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
              onPress={() => hasSelection && setMoveToFolderVisible(true)}
              disabled={!hasSelection}
            >
              <Ionicons
                name="folder-outline"
                size={24}
                color={hasSelection ? Colors.light.primary : Colors.light.textSecondary}
              />
            </Pressable>
            <Pressable
              style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
              onPress={() => hasSelection && handleDeleteSelected()}
              disabled={!hasSelection}
            >
              <Ionicons
                name="trash-outline"
                size={24}
                color={hasSelection ? Colors.light.error : Colors.light.textSecondary}
              />
            </Pressable>
          </View>
        )}
        <MoveToFolderSheet
          visible={moveToFolderVisible}
          onClose={() => setMoveToFolderVisible(false)}
          taskIds={selectedTaskIds}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />
      <TaskList
        tasks={folderTasks}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        emptyMessage={`No tasks in ${folderName}`}
      />
      <FloatingActionButton defaultFolder={folderName} />
      {selectionMode && (
        <View style={styles.selectionActionsContainer}>
          <Pressable
            style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
            onPress={() => hasSelection && setMoveToFolderVisible(true)}
            disabled={!hasSelection}
          >
            <Ionicons
              name="folder-outline"
              size={24}
              color={hasSelection ? Colors.light.primary : Colors.light.textSecondary}
            />
          </Pressable>
          <Pressable
            style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
            onPress={() => hasSelection && handleDeleteSelected()}
            disabled={!hasSelection}
          >
            <Ionicons
              name="trash-outline"
              size={24}
              color={hasSelection ? Colors.light.error : Colors.light.textSecondary}
            />
          </Pressable>
        </View>
      )}
      <MoveToFolderSheet
        visible={moveToFolderVisible}
        onClose={() => setMoveToFolderVisible(false)}
        taskIds={selectedTaskIds}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.light.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minWidth: 40,
    justifyContent: 'flex-end',
  },
  taskCount: {
    fontSize: FontSizes.sm,
    color: Colors.light.textSecondary,
    backgroundColor: Colors.light.cardBackground,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  selectionActionsContainer: {
    position: 'absolute',
    bottom: 16,
    right: 88,
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  selectionActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionActionDisabled: {
    opacity: 0.5,
  },
});
