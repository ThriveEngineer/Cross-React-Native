import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { TaskList } from '../../src/components/TaskList';
import { FloatingActionButton } from '../../src/components/FloatingActionButton';
import { EmptyState } from '../../src/components/EmptyState';
import { MoveToFolderSheet } from '../../src/components/MoveToFolderSheet';
import { useTaskStore } from '../../src/store/taskStore';
import { notionAutoSync } from '../../src/services/notionService';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';
import { Icon, FOLDER_ICON_MAP, IconName } from '../../src/components/Icon';

// Try to import GlassView for Liquid Glass effect
let GlassView: any = null;
let isLiquidGlassAvailable: () => boolean = () => false;

try {
  const glassModule = require('expo-glass-effect');
  GlassView = glassModule.GlassView;
  isLiquidGlassAvailable = glassModule.isLiquidGlassAvailable;
} catch (e) {
  // Glass effect not available
}

// Glass wrapper component for back button
const GlassBackButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const useGlass = Platform.OS === 'ios' && GlassView && isLiquidGlassAvailable();

  if (useGlass) {
    return (
      <Pressable onPress={onPress} hitSlop={10}>
        <GlassView style={styles.glassBackButton} glassEffectStyle="regular">
          <Icon name="chevron-back" size={24} color={Colors.light.text} />
        </GlassView>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} hitSlop={10} style={styles.backButton}>
      <Icon name="chevron-back" size={24} color={Colors.light.text} />
    </Pressable>
  );
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
  const iconName: IconName = folder?.icon
    ? (FOLDER_ICON_MAP[folder.icon] || 'folder')
    : 'folder';

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
      <GlassBackButton onPress={() => router.back()} />
      <View style={styles.headerCenter}>
        <Icon name={iconName} size={22} color={Colors.light.text} />
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
          icon="folder-open"
        />
        <FloatingActionButton defaultFolder={folderName} />
        {selectionMode && (
          <View style={styles.selectionBarContainer}>
            <Pressable
              style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
              onPress={() => hasSelection && setMoveToFolderVisible(true)}
              disabled={!hasSelection}
            >
              <Icon
                name="folder"
                size={24}
                color={hasSelection ? Colors.light.text : Colors.light.textSecondary}
              />
            </Pressable>
            <Pressable
              style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
              onPress={() => hasSelection && handleDeleteSelected()}
              disabled={!hasSelection}
            >
              <Icon
                name="trash"
                size={24}
                color={hasSelection ? Colors.light.text : Colors.light.textSecondary}
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
        <View style={styles.selectionBarContainer}>
          <Pressable
            style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
            onPress={() => hasSelection && setMoveToFolderVisible(true)}
            disabled={!hasSelection}
          >
            <Icon
              name="folder"
              size={24}
              color={hasSelection ? Colors.light.text : Colors.light.textSecondary}
            />
          </Pressable>
          <Pressable
            style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
            onPress={() => hasSelection && handleDeleteSelected()}
            disabled={!hasSelection}
          >
            <Icon
              name="trash"
              size={24}
              color={hasSelection ? Colors.light.text : Colors.light.textSecondary}
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
    backgroundColor: '#F2F2F7',
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
  glassBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  selectionBarContainer: {
    position: 'absolute',
    bottom: 16,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
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
