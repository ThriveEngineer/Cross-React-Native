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
    ? ((folder.icon + '-outline') as keyof typeof Ionicons.glyphMap)
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

  const Header = () => (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
      </Pressable>
      <View style={styles.headerCenter}>
        <Ionicons name={iconName} size={20} color={Colors.light.text} />
        <Text style={styles.title} numberOfLines={1}>
          {folderName}
        </Text>
      </View>
      <View style={styles.headerActions}>
        {selectionMode ? (
          <>
            <Pressable onPress={() => setMoveToFolderVisible(true)} hitSlop={10}>
              <Ionicons name="folder-outline" size={24} color={Colors.light.primary} />
            </Pressable>
            <Pressable onPress={handleDeleteSelected} hitSlop={10}>
              <Ionicons name="trash-outline" size={24} color={Colors.light.error} />
            </Pressable>
            <Pressable onPress={clearSelection} hitSlop={10}>
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </Pressable>
          </>
        ) : (
          <Text style={styles.taskCount}>{folderTasks.length}</Text>
        )}
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
});
