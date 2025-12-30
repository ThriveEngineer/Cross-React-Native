import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, RefreshControl, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { FlashList } from '@shopify/flash-list';
import { TaskTile } from '../../src/components/TaskTile';
import { FloatingActionButton } from '../../src/components/FloatingActionButton';
import { CustomAppBar } from '../../src/components/CustomAppBar';
import { ViewSettingsSheet } from '../../src/components/ViewSettingsSheet';
import { MoveToFolderSheet } from '../../src/components/MoveToFolderSheet';
import { useTaskStore, useIncompleteTasks } from '../../src/store/taskStore';
import { notionAutoSync } from '../../src/services/notionService';
import { Colors, Spacing, FontSizes } from '../../src/constants/theme';
import { Task } from '../../src/types/types';
import { format, isToday, isTomorrow, parseISO, isValid } from 'date-fns';

interface DateGroup {
  label: string;
  date: Date | null;
  tasks: Task[];
}

// Flattened list item types for FlashList
type ListItem =
  | { type: 'header'; label: string }
  | { type: 'task'; task: Task; isFirst: boolean; isLast: boolean };

export default function UpcomingScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewSettingsVisible, setViewSettingsVisible] = useState(false);
  const [moveToFolderVisible, setMoveToFolderVisible] = useState(false);
  const {
    selectionMode,
    selectedTasks,
    deleteTasks,
    clearSelection,
  } = useTaskStore();
  const incompleteTasks = useIncompleteTasks();

  const selectedTaskIds = Array.from(selectedTasks);
  const hasSelection = selectedTaskIds.length > 0;

  const handleDeleteSelected = useCallback(() => {
    if (!hasSelection) return;

    Alert.alert(
      'Delete Tasks',
      `Are you sure you want to delete ${selectedTaskIds.length} task(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteTasks(selectedTaskIds);
            clearSelection();
          },
        },
      ]
    );
  }, [hasSelection, selectedTaskIds, deleteTasks, clearSelection]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await notionAutoSync.triggerImmediateSync();
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Group tasks by date and flatten for FlashList
  const flatListData = useMemo((): ListItem[] => {
    const groups = new Map<string, DateGroup>();

    // Group tasks by date label
    incompleteTasks.forEach(task => {
      let label = 'No Date';
      let date: Date | null = null;

      if (task.dueDate) {
        try {
          const parsedDate = parseISO(task.dueDate);
          if (isValid(parsedDate)) {
            date = parsedDate;
            if (isToday(parsedDate)) {
              label = 'Today';
            } else if (isTomorrow(parsedDate)) {
              label = 'Tomorrow';
            } else {
              label = format(parsedDate, 'EEEE, MMMM d');
            }
          }
        } catch {
          label = 'No Date';
        }
      }

      const existing = groups.get(label);
      if (existing) {
        existing.tasks.push(task);
      } else {
        groups.set(label, { label, date, tasks: [task] });
      }
    });

    // Sort groups: Today first, Tomorrow second, then by date, No Date last
    const sortedGroups = Array.from(groups.values()).sort((a, b) => {
      if (a.label === 'Today') return -1;
      if (b.label === 'Today') return 1;
      if (a.label === 'Tomorrow') return -1;
      if (b.label === 'Tomorrow') return 1;
      if (a.label === 'No Date') return 1;
      if (b.label === 'No Date') return -1;
      if (a.date && b.date) {
        return a.date.getTime() - b.date.getTime();
      }
      return 0;
    });

    // Flatten groups into a single array for FlashList
    const items: ListItem[] = [];
    sortedGroups.forEach(group => {
      items.push({ type: 'header', label: group.label });
      group.tasks.forEach((task, index) => {
        items.push({
          type: 'task',
          task,
          isFirst: index === 0,
          isLast: index === group.tasks.length - 1,
        });
      });
    });

    return items;
  }, [incompleteTasks]);

  // Render item for FlashList
  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      return <Text style={styles.dateHeader}>{item.label}</Text>;
    }
    return (
      <View style={[
        styles.taskWrapper,
        item.isFirst && styles.taskWrapperFirst,
        item.isLast && styles.taskWrapperLast,
      ]}>
        <TaskTile task={item.task} />
      </View>
    );
  }, []);

  // Key extractor for FlashList
  const keyExtractor = useCallback((item: ListItem) => {
    if (item.type === 'header') return `header-${item.label}`;
    return `task-${item.task.id}`;
  }, []);

  // Get item type for FlashList optimization
  const getItemType = useCallback((item: ListItem) => item.type, []);

  const openSettings = useCallback(() => {
    router.push('/settings');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomAppBar
        onOpenViewSettings={() => setViewSettingsVisible(true)}
        onOpenSettings={openSettings}
      />

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Upcoming</Text>
      </View>

      {flatListData.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyTitle}>No upcoming tasks</Text>
          <Text style={styles.emptySubtitle}>
            Create tasks with dates to see them here
          </Text>
        </View>
      ) : (
        <FlashList
          data={flatListData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemType={getItemType}
          estimatedItemSize={50}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.light.primary}
            />
          }
        />
      )}

      {/* FAB - always visible, changes based on selection mode */}
      <FloatingActionButton />

      {/* Selection Mode Action Buttons */}
      {selectionMode && (
        <View style={styles.selectionBarContainer}>
          <Pressable
            style={[styles.selectionActionButton, !hasSelection && styles.selectionActionDisabled]}
            onPress={() => hasSelection && setMoveToFolderVisible(true)}
            disabled={!hasSelection}
          >
            <Ionicons
              name="folder-outline"
              size={24}
              color={hasSelection ? Colors.light.text : Colors.light.textSecondary}
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
              color={hasSelection ? Colors.light.text : Colors.light.textSecondary}
            />
          </Pressable>
        </View>
      )}

      <ViewSettingsSheet
        visible={viewSettingsVisible}
        onClose={() => setViewSettingsVisible(false)}
      />
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
  headerRow: {
    paddingHorizontal: 25,
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  listContent: {
    paddingHorizontal: 25,
    paddingBottom: 100,
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
    marginTop: 16,
  },
  taskWrapper: {
    backgroundColor: '#F3F3F3',
  },
  taskWrapperFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 8,
  },
  taskWrapperLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingBottom: 8,
    marginBottom: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 8,
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
